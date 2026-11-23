# Security Specification — 목포덕인고등학교 능력치 향상 프로그램

## 1. Data Invariants
1. **Owner-Only PII Isolation**: `/users/{userId}` holds Google account PII (`email`, `displayName`, `photoURL`) and is readable/writable strictly by `request.auth.uid == userId`.
2. **Initial Rank E Guarantee**: On `/students/{userId}` creation, `grade` MUST equal `"E"`, `totalScore` MUST equal `60` (10 per stat across 6 stats), `completedCount` MUST equal `0`, and all completion lists MUST be empty.
3. **Stat Integrity & Bounds**: Every stat in `stats` (`academics`, `fitness`, `social`, `leadership`, `creativity`, `mental`) must be an integer between `10` and `9999`, and `totalScore` must match the sum of the 6 stats.
4. **Action-Scoped Updates**: `/students/{userId}` updates are partitioned into two explicit actions:
   - `updateProfile`: only `studentNumber`, `name`, `updatedAt` may change.
   - `completeMission`: only `grade`, `totalScore`, `completedCount`, `stats`, `dailyKey`, `dailyCompleted`, `weeklyKey`, `weeklyCompleted`, `monthlyKey`, `monthlyCompleted`, `updatedAt` may change, and `completedCount` must increment by exactly `1` (or stay `>= existing().completedCount`) and `totalScore >= existing().totalScore`.
5. **Array Size Boundaries**: `dailyCompleted.size() <= 12`, `weeklyCompleted.size() <= 6`, `monthlyCompleted.size() <= 3`.
6. **Master Gate & Immutability**: `/students/{userId}/logs/{logId}` requires parent `/students/{userId}` ownership (`uid == request.auth.uid`) and is append-only (no client `update` or `delete`).
7. **Server Timestamps**: `createdAt == request.time` on create; `updatedAt == request.time` on update; `createdAt` and `uid` are immutable.

## 2. The "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated read/write** to `/students/uid1`.
2. **Cross-user read** of `/users/otherUid` or `/students/otherUid`.
3. **Self-assigned S rank on creation**: creating `/students/uid1` with `grade: "S"`, `totalScore: 9999`.
4. **Shadow/ghost field injection**: creating `/students/uid1` with extra `isAdmin: true`.
5. **Unverified email write**: writing with `request.auth.token.email_verified == false`.
6. **Identity spoofing**: creating `/students/uid1` with `uid: "otherUid"`.
7. **ID poisoning**: creating `/students/uid1/logs/../../bad` or `>128` char ID.
8. **Client timestamp forgery**: creating `/students/uid1` with hardcoded `createdAt` instead of `request.time`.
9. **Immutable field mutation**: updating `/students/uid1` to change `createdAt` or `uid`.
10. **Array overflow / DoW**: updating `dailyCompleted` with 13 items (`> 12` limit) or oversized string (`> 40` chars).
11. **Profile update smuggling**: changing `grade` or `stats` while modifying `name` without mission completion bounds, or modifying `completedCount` downwards.
12. **Log tampering**: updating or deleting an existing `/students/uid1/logs/log1` document.
