import { defineWorkflow, hasRole, or } from '@verevoir/access';

export const talkPublishing = defineWorkflow({
  name: 'talk-publishing',
  states: ['draft', 'published'],
  initial: 'draft',
  transitions: [
    { from: 'draft', to: 'published', guard: hasRole('organiser') },
    { from: 'published', to: 'draft', guard: hasRole('organiser') },
  ],
});

export const pagePublishing = defineWorkflow({
  name: 'page-publishing',
  states: ['draft', 'published', 'archived'],
  initial: 'draft',
  transitions: [
    { from: 'draft', to: 'published', guard: hasRole('organiser') },
    { from: 'published', to: 'draft', guard: hasRole('organiser') },
  ],
});

export const blogPublishing = defineWorkflow({
  name: 'blog-publishing',
  states: ['draft', 'review', 'published', 'archived'],
  initial: 'draft',
  transitions: [
    { from: 'draft', to: 'review', guard: hasRole('organiser') },
    { from: 'review', to: 'published', guard: hasRole('organiser') },
    { from: 'review', to: 'draft', guard: hasRole('organiser') },
    { from: 'published', to: 'archived', guard: hasRole('organiser') },
  ],
});

export const conferenceLifecycle = defineWorkflow({
  name: 'conference-lifecycle',
  states: [
    'setup',
    'cfp',
    'cfp-review',
    'voting',
    'curation',
    'registration',
    'pre-conference',
    'live',
    'archive',
  ],
  initial: 'setup',
  transitions: [
    { from: 'setup', to: 'cfp', guard: hasRole('organiser') },
    { from: 'cfp', to: 'cfp-review', guard: hasRole('organiser') },
    { from: 'cfp-review', to: 'voting', guard: hasRole('organiser') },
    { from: 'voting', to: 'curation', guard: hasRole('organiser') },
    { from: 'curation', to: 'registration', guard: hasRole('organiser') },
    { from: 'registration', to: 'pre-conference', guard: hasRole('organiser') },
    { from: 'pre-conference', to: 'live', guard: hasRole('organiser') },
    { from: 'live', to: 'archive', guard: hasRole('organiser') },
  ],
});

export const proposalWorkflow = defineWorkflow({
  name: 'proposal-workflow',
  states: [
    'draft',
    'submitted',
    'flagged',
    'accepted',
    'rejected',
    'changes-requested',
  ],
  initial: 'draft',
  transitions: [
    {
      from: 'draft',
      to: 'submitted',
      guard: or(hasRole('presenter'), hasRole('organiser')),
    },
    { from: 'submitted', to: 'accepted', guard: hasRole('organiser') },
    { from: 'submitted', to: 'rejected', guard: hasRole('organiser') },
    {
      from: 'submitted',
      to: 'changes-requested',
      guard: hasRole('organiser'),
    },
    { from: 'submitted', to: 'flagged', guard: hasRole('organiser') },
    { from: 'flagged', to: 'accepted', guard: hasRole('organiser') },
    { from: 'flagged', to: 'rejected', guard: hasRole('organiser') },
    {
      from: 'changes-requested',
      to: 'submitted',
      guard: or(hasRole('presenter'), hasRole('organiser')),
    },
    {
      from: 'changes-requested',
      to: 'draft',
      guard: or(hasRole('presenter'), hasRole('organiser')),
    },
  ],
});
