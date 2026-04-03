# School Management System - KIDS' FOUNDATION SCHOOL

## Current State
Admission numbers are generated using `lastAdmissionNumber` (stable var initialized to 10423). This counter resets to its initial value on fresh deployments, causing new admissions to start from KFS/ADM/1 instead of continuing from KFS/ADM/10424.

## Requested Changes (Diff)

### Add
- `admissionSeed` mutable variable for pseudo-random entropy
- Unique 5-digit random number check loop in `generateAdmissionNumber`

### Modify
- `generateAdmissionNumber` function: replace sequential counter with time-based pseudo-random 5-digit number (10000–99999), with duplicate check loop

### Remove
- Dependency on `lastAdmissionNumber` sequential counter for new admissions

## Implementation Plan
1. Add `var admissionSeed : Nat = 0` for entropy tracking
2. Rewrite `generateAdmissionNumber` to use `Time.now()` + admissionSeed to produce values in range 10000–99999
3. Loop until a unique (non-duplicate) admission number is found
4. Format as `KFS/ADM/XXXXX`
5. No other changes to backend or frontend
