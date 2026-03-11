import { defineBlock, text, select } from '@verevoir/schema';

export const CONFERENCE_PHASES = [
  'setup',
  'cfp',
  'cfp-review',
  'voting',
  'curation',
  'registration',
  'pre-conference',
  'live',
  'archive',
] as const;

export type ConferencePhase = (typeof CONFERENCE_PHASES)[number];

export const config = defineBlock({
  name: 'config',
  fields: {
    conferenceName: text('Conference Name'),
    tagline: text('Tagline').optional(),
    date: text('Date'),
    venue: text('Venue'),
    phase: select('Phase', [...CONFERENCE_PHASES]).default('setup'),
    maxProposalsPerSpeaker: text('Max Proposals Per Speaker').default('3'),
  },
});
