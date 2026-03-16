# School Management System — KIDS' FOUNDATION SCHOOL

## Current State
Admission numbers are generated using `10000 + feeRecords.size()`. This causes a permanent collision once any admission number matches an existing map key — subsequent inserts overwrite that record instead of creating a new one, so `feeRecords.size()` never grows beyond the point of collision and every new student silently overwrites the same record.

## Requested Changes (Diff)

### Add
- A persistent `var lastAdmissionNumber : Nat` counter initialised to `0`.
- Duplicate-check guard: before inserting, assert the generated key is not already in `feeRecords`.

### Modify
- `generateAdmissionNumber` — replace `feeRecords.size()` logic with: increment `lastAdmissionNumber` by 1, then return `"KDS/ADM/" # Nat.toText(lastAdmissionNumber)`.
- `addAdmissionRecord` — call the updated generator so the counter is mutated at call time.

### Remove
- Old `randomNumber = 10000 + feeRecords.size()` expression.

## Implementation Plan
1. Declare `var lastAdmissionNumber : Nat = 0` at actor level (stable-compatible via `var`).
2. Rewrite `generateAdmissionNumber` to mutate and return the counter.
3. Add a guard in `addAdmissionRecord` that traps if the generated admission number already exists (should never happen, but prevents silent overwrites).
4. No frontend changes required — the admission number is returned from the backend and displayed as-is.
