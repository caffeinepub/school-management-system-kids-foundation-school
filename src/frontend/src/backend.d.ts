import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export type ClassName = string;
export interface MonthlyPayments {
    may: bigint;
    march: bigint;
    april: bigint;
    november: bigint;
    july: bigint;
    june: bigint;
    february: bigint;
    september: bigint;
    august: bigint;
    january: bigint;
    october: bigint;
    december: bigint;
}
export interface MonthlyPaymentPure {
    may: bigint;
    march: bigint;
    april: bigint;
    november: bigint;
    july: bigint;
    june: bigint;
    february: bigint;
    september: bigint;
    august: bigint;
    january: bigint;
    october: bigint;
    december: bigint;
}
export interface AdminProfilePure {
    name: string;
}
export type Month = string;
export interface StudentAdmissionPure {
    studentName: string;
    dateOfBirth: Time;
    admissionDate: Time;
    isFreeStudent: boolean;
    motherName: string;
    admissionNumber: AdmissionNumber;
    fatherName: string;
    admittedClass: ClassName;
    address: string;
    gender: Gender;
    admissionAmount: bigint;
    fatherAadhaarNumber: string;
    aadhaarNumber: string;
    photo?: ExternalBlob;
    phoneNumber: string;
    motherAadhaarNumber: string;
}
export interface ClassWiseFeesExportRecord {
    paymentStatus: boolean;
    studentName: string;
    feeMonth: Month;
    completeAddress: string;
    parentContactNumber: string;
    motherName: string;
    admissionNumber: AdmissionNumber;
    amountPaid: bigint;
    fatherName: string;
    className: ClassName;
}
export type UserProfilePure = {
    __kind__: "admin";
    admin: AdminProfilePure;
} | {
    __kind__: "staff";
    staff: StaffProfilePure;
};
export interface PendingFeeRecord {
    month: Month;
    paymentStatus: boolean;
    studentName: string;
    admissionNumber: AdmissionNumber;
    className: ClassName;
}
export interface StudentAdmissionPersist {
    studentName: string;
    dateOfBirth: Time;
    admissionDate: Time;
    isFreeStudent: boolean;
    motherName: string;
    admissionNumber: AdmissionNumber;
    fatherName: string;
    admittedClass: ClassName;
    address: string;
    gender: Gender;
    admissionAmount: bigint;
    fatherAadhaarNumber: string;
    aadhaarNumber: string;
    photo?: ExternalBlob;
    phoneNumber: string;
    motherAadhaarNumber: string;
}
export interface FeeRecordPure {
    paidMonths: Array<Month>;
    studentAdmission: StudentAdmissionPure;
    monthlyPayments: MonthlyPaymentPure;
}
export interface FeeExportRecord {
    month: Month;
    paymentStatus: boolean;
    studentName: string;
    completeAddress: string;
    parentContactNumber: string;
    feeType: string;
    motherName: string;
    admissionNumber: AdmissionNumber;
    amountPaid: bigint;
    fatherName: string;
    paymentDate?: string;
    paymentMode?: string;
    className: ClassName;
}
export interface StaffProfilePure {
    assignedClasses: Array<ClassName>;
}
export interface ClassStats {
    className: ClassName;
    studentCount: bigint;
}
export type AdmissionNumber = string;
export interface TotalAmountRecord {
    grandTotal: bigint;
    admissionFeesTotal: bigint;
    className: ClassName;
    monthlyFeesTotal: bigint;
}
export enum Gender {
    other = "other",
    female = "female",
    male = "male"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAdmissionRecord(admission: StudentAdmissionPure): Promise<AdmissionNumber>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createStaffAccount(staffPrincipal: Principal, assignedClasses: Array<ClassName>): Promise<void>;
    deleteStudentRecord(admissionNumber: AdmissionNumber): Promise<void>;
    getAdmission(admissionNumber: AdmissionNumber): Promise<StudentAdmissionPure>;
    getAllFeesData(): Promise<Array<FeeExportRecord>>;
    getAllStudentData(): Promise<Array<StudentAdmissionPersist>>;
    getCallerUserProfile(): Promise<UserProfilePure | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClassAdmissions(className: ClassName): Promise<Array<StudentAdmissionPure>>;
    getClassFeesData(className: ClassName): Promise<Array<FeeExportRecord>>;
    getClassStudentData(className: ClassName): Promise<Array<StudentAdmissionPersist>>;
    getClassWiseFeesData(className: ClassName): Promise<Array<ClassWiseFeesExportRecord>>;
    getFeeStatus(className: ClassName): Promise<Array<FeeRecordPure>>;
    getFreeStudentsData(): Promise<Array<StudentAdmissionPersist>>;
    getGenderOptions(): Promise<Array<Gender>>;
    getMonthlyFeeAlerts(): Promise<Array<PendingFeeRecord>>;
    getPendingFeesReport(month: Month, className: ClassName | null): Promise<Array<PendingFeeRecord>>;
    getPredefinedClassOptions(): Promise<Array<ClassName>>;
    getStudentFeeRecord(admissionNumber: AdmissionNumber): Promise<FeeRecordPure>;
    getStudentStatsByClass(): Promise<{
        totalStudents: bigint;
        classStats: Array<ClassStats>;
    }>;
    getTotalAmountCollection(): Promise<{
        grandTotals: TotalAmountRecord;
        classTotals: Array<TotalAmountRecord>;
    }>;
    getUserProfile(user: Principal): Promise<UserProfilePure | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markMonthPaid(admissionNumber: AdmissionNumber, month: Month): Promise<void>;
    markMonthlyPayments(admissionNumber: AdmissionNumber, payments: MonthlyPayments): Promise<void>;
    saveCallerUserProfile(profile: UserProfilePure): Promise<void>;
    searchStudent(searchQuery: string): Promise<Array<StudentAdmissionPure>>;
    updateStudentRecord(admissionNumber: AdmissionNumber, updatedAdmission: StudentAdmissionPure): Promise<void>;
}
