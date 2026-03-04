import { describe, it, expect } from 'vitest';
import { can, ANONYMOUS } from '@verevoir/access';
import type { Identity } from '@verevoir/access';
import { conferencePolicy } from '@/access/policy';

const organiser: Identity = {
  id: 'org-1',
  roles: ['organiser'],
  metadata: {},
};

const delegate: Identity = {
  id: 'del-1',
  roles: ['delegate'],
  metadata: {},
};

const viewer: Identity = {
  id: 'view-1',
  roles: ['viewer'],
  metadata: {},
};

describe('conferencePolicy', () => {
  it('organiser can create without context', () => {
    expect(can(conferencePolicy, organiser, 'create')).toBe(true);
  });

  it('organiser can read', () => {
    expect(can(conferencePolicy, organiser, 'read')).toBe(true);
  });

  it('organiser can update without context', () => {
    expect(can(conferencePolicy, organiser, 'update')).toBe(true);
  });

  it('organiser can delete without context', () => {
    expect(can(conferencePolicy, organiser, 'delete')).toBe(true);
  });

  it('delegate cannot create without ownerId context', () => {
    expect(can(conferencePolicy, delegate, 'create')).toBe(false);
  });

  it('delegate can read', () => {
    expect(can(conferencePolicy, delegate, 'read')).toBe(true);
  });

  it('delegate cannot update without ownerId context', () => {
    expect(can(conferencePolicy, delegate, 'update')).toBe(false);
  });

  it('delegate cannot delete without ownerId context', () => {
    expect(can(conferencePolicy, delegate, 'delete')).toBe(false);
  });

  it('viewer can read', () => {
    expect(can(conferencePolicy, viewer, 'read')).toBe(true);
  });

  it('viewer cannot create', () => {
    expect(can(conferencePolicy, viewer, 'create')).toBe(false);
  });

  it('ANONYMOUS cannot create', () => {
    expect(can(conferencePolicy, ANONYMOUS, 'create')).toBe(false);
  });

  it('ANONYMOUS can read (viewer role)', () => {
    expect(can(conferencePolicy, ANONYMOUS, 'read')).toBe(true);
  });
});
