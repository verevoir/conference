import { defineWorkflow, hasRole } from '@verevoir/access';

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
