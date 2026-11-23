/**
 * Security Rule Verification Scenarios (Dirty Dozen)
 * Covers identity spoofing, rank E initialization lock, shadow fields,
 * array bounds, immutable timestamps, and subcollection Master Gate checks.
 */

export interface SecurityTestCase {
  id: string;
  description: string;
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  expected: 'PERMISSION_DENIED';
  payload?: Record<string, unknown>;
}

export const dirtyDozenCases: SecurityTestCase[] = [
  {
    id: 'DD-01',
    description: 'Unauthenticated read on student profile',
    path: '/students/studentA',
    operation: 'get',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-02',
    description: 'Cross-user PII read on /users/{otherUid}',
    path: '/users/studentB',
    operation: 'get',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-03',
    description: 'Rank bypass on creation (creating with grade S instead of E)',
    path: '/students/studentA',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { grade: 'S', totalScore: 1200 },
  },
  {
    id: 'DD-04',
    description: 'Shadow field injection (isAdmin: true)',
    path: '/students/studentA',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { uid: 'studentA', isAdmin: true },
  },
  {
    id: 'DD-05',
    description: 'Unverified email write attempt',
    path: '/students/studentA',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-06',
    description: 'Identity spoofing (uid mismatch with auth.uid)',
    path: '/students/studentA',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { uid: 'studentB' },
  },
  {
    id: 'DD-07',
    description: 'Path variable poisoning (oversized or invalid ID)',
    path: '/students/studentA/logs/bad$id',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-08',
    description: 'Client-forged createdAt timestamp instead of serverTimestamp',
    path: '/students/studentA',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { createdAt: '2025-01-01T00:00:00Z' },
  },
  {
    id: 'DD-09',
    description: 'Immutable createdAt mutation on update',
    path: '/students/studentA',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-10',
    description: 'Daily mission array overflow (> 12 items)',
    path: '/students/studentA',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-11',
    description: 'Stat reduction or negative gain tampering',
    path: '/students/studentA',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-12',
    description: 'Mutating or deleting immutable mission logs',
    path: '/students/studentA/logs/log1',
    operation: 'delete',
    expected: 'PERMISSION_DENIED',
  },
];
