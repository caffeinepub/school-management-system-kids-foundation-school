import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  GraduationCap,
  Receipt,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ViewType } from "../App";
import type { PendingFeeRecord } from "../backend";
import {
  useGetAllStudentData,
  useGetClassStudentData,
  useGetClassWiseFeesData,
  useGetFreeStudentsData,
  useGetPendingFeesReport,
  useGetPredefinedClassOptions,
  useIsCallerAdmin,
} from "../hooks/useQueries";

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
}

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const MONTH_LABELS: Record<string, string> = {
  january: "January",
  february: "February",
  march: "March",
  april: "April",
  may: "May",
  june: "June",
  july: "July",
  august: "August",
  september: "September",
  october: "October",
  november: "November",
  december: "December",
};

export default function Dashboard({ onNavigate: _onNavigate }: DashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedPendingFeesClass, setSelectedPendingFeesClass] =
    useState<string>("All Classes");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedClassWiseFeesClass, setSelectedClassWiseFeesClass] = useState<
    string | null
  >(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [isDownloadingClass, setIsDownloadingClass] = useState(false);
  const [isDownloadingClassWiseFees, setIsDownloadingClassWiseFees] =
    useState(false);
  const [isDownloadingFreeStudents, setIsDownloadingFreeStudents] =
    useState(false);

  // Collapsible section states
  const [isPendingFeesOpen, setIsPendingFeesOpen] = useState(false);
  const [isClassBasedOpen, setIsClassBasedOpen] = useState(false);
  const [isSystemStatusOpen, setIsSystemStatusOpen] = useState(false);
  const [isClassWiseFeesOpen, setIsClassWiseFeesOpen] = useState(false);
  const [isFreeStudentsOpen, setIsFreeStudentsOpen] = useState(false);

  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();

  // Pass className to backend query (null if "All Classes" is selected)
  const classNameForQuery =
    selectedPendingFeesClass === "All Classes"
      ? null
      : selectedPendingFeesClass;
  const {
    data: pendingFees,
    isLoading: isPendingFeesLoading,
    error: pendingFeesError,
  } = useGetPendingFeesReport(selectedMonth, classNameForQuery);

  const { data: allStudentData, isLoading: isAllStudentDataLoading } =
    useGetAllStudentData();
  const { data: classOptions, isLoading: isClassOptionsLoading } =
    useGetPredefinedClassOptions();
  const {
    data: classStudentData,
    isLoading: isClassStudentDataLoading,
    isFetching: isClassStudentDataFetching,
  } = useGetClassStudentData(selectedClass);
  const {
    data: classWiseFeesData,
    isLoading: isClassWiseFeesDataLoading,
    isFetching: isClassWiseFeesDataFetching,
  } = useGetClassWiseFeesData(selectedClassWiseFeesClass);
  const { data: freeStudentsData, isLoading: isFreeStudentsDataLoading } =
    useGetFreeStudentsData();

  // Group pending fees by class
  const groupedByClass =
    pendingFees?.reduce(
      (acc, record) => {
        if (!acc[record.className]) {
          acc[record.className] = [];
        }
        acc[record.className].push(record);
        return acc;
      },
      {} as Record<string, PendingFeeRecord[]>,
    ) || {};

  // Get current time for system status
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `Today, ${displayHours}:${displayMinutes} ${ampm}`;
  };

  // Helper function to format gender
  const formatGender = (gender: any): string => {
    if (typeof gender === "object") {
      if ("male" in gender) return "Male";
      if ("female" in gender) return "Female";
      if ("other" in gender) return "Other";
    }
    return String(gender);
  };

  // Helper function to format date
  const formatDate = (timestamp: bigint): string => {
    try {
      const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  // Helper function to escape CSV values
  const escapeCSV = (value: string): string => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const handleDownloadCSV = () => {
    if (!pendingFees || !selectedMonth) return;

    try {
      const csvHeaders = [
        "Admission Number",
        "Student Name",
        "Class",
        "Month",
        "Payment Status",
      ];
      const csvRows = pendingFees.map((record) => [
        record.admissionNumber,
        record.studentName,
        record.className,
        MONTH_LABELS[record.month] || record.month,
        record.paymentStatus ? "Paid" : "Unpaid",
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      const currentYear = new Date().getFullYear();
      const monthLabel = MONTH_LABELS[selectedMonth] || selectedMonth;

      // Include class name in filename if specific class is selected
      const fileName =
        selectedPendingFeesClass === "All Classes"
          ? `Pending_Fees_${monthLabel}_${currentYear}.csv`
          : `Pending_Fees_${selectedPendingFeesClass}_${monthLabel}_${currentYear}.csv`;

      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("CSV downloaded successfully");
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error("Failed to download CSV");
    }
  };

  const handleDownloadAllStudentData = async () => {
    if (!allStudentData || allStudentData.length === 0) {
      toast.error("No student data available to download");
      return;
    }

    setIsDownloadingAll(true);
    toast.info("Starting download...");

    try {
      // CSV Headers
      const csvHeaders = [
        "Student Name",
        "Father Name",
        "Mother Name",
        "Father Aadhaar Number",
        "Mother Aadhaar Number",
        "Admission Number",
        "Class",
        "Student Aadhaar Number",
        "Phone Number",
        "Address",
        "Gender",
        "Date of Birth",
        "Admission Amount",
        "Admission Date",
        "Free Student",
      ];

      // CSV Rows
      const csvRows = allStudentData.map((student) => [
        escapeCSV(student.studentName),
        escapeCSV(student.fatherName),
        escapeCSV(student.motherName),
        escapeCSV(student.fatherAadhaarNumber),
        escapeCSV(student.motherAadhaarNumber),
        escapeCSV(student.admissionNumber),
        escapeCSV(student.admittedClass),
        escapeCSV(student.aadhaarNumber),
        escapeCSV(student.phoneNumber),
        escapeCSV(student.address),
        escapeCSV(formatGender(student.gender)),
        escapeCSV(formatDate(student.dateOfBirth)),
        String(student.admissionAmount),
        escapeCSV(formatDate(student.admissionDate)),
        student.isFreeStudent ? "Yes" : "No",
      ]);

      // Generate CSV content
      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.join(",")),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

      link.setAttribute("href", url);
      link.setAttribute("download", `All_Students_Data_${currentDate}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `Successfully downloaded data for ${allStudentData.length} students`,
      );
    } catch (error) {
      console.error("Error downloading all student data:", error);
      toast.error("Failed to download student data. Please try again.");
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleDownloadClassData = async () => {
    if (!classStudentData || classStudentData.length === 0) {
      toast.error("No student data available for this class");
      return;
    }

    if (!selectedClass) {
      toast.error("Please select a class first");
      return;
    }

    setIsDownloadingClass(true);
    toast.info("Starting download...");

    try {
      // CSV Headers
      const csvHeaders = [
        "Student Name",
        "Father Name",
        "Mother Name",
        "Father Aadhaar Number",
        "Mother Aadhaar Number",
        "Class",
        "Phone Number",
        "Student Aadhaar Number",
        "Address",
        "Gender",
        "Date of Birth",
        "Free Student",
        "Admission Number",
      ];

      // CSV Rows
      const csvRows = classStudentData.map((student) => [
        escapeCSV(student.studentName),
        escapeCSV(student.fatherName),
        escapeCSV(student.motherName),
        escapeCSV(student.fatherAadhaarNumber),
        escapeCSV(student.motherAadhaarNumber),
        escapeCSV(student.admittedClass),
        escapeCSV(student.phoneNumber),
        escapeCSV(student.aadhaarNumber),
        escapeCSV(student.address),
        escapeCSV(formatGender(student.gender)),
        escapeCSV(formatDate(student.dateOfBirth)),
        student.isFreeStudent ? "Yes" : "No",
        escapeCSV(student.admissionNumber),
      ]);

      // Generate CSV content
      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.join(",")),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Class_${selectedClass}_Students_${currentDate}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `Successfully downloaded data for ${classStudentData.length} students from Class ${selectedClass}`,
      );
    } catch (error) {
      console.error("Error downloading class student data:", error);
      toast.error("Failed to download class data. Please try again.");
    } finally {
      setIsDownloadingClass(false);
    }
  };

  const handleDownloadClassWiseFeesData = async () => {
    if (!selectedClassWiseFeesClass) {
      toast.error("Please select a class to download fees data.");
      return;
    }

    if (!classWiseFeesData || classWiseFeesData.length === 0) {
      toast.error("No fees records found for this class.");
      return;
    }

    setIsDownloadingClassWiseFees(true);
    toast.info("Starting download...");

    try {
      // CSV Headers in exact order as specified
      const csvHeaders = [
        "Student Name",
        "Father Name",
        "Mother Name",
        "Admission Number",
        "Class",
        "Parent Contact Number",
        "Complete Address",
        "Fee Month",
        "Amount Paid",
        "Payment Status",
      ];

      // CSV Rows
      const csvRows = classWiseFeesData.map((record) => [
        escapeCSV(record.studentName),
        escapeCSV(record.fatherName),
        escapeCSV(record.motherName),
        escapeCSV(record.admissionNumber),
        escapeCSV(record.className),
        escapeCSV(record.parentContactNumber),
        escapeCSV(record.completeAddress),
        escapeCSV(MONTH_LABELS[record.feeMonth] || record.feeMonth),
        String(record.amountPaid),
        record.paymentStatus ? "Paid" : "Unpaid",
      ]);

      // Generate CSV content
      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.join(",")),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `KFS_Fees_Class_${selectedClassWiseFeesClass}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `Successfully downloaded fees data for Class ${selectedClassWiseFeesClass}`,
      );
    } catch (error) {
      console.error("Error downloading class-wise fees data:", error);
      toast.error("Failed to download class fees data. Please try again.");
    } finally {
      setIsDownloadingClassWiseFees(false);
    }
  };

  const handleDownloadFreeStudentsData = async () => {
    if (!freeStudentsData || freeStudentsData.length === 0) {
      toast.error("No free students data available to download");
      return;
    }

    setIsDownloadingFreeStudents(true);
    toast.info("Starting download...");

    try {
      // CSV Headers
      const csvHeaders = [
        "Admission Number",
        "Student Name",
        "Father Name",
        "Mother Name",
        "Class",
        "Gender",
        "Phone Number",
        "Address",
        "Admission Date",
        "Status",
      ];

      // CSV Rows
      const csvRows = freeStudentsData.map((student) => [
        escapeCSV(student.admissionNumber),
        escapeCSV(student.studentName),
        escapeCSV(student.fatherName),
        escapeCSV(student.motherName),
        escapeCSV(student.admittedClass),
        escapeCSV(formatGender(student.gender)),
        escapeCSV(student.phoneNumber),
        escapeCSV(student.address),
        escapeCSV(formatDate(student.admissionDate)),
        "Free Student",
      ]);

      // Generate CSV content
      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.join(",")),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", "free_students_kids_foundation_school.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `Successfully downloaded data for ${freeStudentsData.length} free students`,
      );
    } catch (error) {
      console.error("Error downloading free students data:", error);
      toast.error("Failed to download free students data. Please try again.");
    } finally {
      setIsDownloadingFreeStudents(false);
    }
  };

  if (isAdminLoading) {
    return (
      <div className="container py-8">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-muted-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              This space is ready for future customization
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate summary values
  const pendingFeesCount = selectedMonth ? pendingFees?.length || 0 : 0;
  const totalClasses = classOptions?.length || 13;
  const freeStudentsCount = freeStudentsData?.length || 0;

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            View and manage school financial data and reports
          </p>
        </div>
      </div>

      {/* Summary Boxes Grid - Now with 5 boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* Box 1 - Pending Fees Report */}
        <div className="space-y-4">
          <button
            onClick={() => setIsPendingFeesOpen(!isPendingFeesOpen)}
            type="button"
            className="w-full text-left border rounded-lg p-6 hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Pending Fees Report</h3>
                </div>
                <p className="text-2xl font-bold">
                  {selectedMonth
                    ? isPendingFeesLoading
                      ? "..."
                      : pendingFeesCount
                    : "-"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedMonth
                    ? `Pending for ${MONTH_LABELS[selectedMonth]}`
                    : "Select month to view"}
                </p>
              </div>
              <div className="ml-2">
                {isPendingFeesOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </button>

          {isPendingFeesOpen && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Pending Fees Details
                </CardTitle>
                <CardDescription>
                  Students with unpaid fees by month and class
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Month Selection */}
                  <div className="flex-1">
                    <Select
                      value={selectedMonth || ""}
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month} value={month}>
                            {MONTH_LABELS[month]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Class Selection */}
                  <div className="flex-1">
                    <Select
                      value={selectedPendingFeesClass}
                      onValueChange={setSelectedPendingFeesClass}
                      disabled={isClassOptionsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Classes">All Classes</SelectItem>
                        {classOptions?.map((className) => (
                          <SelectItem key={className} value={className}>
                            Class {className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Download Button */}
                  {selectedMonth && pendingFees && pendingFees.length > 0 && (
                    <Button
                      onClick={handleDownloadCSV}
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Report (CSV)
                    </Button>
                  )}
                </div>

                {isPendingFeesLoading && selectedMonth && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">Loading...</p>
                  </div>
                )}

                {pendingFeesError && selectedMonth && (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg border-destructive/50">
                    <p className="text-sm text-destructive">
                      Error loading pending fees
                    </p>
                  </div>
                )}

                {!selectedMonth && (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Select a month
                    </p>
                  </div>
                )}

                {selectedMonth &&
                  !isPendingFeesLoading &&
                  !pendingFeesError &&
                  pendingFees &&
                  pendingFees.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <div className="text-green-600 mb-2">
                        <svg
                          className="h-8 w-8 mx-auto"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-label="No pending fees"
                          role="img"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium">No Pending Fees</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedPendingFeesClass === "All Classes"
                          ? `All students have paid for ${MONTH_LABELS[selectedMonth]}`
                          : `All students in Class ${selectedPendingFeesClass} have paid for ${MONTH_LABELS[selectedMonth]}`}
                      </p>
                    </div>
                  )}

                {selectedMonth &&
                  !isPendingFeesLoading &&
                  !pendingFeesError &&
                  pendingFees &&
                  pendingFees.length > 0 && (
                    <div className="space-y-4">
                      <div className="max-h-[300px] overflow-y-auto space-y-3">
                        {Object.keys(groupedByClass)
                          .sort()
                          .map((className) => (
                            <div key={className} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold">
                                  Class {className}
                                </h4>
                                <Badge variant="secondary" className="text-xs">
                                  {groupedByClass[className].length}
                                </Badge>
                              </div>
                              <div className="border rounded-lg overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="text-xs">
                                        Admission No.
                                      </TableHead>
                                      <TableHead className="text-xs">
                                        Student Name
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {groupedByClass[className].map((record) => (
                                      <TableRow key={record.admissionNumber}>
                                        <TableCell className="text-xs font-medium">
                                          {record.admissionNumber}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                          {record.studentName}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Box 2 - Class-Based Data */}
        <div className="space-y-4">
          <button
            onClick={() => setIsClassBasedOpen(!isClassBasedOpen)}
            type="button"
            className="w-full text-left border rounded-lg p-6 hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Class-Based Data</h3>
                </div>
                <p className="text-2xl font-bold">{totalClasses}</p>
                <p className="text-sm text-muted-foreground">Total Classes</p>
              </div>
              <div className="ml-2">
                {isClassBasedOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </button>

          {isClassBasedOpen && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Export Student Data</CardTitle>
                <CardDescription>
                  Download all or class-specific data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Download All Student Data */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">
                        All Student Data
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Complete information for all students
                      </p>
                    </div>
                    <Button
                      onClick={handleDownloadAllStudentData}
                      disabled={
                        isDownloadingAll ||
                        isAllStudentDataLoading ||
                        !allStudentData ||
                        allStudentData.length === 0
                      }
                      size="sm"
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {isDownloadingAll ? "Downloading..." : "Download"}
                    </Button>
                  </div>
                </div>

                {/* Class-Specific Data Export */}
                <div className="space-y-3">
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-3">
                      Class-Specific Data
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Select
                          value={selectedClass || ""}
                          onValueChange={setSelectedClass}
                          disabled={isClassOptionsLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classOptions?.map((className) => (
                              <SelectItem key={className} value={className}>
                                Class {className}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedClass && (
                        <Button
                          onClick={handleDownloadClassData}
                          disabled={
                            isDownloadingClass ||
                            isClassStudentDataLoading ||
                            isClassStudentDataFetching ||
                            !classStudentData ||
                            classStudentData.length === 0
                          }
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          {isDownloadingClass ? "Downloading..." : "Download"}
                        </Button>
                      )}
                    </div>

                    {(isClassStudentDataLoading ||
                      isClassStudentDataFetching) &&
                      selectedClass && (
                        <div className="text-center py-6 mt-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Loading...
                          </p>
                        </div>
                      )}

                    {!selectedClass && (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg mt-3">
                        <GraduationCap className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Select a class
                        </p>
                      </div>
                    )}

                    {selectedClass &&
                      !isClassStudentDataLoading &&
                      !isClassStudentDataFetching &&
                      classStudentData &&
                      classStudentData.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg mt-3">
                          <p className="text-sm font-medium mb-1">
                            No Students Found
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Class {selectedClass} has no students
                          </p>
                        </div>
                      )}

                    {selectedClass &&
                      !isClassStudentDataLoading &&
                      !isClassStudentDataFetching &&
                      classStudentData &&
                      classStudentData.length > 0 && (
                        <div className="space-y-3 mt-3">
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">
                              Class {selectedClass}
                            </p>
                            <p className="text-lg font-bold">
                              {classStudentData.length}{" "}
                              {classStudentData.length === 1
                                ? "Student"
                                : "Students"}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Box 3 - System Status */}
        <div className="space-y-4">
          <button
            onClick={() => setIsSystemStatusOpen(!isSystemStatusOpen)}
            type="button"
            className="w-full text-left border rounded-lg p-6 hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">SYSTEM STATUS</h3>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  SYSTEM ONLINE
                </p>
                <p className="text-sm text-muted-foreground">
                  All services active
                </p>
              </div>
              <div className="ml-2">
                {isSystemStatusOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </button>

          {isSystemStatusOpen && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  System Status Details
                </CardTitle>
                <CardDescription>
                  Real-time system health monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Main Status Display */}
                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="relative">
                      <div className="h-3 w-3 bg-green-600 rounded-full animate-pulse" />
                      <div className="absolute inset-0 h-3 w-3 bg-green-600 rounded-full animate-ping opacity-75" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-green-700 dark:text-green-400">
                        SYSTEM ONLINE
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-500">
                        All services active • No issues detected
                      </p>
                    </div>
                  </div>

                  {/* Last Check Time */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Last checked:
                      </span>
                      <span className="text-sm font-medium">
                        {getCurrentTime()}
                      </span>
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-blue-600 dark:text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-label="Security shield"
                        role="img"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        Secure & Protected
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Box 4 - Class-Wise Fees Download */}
        <div className="space-y-4">
          <button
            onClick={() => setIsClassWiseFeesOpen(!isClassWiseFeesOpen)}
            type="button"
            className="w-full text-left border rounded-lg p-6 hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Class-Wise Fees Download</h3>
                </div>
                <p className="text-2xl font-bold">By Class</p>
                <p className="text-sm text-muted-foreground">
                  Export class fees
                </p>
              </div>
              <div className="ml-2">
                {isClassWiseFeesOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </button>

          {isClassWiseFeesOpen && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Class-Wise Fees Download
                </CardTitle>
                <CardDescription>
                  Download fees data for a specific class
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="space-y-3">
                    <Select
                      value={selectedClassWiseFeesClass || ""}
                      onValueChange={setSelectedClassWiseFeesClass}
                      disabled={isClassOptionsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classOptions?.map((className) => (
                          <SelectItem key={className} value={className}>
                            Class {className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={handleDownloadClassWiseFeesData}
                      disabled={
                        !selectedClassWiseFeesClass ||
                        isDownloadingClassWiseFees ||
                        isClassWiseFeesDataLoading ||
                        isClassWiseFeesDataFetching
                      }
                      className="w-full gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {isDownloadingClassWiseFees
                        ? "Downloading..."
                        : "Download Class Fees (CSV)"}
                    </Button>
                  </div>

                  {(isClassWiseFeesDataLoading ||
                    isClassWiseFeesDataFetching) &&
                    selectedClassWiseFeesClass && (
                      <div className="text-center py-6 mt-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Loading...
                        </p>
                      </div>
                    )}

                  {!selectedClassWiseFeesClass && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg mt-3">
                      <Receipt className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Select a class to download
                      </p>
                    </div>
                  )}

                  {selectedClassWiseFeesClass &&
                    !isClassWiseFeesDataLoading &&
                    !isClassWiseFeesDataFetching &&
                    classWiseFeesData &&
                    classWiseFeesData.length > 0 && (
                      <div className="space-y-3 mt-3">
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            Class {selectedClassWiseFeesClass}
                          </p>
                          <p className="text-lg font-bold">
                            {classWiseFeesData.length}{" "}
                            {classWiseFeesData.length === 1
                              ? "Record"
                              : "Records"}
                          </p>
                        </div>
                      </div>
                    )}
                </div>

                {/* Footer Attribution */}
                <div className="border-t pt-4">
                  <p className="text-xs text-center text-muted-foreground">
                    Built & Developed by SS. Zahir Khan
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Box 5 - Free Students Report */}
        <div className="space-y-4">
          <button
            onClick={() => setIsFreeStudentsOpen(!isFreeStudentsOpen)}
            type="button"
            className="w-full text-left border rounded-lg p-6 hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Free Students Report</h3>
                </div>
                <p className="text-2xl font-bold">
                  {isFreeStudentsDataLoading ? "..." : freeStudentsCount}
                </p>
                <p className="text-sm text-muted-foreground">
                  Fee-exempt students
                </p>
              </div>
              <div className="ml-2">
                {isFreeStudentsOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </button>

          {isFreeStudentsOpen && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Free Students Report
                </CardTitle>
                <CardDescription>
                  Students with fee exemption status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isFreeStudentsDataLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">Loading...</p>
                  </div>
                )}

                {!isFreeStudentsDataLoading &&
                  (!freeStudentsData || freeStudentsData.length === 0) && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">
                        No free students found
                      </p>
                    </div>
                  )}

                {!isFreeStudentsDataLoading &&
                  freeStudentsData &&
                  freeStudentsData.length > 0 && (
                    <div className="space-y-4">
                      {/* Table Display */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="max-h-[400px] overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs">
                                  Admission No.
                                </TableHead>
                                <TableHead className="text-xs">
                                  Student Name
                                </TableHead>
                                <TableHead className="text-xs">
                                  Father Name
                                </TableHead>
                                <TableHead className="text-xs">
                                  Mother Name
                                </TableHead>
                                <TableHead className="text-xs">Class</TableHead>
                                <TableHead className="text-xs">
                                  Gender
                                </TableHead>
                                <TableHead className="text-xs">Phone</TableHead>
                                <TableHead className="text-xs">
                                  Address
                                </TableHead>
                                <TableHead className="text-xs">
                                  Admission Date
                                </TableHead>
                                <TableHead className="text-xs">
                                  Status
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {freeStudentsData.map((student) => (
                                <TableRow key={student.admissionNumber}>
                                  <TableCell className="text-xs font-medium">
                                    {student.admissionNumber}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {student.studentName}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {student.fatherName}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {student.motherName}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {student.admittedClass}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {formatGender(student.gender)}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {student.phoneNumber}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {student.address}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {formatDate(student.admissionDate)}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Free Student
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      {/* Export Button */}
                      <Button
                        onClick={handleDownloadFreeStudentsData}
                        disabled={isDownloadingFreeStudents}
                        className="w-full gap-2"
                      >
                        <Download className="h-4 w-4" />
                        {isDownloadingFreeStudents
                          ? "Exporting..."
                          : "Export Free Students (CSV)"}
                      </Button>
                    </div>
                  )}

                {/* Footer Attribution */}
                <div className="border-t pt-4">
                  <p className="text-xs text-center text-muted-foreground">
                    Built & Developed by SS. Zahir Khan
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
