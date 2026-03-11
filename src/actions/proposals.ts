'use server';

import { cookies } from 'next/headers';
import { ensureDb } from '@/server/db';
import { requireOrganiser } from '@/server/require-organiser';
import { requirePresenterOrOrganiser } from '@/server/require-authenticated';
import { getPhase } from '@/server/phase';
import { getLlmClient } from '@/server/llm';
import {
  serializeDocument,
  serializeDocuments,
  type SerializedDocument,
} from '@/lib/serialization';
import { logger } from '@/server/logger';
import type { ListOptions } from '@verevoir/storage';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value ?? null;
}

/** Create a new talk proposal. Presenter or organiser, CFP phase only. */
export async function createProposal(
  data: Record<string, unknown>,
): Promise<SerializedDocument> {
  const identity = await requirePresenterOrOrganiser(await getToken());
  const phase = await getPhase();

  if (phase !== 'cfp' && !identity.roles.includes('organiser')) {
    throw new Error('Proposals can only be submitted during the CFP phase');
  }

  const db = await ensureDb();

  // Check proposal limit for presenters
  if (identity.roles.includes('presenter')) {
    const configs = await db.list('config', { limit: 1 });
    const maxProposals =
      configs.length > 0
        ? parseInt(
            String(
              (configs[0].data as { maxProposalsPerSpeaker?: string })
                .maxProposalsPerSpeaker ?? '3',
            ),
            10,
          )
        : 3;

    const existing = await db.list('talk-proposal', {
      where: { createdBy: identity.id },
    });
    if (existing.length >= maxProposals) {
      throw new Error(`You can submit a maximum of ${maxProposals} proposals`);
    }
  }

  const doc = await db.create('talk-proposal', {
    ...data,
    status: 'draft',
    createdBy: identity.id,
  });

  logger.info('Proposal created', {
    action: 'createProposal',
    documentId: doc.id,
    userId: identity.id,
  });

  return serializeDocument(doc);
}

/** Update a talk proposal. Owner or organiser only. */
export async function updateProposal(
  id: string,
  data: Record<string, unknown>,
): Promise<SerializedDocument> {
  const identity = await requirePresenterOrOrganiser(await getToken());
  const db = await ensureDb();
  const existing = await db.get(id);

  if (!existing) throw new Error('Proposal not found');

  const isOwner =
    (existing.data as { createdBy?: string }).createdBy === identity.id;
  const isOrganiser = identity.roles.includes('organiser');

  if (!isOwner && !isOrganiser) {
    throw new Error('Unauthorized');
  }

  // Presenters can only edit draft or changes-requested proposals
  if (!isOrganiser) {
    const status = (existing.data as { status?: string }).status;
    if (status !== 'draft' && status !== 'changes-requested') {
      throw new Error('You can only edit draft or changes-requested proposals');
    }
  }

  const doc = await db.update(id, {
    ...existing.data,
    ...data,
    createdBy: (existing.data as { createdBy?: string }).createdBy,
  });

  logger.info('Proposal updated', {
    action: 'updateProposal',
    documentId: doc.id,
  });

  return serializeDocument(doc);
}

/** Submit a proposal for review. Sets status to 'submitted'. */
export async function submitProposal(id: string): Promise<SerializedDocument> {
  const identity = await requirePresenterOrOrganiser(await getToken());
  const db = await ensureDb();
  const existing = await db.get(id);

  if (!existing) throw new Error('Proposal not found');

  const isOwner =
    (existing.data as { createdBy?: string }).createdBy === identity.id;
  const isOrganiser = identity.roles.includes('organiser');

  if (!isOwner && !isOrganiser) {
    throw new Error('Unauthorized');
  }

  const status = (existing.data as { status?: string }).status;
  if (status !== 'draft' && status !== 'changes-requested') {
    throw new Error('Can only submit draft or changes-requested proposals');
  }

  const doc = await db.update(id, {
    ...existing.data,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
  });

  logger.info('Proposal submitted', {
    action: 'submitProposal',
    documentId: doc.id,
  });

  return serializeDocument(doc);
}

/** Review a proposal — accept, reject, flag, or request changes. Organiser only. */
export async function reviewProposal(
  id: string,
  decision: 'accepted' | 'rejected' | 'flagged' | 'changes-requested',
): Promise<SerializedDocument> {
  await requireOrganiser(await getToken());
  const db = await ensureDb();
  const existing = await db.get(id);

  if (!existing) throw new Error('Proposal not found');

  const status = (existing.data as { status?: string }).status;
  if (status !== 'submitted' && status !== 'flagged') {
    throw new Error(`Cannot transition from ${status} to ${decision}`);
  }

  const doc = await db.update(id, {
    ...existing.data,
    status: decision,
  });

  logger.info('Proposal reviewed', {
    action: 'reviewProposal',
    documentId: doc.id,
    decision,
  });

  return serializeDocument(doc);
}

/** Run LLM analysis on a proposal. Returns précis and flags. Organiser only. */
export async function analyzeProposal(
  id: string,
): Promise<{ precis: string; flags: string }> {
  await requireOrganiser(await getToken());
  const client = getLlmClient();
  if (!client) {
    throw new Error('LLM not configured (no ANTHROPIC_API_KEY)');
  }

  const db = await ensureDb();
  const proposal = await db.get(id);
  if (!proposal) throw new Error('Proposal not found');

  const data = proposal.data as Record<string, unknown>;

  // Fetch all other proposals for duplicate detection
  const allProposals = await db.list('talk-proposal');
  const otherTitles = allProposals
    .filter((p) => p.id !== id)
    .map((p) => `- ${(p.data as { title?: string }).title ?? 'Untitled'}`)
    .join('\n');

  // Fetch tracks for scope matching
  const tracks = await db.list('track');
  const trackList = tracks
    .map((t) => `- ${(t.data as { name?: string }).name ?? 'Unknown'}`)
    .join('\n');

  const prompt = `You are reviewing a talk proposal for a technology conference.

PROPOSAL:
Title: ${data.title ?? ''}
Abstract: ${data.abstract ?? ''}
Track: ${data.trackId ?? 'Not specified'}
Level: ${data.level ?? 'Not specified'}
Duration: ${data.duration ?? 'Not specified'} minutes

OTHER SUBMITTED PROPOSALS:
${otherTitles || 'None yet'}

AVAILABLE TRACKS:
${trackList || 'None defined'}

Provide TWO sections:

PRÉCIS:
Write a 2-3 sentence summary of this talk suitable for a conference programme.

FLAGS:
List any concerns. Check for:
- Duplicate or very similar proposals already submitted
- Unclear or vague abstract
- Scope mismatch with available tracks
- Missing key information
- Unrealistic duration for the topic
- Any other quality concerns

If there are no concerns, write "No issues found."

Return ONLY the two sections. No preamble.`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse sections
    const precisMatch = text.match(/PR[ÉE]CIS:\s*([\s\S]*?)(?=FLAGS:|$)/i);
    const flagsMatch = text.match(/FLAGS:\s*([\s\S]*?)$/i);

    const precis = precisMatch ? precisMatch[1].trim() : text.trim();
    const flags = flagsMatch ? flagsMatch[1].trim() : '';

    // Save analysis to proposal
    await db.update(id, {
      ...proposal.data,
      llmPrecis: precis,
      llmFlags: flags,
      status:
        flags && !flags.toLowerCase().includes('no issues found')
          ? 'flagged'
          : (proposal.data as { status?: string }).status,
    });

    logger.info('Proposal analyzed', {
      action: 'analyzeProposal',
      documentId: id,
      hasFlaggedIssues:
        flags && !flags.toLowerCase().includes('no issues found'),
    });

    return { precis, flags };
  } catch (err) {
    logger.error('Proposal analysis failed', {
      action: 'analyzeProposal',
      documentId: id,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

/** Get proposals owned by the current user. */
export async function getMyProposals(): Promise<SerializedDocument[]> {
  const identity = await requirePresenterOrOrganiser(await getToken());
  const db = await ensureDb();
  const docs = await db.list('talk-proposal', {
    where: { createdBy: identity.id },
  });
  return serializeDocuments(docs);
}

/** List proposals. Organisers see all; during voting phase, everyone sees submitted+accepted. */
export async function listProposals(
  options?: ListOptions,
): Promise<SerializedDocument[]> {
  const db = await ensureDb();
  const docs = await db.list('talk-proposal', options);
  return serializeDocuments(docs);
}

/** Get a single proposal. */
export async function getProposal(
  id: string,
): Promise<SerializedDocument | null> {
  const db = await ensureDb();
  const doc = await db.get(id);
  if (!doc || doc.blockType !== 'talk-proposal') return null;
  return serializeDocument(doc);
}

/** Delete a proposal. Owner (draft only) or organiser. */
export async function deleteProposal(id: string): Promise<void> {
  const identity = await requirePresenterOrOrganiser(await getToken());
  const db = await ensureDb();
  const existing = await db.get(id);

  if (!existing) throw new Error('Proposal not found');

  const isOwner =
    (existing.data as { createdBy?: string }).createdBy === identity.id;
  const isOrganiser = identity.roles.includes('organiser');

  if (!isOrganiser && !isOwner) {
    throw new Error('Unauthorized');
  }

  if (
    !isOrganiser &&
    (existing.data as { status?: string }).status !== 'draft'
  ) {
    throw new Error('You can only delete draft proposals');
  }

  await db.delete(id);

  logger.info('Proposal deleted', {
    action: 'deleteProposal',
    documentId: id,
  });
}

/** Accept a proposal and create a corresponding talk document. Organiser only, curation phase. */
export async function promoteToTalk(
  proposalId: string,
): Promise<SerializedDocument> {
  await requireOrganiser(await getToken());
  const db = await ensureDb();
  const proposal = await db.get(proposalId);

  if (!proposal) throw new Error('Proposal not found');

  const data = proposal.data as Record<string, unknown>;
  if (data.status !== 'accepted') {
    throw new Error('Only accepted proposals can be promoted to talks');
  }

  const talk = await db.create('talk', {
    title: data.title,
    abstract: data.abstract,
    speakerId: data.speakerId,
    trackId: data.trackId,
    duration: data.duration,
    level: data.level,
    status: 'draft',
  });

  logger.info('Proposal promoted to talk', {
    action: 'promoteToTalk',
    proposalId,
    talkId: talk.id,
  });

  return serializeDocument(talk);
}
