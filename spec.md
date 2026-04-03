# KIDS' FOUNDATION SCHOOL – Parent Portal

## Current State

The app is a full School Management System with admin login, admissions, fee management, search, reports, and exports. All backend query functions require authenticated users (staff or admin role). There is no public-facing portal for parents.

## Requested Changes (Diff)

### Add
- A new public backend query function `getStudentInfoForParent(admissionNumber)` that returns student details + monthly fee payments without requiring any authentication — available to any caller including anonymous.
- A new `ParentPortal` page in the frontend, accessible at a `/parent` route without login.
- A link/button on the Admin Login page and the main Header to open the Parent Portal.
- The Parent Portal shows: enter admission number → fetch and display student card with full details and monthly fee status (paid = green, pending = red).

### Modify
- `src/backend/main.mo` — add one new `public query` function `getStudentInfoForParent` that does NOT check caller permissions (anonymous-accessible), returns a result type with student data + monthly payments.
- `src/frontend/src/App.tsx` — add `"parent"` to ViewType and render ParentPortal without requiring admin login.
- `src/frontend/src/components/Header.tsx` — add a "Parent Portal" nav link visible always.
- `src/frontend/src/pages/AdminLogin.tsx` — add a "Parent Portal" link at the bottom.

### Remove
- Nothing

## Implementation Plan

1. **Backend**: Add `getStudentInfoForParent(admissionNumber: AdmissionNumber)` as a public query with no auth check. Returns `?ParentStudentInfo` (optional — null if not found). The return type includes: studentName, fatherName, motherName, admittedClass, gender, dateOfBirth, address, phoneNumber, admissionDate, admissionAmount, isFreeStudent, and monthlyPayments (all 12 months as Nat).
2. **Frontend bindings**: Update `backend.d.ts` and `backend.did.js` to include the new function.
3. **ParentPortal page**: Clean page with school logo and branding at top, an input for Admission Number, a Search button, and a student info card. Monthly fees displayed as a 12-month grid — green if paid (>0), red if not paid (=0). Free student badge shown if applicable. No edit/delete actions.
4. **App.tsx**: Add `"parent"` ViewType. The parent portal is accessible without admin login — show it before the `!isAdminLoggedIn` check.
5. **Header**: Add "Parent Portal" button in nav.
6. **AdminLogin**: Add a subtle "Parent Portal" link at the bottom.
7. Footer branding preserved on all pages.
