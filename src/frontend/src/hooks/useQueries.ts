import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdmissionNumber,
  ClassName,
  ClassStats,
  ClassWiseFeesExportRecord,
  FeeExportRecord,
  FeeRecordPure,
  Gender,
  Month,
  MonthlyPayments,
  PendingFeeRecord,
  StudentAdmissionPersist,
  StudentAdmissionPure,
  UserProfilePure,
} from "../backend";
import { useActor } from "./useActor";

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfilePure | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      try {
        return await actor.getCallerUserProfile();
      } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !actorFetching && query.isFetched,
  };
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfilePure) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// Admission Queries
export function useAddAdmissionRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (admission: StudentAdmissionPure) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addAdmissionRecord(admission);
    },
    onSuccess: async () => {
      // Invalidate and immediately refetch student statistics
      await queryClient.invalidateQueries({
        queryKey: ["studentStatsByClass"],
      });
      await queryClient.refetchQueries({ queryKey: ["studentStatsByClass"] });

      // Invalidate other related queries including free students data
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.invalidateQueries({ queryKey: ["feeStatus"] });
      queryClient.invalidateQueries({ queryKey: ["classAdmissions"] });
      queryClient.invalidateQueries({ queryKey: ["searchStudent"] });
      queryClient.invalidateQueries({ queryKey: ["pendingFeesReport"] });
      queryClient.invalidateQueries({ queryKey: ["allStudentData"] });
      queryClient.invalidateQueries({ queryKey: ["classStudentData"] });
      queryClient.invalidateQueries({ queryKey: ["allFeesData"] });
      queryClient.invalidateQueries({ queryKey: ["classFeesData"] });
      queryClient.invalidateQueries({ queryKey: ["classWiseFeesData"] });
      queryClient.invalidateQueries({ queryKey: ["freeStudentsData"] });
    },
  });
}

export function useUpdateStudentRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      admissionNumber,
      updatedAdmission,
    }: {
      admissionNumber: AdmissionNumber;
      updatedAdmission: StudentAdmissionPure;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateStudentRecord(admissionNumber, updatedAdmission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searchStudent"] });
      queryClient.invalidateQueries({ queryKey: ["admission"] });
      queryClient.invalidateQueries({ queryKey: ["classAdmissions"] });
      queryClient.invalidateQueries({ queryKey: ["feeStatus"] });
      queryClient.invalidateQueries({ queryKey: ["studentFeeRecord"] });
      queryClient.invalidateQueries({ queryKey: ["studentStatsByClass"] });
      queryClient.invalidateQueries({ queryKey: ["pendingFeesReport"] });
      queryClient.invalidateQueries({ queryKey: ["allStudentData"] });
      queryClient.invalidateQueries({ queryKey: ["classStudentData"] });
      queryClient.invalidateQueries({ queryKey: ["allFeesData"] });
      queryClient.invalidateQueries({ queryKey: ["classFeesData"] });
      queryClient.invalidateQueries({ queryKey: ["classWiseFeesData"] });
      queryClient.invalidateQueries({ queryKey: ["freeStudentsData"] });
    },
  });
}

export function useDeleteStudentRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (admissionNumber: AdmissionNumber) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteStudentRecord(admissionNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searchStudent"] });
      queryClient.invalidateQueries({ queryKey: ["admission"] });
      queryClient.invalidateQueries({ queryKey: ["classAdmissions"] });
      queryClient.invalidateQueries({ queryKey: ["feeStatus"] });
      queryClient.invalidateQueries({ queryKey: ["studentFeeRecord"] });
      queryClient.invalidateQueries({ queryKey: ["studentStatsByClass"] });
      queryClient.invalidateQueries({ queryKey: ["pendingFeesReport"] });
      queryClient.invalidateQueries({ queryKey: ["allStudentData"] });
      queryClient.invalidateQueries({ queryKey: ["classStudentData"] });
      queryClient.invalidateQueries({ queryKey: ["allFeesData"] });
      queryClient.invalidateQueries({ queryKey: ["classFeesData"] });
      queryClient.invalidateQueries({ queryKey: ["classWiseFeesData"] });
      queryClient.invalidateQueries({ queryKey: ["freeStudentsData"] });
    },
  });
}

export function useGetAdmission(admissionNumber: AdmissionNumber) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StudentAdmissionPure>({
    queryKey: ["admission", admissionNumber],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAdmission(admissionNumber);
    },
    enabled: !!actor && !actorFetching && !!admissionNumber,
    retry: 1,
  });
}

export function useGetClassAdmissions(className: ClassName) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StudentAdmissionPure[]>({
    queryKey: ["classAdmissions", className],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getClassAdmissions(className);
    },
    enabled: !!actor && !actorFetching && !!className,
    retry: 1,
  });
}

export function useGetPredefinedClassOptions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ClassName[]>({
    queryKey: ["predefinedClassOptions"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPredefinedClassOptions();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });
}

export function useGetGenderOptions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Gender[]>({
    queryKey: ["genderOptions"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getGenderOptions();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });
}

// Search Query
export function useSearchStudent(searchQuery: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StudentAdmissionPure[]>({
    queryKey: ["searchStudent", searchQuery],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.searchStudent(searchQuery);
    },
    enabled: !!actor && !actorFetching && searchQuery.length > 0,
    retry: 1,
  });
}

// Fee Management Queries
export function useGetFeeStatus(className: ClassName | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FeeRecordPure[]>({
    queryKey: ["feeStatus", className ?? "none"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      if (!className) throw new Error("Class name is required");
      return actor.getFeeStatus(className);
    },
    enabled: !!actor && !actorFetching && !!className,
    staleTime: 0,
    refetchOnMount: true,
    retry: 1,
  });
}

export function useGetStudentFeeRecord(
  admissionNumber: AdmissionNumber | null,
) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FeeRecordPure>({
    queryKey: ["studentFeeRecord", admissionNumber],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      if (!admissionNumber) throw new Error("Admission number is required");
      return actor.getStudentFeeRecord(admissionNumber);
    },
    enabled: !!actor && !actorFetching && !!admissionNumber,
    staleTime: 0,
    refetchOnMount: true,
    retry: 1,
  });
}

export function useMarkMonthPaid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      admissionNumber,
      month,
    }: { admissionNumber: AdmissionNumber; month: Month }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markMonthPaid(admissionNumber, month);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["feeStatus"] });
      queryClient.invalidateQueries({
        queryKey: ["studentFeeRecord", variables.admissionNumber],
      });
      queryClient.invalidateQueries({ queryKey: ["pendingFeesReport"] });
      queryClient.invalidateQueries({ queryKey: ["allFeesData"] });
      queryClient.invalidateQueries({ queryKey: ["classFeesData"] });
      queryClient.invalidateQueries({ queryKey: ["classWiseFeesData"] });
    },
  });
}

// Monthly Payments Management
export function useUpdateMonthlyPayments() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      admissionNumber,
      payments,
    }: {
      admissionNumber: AdmissionNumber;
      payments: MonthlyPayments;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markMonthlyPayments(admissionNumber, payments);
    },
    onSuccess: (_, variables) => {
      // Invalidate all related queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["feeStatus"] });
      queryClient.invalidateQueries({ queryKey: ["searchStudent"] });
      queryClient.invalidateQueries({
        queryKey: ["studentFeeRecord", variables.admissionNumber],
      });
      queryClient.invalidateQueries({ queryKey: ["classAdmissions"] });
      queryClient.invalidateQueries({ queryKey: ["pendingFeesReport"] });
      queryClient.invalidateQueries({ queryKey: ["allFeesData"] });
      queryClient.invalidateQueries({ queryKey: ["classFeesData"] });
      queryClient.invalidateQueries({ queryKey: ["classWiseFeesData"] });
    },
  });
}

// Staff Management
export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      user,
      role,
    }: { user: string; role: "admin" | "user" | "guest" }) => {
      if (!actor) throw new Error("Actor not available");
      const principal = Principal.fromText(user);
      return actor.assignCallerUserRole(principal, { [role]: null } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// Dashboard Statistics
export function useGetStudentStatsByClass() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{ classStats: ClassStats[]; totalStudents: bigint }>({
    queryKey: ["studentStatsByClass"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getStudentStatsByClass();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

// Pending Fees Report - Updated to accept optional className parameter
export function useGetPendingFeesReport(
  month: Month | null,
  className: ClassName | null = null,
) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PendingFeeRecord[]>({
    queryKey: ["pendingFeesReport", month, className ?? "all"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      if (!month) throw new Error("Month is required");
      // Pass className to backend, or null if "All Classes" is selected
      return actor.getPendingFeesReport(month, className);
    },
    enabled: !!actor && !actorFetching && !!month,
    staleTime: 0,
    refetchOnMount: true,
    retry: 1,
  });
}

// All Student Data Export (Admin Only)
export function useGetAllStudentData() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StudentAdmissionPersist[]>({
    queryKey: ["allStudentData"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllStudentData();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    refetchOnMount: true,
    retry: 1,
  });
}

// Class-Based Student Data Export (Admin Only) - Fixed to properly refetch on class change
export function useGetClassStudentData(className: ClassName | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StudentAdmissionPersist[]>({
    queryKey: ["classStudentData", className ?? "none"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      if (!className) return [];
      return actor.getClassStudentData(className);
    },
    enabled: !!actor && !actorFetching && !!className,
    staleTime: 0,
    refetchOnMount: true,
    retry: 2,
  });
}

// Fees Data Export Queries (Admin Only)
export function useGetAllFeesData() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FeeExportRecord[]>({
    queryKey: ["allFeesData"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllFeesData();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    refetchOnMount: true,
    retry: 1,
  });
}

export function useGetClassFeesData(className: ClassName | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FeeExportRecord[]>({
    queryKey: ["classFeesData", className ?? "none"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      if (!className) return [];
      return actor.getClassFeesData(className);
    },
    enabled: !!actor && !actorFetching && !!className,
    staleTime: 0,
    refetchOnMount: true,
    retry: 1,
  });
}

// Class-Wise Fees Data Export Query (Admin Only)
export function useGetClassWiseFeesData(className: ClassName | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ClassWiseFeesExportRecord[]>({
    queryKey: ["classWiseFeesData", className ?? "none"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      if (!className) return [];
      return actor.getClassWiseFeesData(className);
    },
    enabled: !!actor && !actorFetching && !!className,
    staleTime: 0,
    refetchOnMount: true,
    retry: 1,
  });
}

// Free Students Data Query (Admin Only)
export function useGetFreeStudentsData() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StudentAdmissionPersist[]>({
    queryKey: ["freeStudentsData"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getFreeStudentsData();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    refetchOnMount: true,
    retry: 1,
  });
}
