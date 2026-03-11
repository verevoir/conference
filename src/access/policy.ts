import { definePolicy } from '@verevoir/access';

export const conferencePolicy = definePolicy({
  rules: [
    { role: 'organiser', actions: ['create', 'read', 'update', 'delete'] },
    { role: 'presenter', actions: ['read'] },
    {
      role: 'presenter',
      actions: ['create', 'update', 'delete'],
      scope: 'own',
    },
    { role: 'delegate', actions: ['read'] },
    { role: 'delegate', actions: ['create', 'update', 'delete'], scope: 'own' },
    { role: 'viewer', actions: ['read'] },
  ],
});
