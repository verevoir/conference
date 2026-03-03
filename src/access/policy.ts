import { definePolicy } from '@nextlake/access';

export const conferencePolicy = definePolicy({
  rules: [
    { role: 'organiser', actions: ['create', 'read', 'update', 'delete'] },
    { role: 'delegate', actions: ['read'] },
    { role: 'delegate', actions: ['create', 'update', 'delete'], scope: 'own' },
    { role: 'viewer', actions: ['read'] },
  ],
});
