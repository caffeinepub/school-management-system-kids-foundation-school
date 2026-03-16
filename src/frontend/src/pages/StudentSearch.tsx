import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Cake,
  Calendar,
  CreditCard,
  DollarSign,
  Edit,
  Loader2,
  MapPin,
  Phone,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { StudentAdmissionPure } from "../backend";
import { ExternalBlob, Gender } from "../backend";
import {
  useDeleteStudentRecord,
  useGetPredefinedClassOptions,
  useGetStudentFeeRecord,
  useSearchStudent,
  useUpdateMonthlyPayments,
  useUpdateStudentRecord,
} from "../hooks/useQueries";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function StudentSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState<StudentAdmissionPure | null>(null);
  const [monthlyPayments, setMonthlyPayments] = useState<
    Record<string, string>
  >({
    january: "",
    february: "",
    march: "",
    april: "",
    may: "",
    june: "",
    july: "",
    august: "",
    september: "",
    october: "",
    november: "",
    december: "",
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] =
    useState<StudentAdmissionPure | null>(null);
  const [studentToDelete, setStudentToDelete] =
    useState<StudentAdmissionPure | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    studentName: "",
    fatherName: "",
    motherName: "",
    fatherAadhaarNumber: "",
    motherAadhaarNumber: "",
    admittedClass: "",
    aadhaarNumber: "",
    phoneNumber: "",
    address: "",
    gender: Gender.male,
    dateOfBirth: "",
    admissionDate: "",
    admissionAmount: "",
    isFreeStudent: false,
    photo: null as File | null,
    existingPhotoUrl: null as string | null,
  });

  const { data: searchResults, isLoading } = useSearchStudent(searchQuery);
  const {
    data: feeRecord,
    isLoading: isFeeRecordLoading,
    isFetched: _isFeeRecordFetched,
  } = useGetStudentFeeRecord(selectedStudent?.admissionNumber || null);
  const { data: classOptions } = useGetPredefinedClassOptions();
  const updatePaymentsMutation = useUpdateMonthlyPayments();
  const updateStudentMutation = useUpdateStudentRecord();
  const deleteStudentMutation = useDeleteStudentRecord();

  useEffect(() => {
    if (feeRecord?.monthlyPayments && selectedStudent) {
      const payments = feeRecord.monthlyPayments;
      setMonthlyPayments({
        january: payments.january > 0n ? payments.january.toString() : "",
        february: payments.february > 0n ? payments.february.toString() : "",
        march: payments.march > 0n ? payments.march.toString() : "",
        april: payments.april > 0n ? payments.april.toString() : "",
        may: payments.may > 0n ? payments.may.toString() : "",
        june: payments.june > 0n ? payments.june.toString() : "",
        july: payments.july > 0n ? payments.july.toString() : "",
        august: payments.august > 0n ? payments.august.toString() : "",
        september: payments.september > 0n ? payments.september.toString() : "",
        october: payments.october > 0n ? payments.october.toString() : "",
        november: payments.november > 0n ? payments.november.toString() : "",
        december: payments.december > 0n ? payments.december.toString() : "",
      });
      setIsDataLoaded(true);
    }
  }, [feeRecord, selectedStudent]);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateForInput = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toISOString().split("T")[0];
  };

  const formatGender = (gender: Gender) => {
    switch (gender) {
      case Gender.male:
        return "Male";
      case Gender.female:
        return "Female";
      case Gender.other:
        return "Other";
      default:
        return "Not specified";
    }
  };

  const getPhotoUrl = (student: StudentAdmissionPure) => {
    if (student.photo) {
      return student.photo.getDirectURL();
    }
    return null;
  };

  const handleStudentSelect = (student: StudentAdmissionPure) => {
    setSelectedStudent(student);
    setIsDataLoaded(false);
  };

  const handlePaymentChange = (month: string, value: string) => {
    if (value === "" || /^\d+$/.test(value)) {
      setMonthlyPayments((prev) => ({
        ...prev,
        [month.toLowerCase()]: value,
      }));
    }
  };

  const handleSavePayments = async () => {
    if (!selectedStudent) return;

    const payments = {
      january: BigInt(monthlyPayments.january || "0"),
      february: BigInt(monthlyPayments.february || "0"),
      march: BigInt(monthlyPayments.march || "0"),
      april: BigInt(monthlyPayments.april || "0"),
      may: BigInt(monthlyPayments.may || "0"),
      june: BigInt(monthlyPayments.june || "0"),
      july: BigInt(monthlyPayments.july || "0"),
      august: BigInt(monthlyPayments.august || "0"),
      september: BigInt(monthlyPayments.september || "0"),
      october: BigInt(monthlyPayments.october || "0"),
      november: BigInt(monthlyPayments.november || "0"),
      december: BigInt(monthlyPayments.december || "0"),
    };

    try {
      await updatePaymentsMutation.mutateAsync({
        admissionNumber: selectedStudent.admissionNumber,
        payments,
      });
      toast.success("Payment amounts saved successfully!");
    } catch (error) {
      console.error("Error saving payments:", error);
      toast.error("Failed to save payment amounts. Please try again.");
    }
  };

  const handleClearSelection = () => {
    setSelectedStudent(null);
    setIsDataLoaded(false);
    setMonthlyPayments({
      january: "",
      february: "",
      march: "",
      april: "",
      may: "",
      june: "",
      july: "",
      august: "",
      september: "",
      october: "",
      november: "",
      december: "",
    });
  };

  const calculateTotal = () => {
    return Object.values(monthlyPayments).reduce((sum, value) => {
      return sum + (value ? Number.parseInt(value) : 0);
    }, 0);
  };

  const handleEditClick = (
    student: StudentAdmissionPure,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setStudentToEdit(student);
    setEditForm({
      studentName: student.studentName,
      fatherName: student.fatherName,
      motherName: student.motherName,
      fatherAadhaarNumber: student.fatherAadhaarNumber,
      motherAadhaarNumber: student.motherAadhaarNumber,
      admittedClass: student.admittedClass,
      aadhaarNumber: student.aadhaarNumber,
      phoneNumber: student.phoneNumber,
      address: student.address,
      gender: student.gender,
      dateOfBirth: formatDateForInput(student.dateOfBirth),
      admissionDate: formatDateForInput(student.admissionDate),
      admissionAmount: student.admissionAmount.toString(),
      isFreeStudent: student.isFreeStudent,
      photo: null,
      existingPhotoUrl: getPhotoUrl(student),
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (
    student: StudentAdmissionPure,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setEditForm((prev) => ({ ...prev, photo: file }));
    }
  };

  const handleSaveEdit = async () => {
    if (!studentToEdit) return;

    try {
      let photoBlob = studentToEdit.photo;

      if (editForm.photo) {
        const arrayBuffer = await editForm.photo.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        photoBlob = ExternalBlob.fromBytes(uint8Array);
      }

      const updatedAdmission: StudentAdmissionPure = {
        studentName: editForm.studentName,
        fatherName: editForm.fatherName,
        motherName: editForm.motherName,
        fatherAadhaarNumber: editForm.fatherAadhaarNumber,
        motherAadhaarNumber: editForm.motherAadhaarNumber,
        admittedClass: editForm.admittedClass,
        aadhaarNumber: editForm.aadhaarNumber,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address,
        gender: editForm.gender,
        dateOfBirth: BigInt(new Date(editForm.dateOfBirth).getTime() * 1000000),
        admissionDate: BigInt(
          new Date(editForm.admissionDate).getTime() * 1000000,
        ),
        admissionAmount: BigInt(editForm.admissionAmount),
        admissionNumber: studentToEdit.admissionNumber,
        photo: photoBlob,
        isFreeStudent: editForm.isFreeStudent,
      };

      await updateStudentMutation.mutateAsync({
        admissionNumber: studentToEdit.admissionNumber,
        updatedAdmission,
      });

      toast.success("Student record updated successfully!");
      setEditDialogOpen(false);
      setStudentToEdit(null);
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student record. Please try again.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      await deleteStudentMutation.mutateAsync(studentToDelete.admissionNumber);
      toast.success("Student record deleted successfully!");
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      if (
        selectedStudent?.admissionNumber === studentToDelete.admissionNumber
      ) {
        handleClearSelection();
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student record. Please try again.");
    }
  };

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Student Search</h1>
        <p className="text-muted-foreground">
          Search for students by name, class, phone, Aadhaar, or admission
          number
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <img
                src="/assets/generated/search-icon.dim_64x64.png"
                alt=""
                className="h-8 w-8"
              />
            </div>
            <div>
              <CardTitle>Search Students</CardTitle>
              <CardDescription>
                Enter any student detail to search
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="search">Search Query</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name, class, phone, Aadhaar, or admission number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedStudent && (
        <Card className="mb-8 border-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-16 h-16">
                  <AvatarImage
                    src={getPhotoUrl(selectedStudent) || undefined}
                    alt={selectedStudent.studentName}
                  />
                  <AvatarFallback className="text-lg">
                    {selectedStudent.studentName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">
                      {selectedStudent.studentName}
                    </CardTitle>
                    {selectedStudent.isFreeStudent && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      >
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Free Student
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    Admission No: {selectedStudent.admissionNumber}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isFeeRecordLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading payment data...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Father:</span>
                    <span className="font-medium">
                      {selectedStudent.fatherName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Mother:</span>
                    <span className="font-medium">
                      {selectedStudent.motherName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Father Aadhaar:
                    </span>
                    <span className="font-medium">
                      {selectedStudent.fatherAadhaarNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Mother Aadhaar:
                    </span>
                    <span className="font-medium">
                      {selectedStudent.motherAadhaarNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary">
                      {selectedStudent.admittedClass}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">
                      {selectedStudent.phoneNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Admission Date:
                    </span>
                    <span className="font-medium">
                      {formatDate(selectedStudent.admissionDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Cake className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Date of Birth:
                    </span>
                    <span className="font-medium">
                      {formatDate(selectedStudent.dateOfBirth)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Gender:</span>
                    <span className="font-medium">
                      {formatGender(selectedStudent.gender)}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm md:col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-medium">
                      {selectedStudent.address}
                    </span>
                  </div>
                </div>

                <Separator />

                {selectedStudent.isFreeStudent ? (
                  <div className="py-8 text-center border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <ShieldCheck className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                      Fee Exempt Student
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      This student is exempt from monthly fee payments
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          Monthly Payment Amounts
                        </h3>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Total: </span>
                          <span className="font-semibold text-lg">
                            ₹{calculateTotal()}
                          </span>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {MONTHS.map((month) => (
                          <div key={month} className="space-y-2">
                            <Label htmlFor={month.toLowerCase()}>{month}</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                ₹
                              </span>
                              <Input
                                id={month.toLowerCase()}
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                value={monthlyPayments[month.toLowerCase()]}
                                onChange={(e) =>
                                  handlePaymentChange(month, e.target.value)
                                }
                                className="pl-7"
                                disabled={!isDataLoaded}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={handleClearSelection}
                        disabled={updatePaymentsMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSavePayments}
                        disabled={
                          updatePaymentsMutation.isPending || !isDataLoaded
                        }
                      >
                        {updatePaymentsMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Payments
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {searchQuery && !selectedStudent && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {isLoading
                ? "Searching..."
                : `${searchResults?.length || 0} Results Found`}
            </h2>
          </div>

          {searchResults && searchResults.length > 0 ? (
            <div className="grid gap-4">
              {searchResults.map((student) => (
                <Card
                  key={student.admissionNumber}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => handleStudentSelect(student)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            handleStudentSelect(student);
                        }}
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarImage
                            src={getPhotoUrl(student) || undefined}
                            alt={student.studentName}
                          />
                          <AvatarFallback>
                            {student.studentName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">
                              {student.studentName}
                            </CardTitle>
                            {student.isFreeStudent && (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              >
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Free
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            Admission No: {student.admissionNumber}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {student.admittedClass}
                        </Badge>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => handleEditClick(student, e)}
                          disabled={updateStudentMutation.isPending}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => handleDeleteClick(student, e)}
                          disabled={deleteStudentMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Father:</span>
                        <span className="font-medium">
                          {student.fatherName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Mother:</span>
                        <span className="font-medium">
                          {student.motherName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">
                          {student.phoneNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Cake className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">DOB:</span>
                        <span className="font-medium">
                          {formatDate(student.dateOfBirth)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Gender:</span>
                        <span className="font-medium">
                          {formatGender(student.gender)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Student Aadhaar:
                        </span>
                        <span className="font-medium">
                          {student.aadhaarNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Admission Fee:
                        </span>
                        <span className="font-medium">
                          ₹{student.admissionAmount.toString()}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-sm md:col-span-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground">Address:</span>
                        <span className="font-medium">{student.address}</span>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      {student.isFreeStudent
                        ? "Fee exempt student"
                        : "Click to manage monthly payments"}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchQuery && !isLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No students found</p>
                <p className="text-sm text-muted-foreground">
                  Try searching with different keywords
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      {!searchQuery && !selectedStudent && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Start searching</p>
            <p className="text-sm text-muted-foreground">
              Enter a search query to find students
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Details</DialogTitle>
            <DialogDescription>
              Update the student information below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-studentName">Student Name *</Label>
                <Input
                  id="edit-studentName"
                  value={editForm.studentName}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      studentName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fatherName">Father Name *</Label>
                <Input
                  id="edit-fatherName"
                  value={editForm.fatherName}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      fatherName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-motherName">Mother Name *</Label>
                <Input
                  id="edit-motherName"
                  value={editForm.motherName}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      motherName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fatherAadhaar">
                  Father Aadhaar Number *
                </Label>
                <Input
                  id="edit-fatherAadhaar"
                  value={editForm.fatherAadhaarNumber}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      fatherAadhaarNumber: e.target.value,
                    }))
                  }
                  required
                  maxLength={12}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-motherAadhaar">
                  Mother Aadhaar Number *
                </Label>
                <Input
                  id="edit-motherAadhaar"
                  value={editForm.motherAadhaarNumber}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      motherAadhaarNumber: e.target.value,
                    }))
                  }
                  required
                  maxLength={12}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-class">Class *</Label>
                <Select
                  value={editForm.admittedClass}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({ ...prev, admittedClass: value }))
                  }
                >
                  <SelectTrigger id="edit-class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions?.map((className) => (
                      <SelectItem key={className} value={className}>
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-aadhaar">Student Aadhaar Number *</Label>
                <Input
                  id="edit-aadhaar"
                  value={editForm.aadhaarNumber}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      aadhaarNumber: e.target.value,
                    }))
                  }
                  required
                  maxLength={12}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number *</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phoneNumber}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dob">Date of Birth *</Label>
                <Input
                  id="edit-dob"
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      dateOfBirth: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-admissionDate">Admission Date *</Label>
                <Input
                  id="edit-admissionDate"
                  type="date"
                  value={editForm.admissionDate}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      admissionDate: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-admissionAmount">Admission Amount *</Label>
                <Input
                  id="edit-admissionAmount"
                  type="number"
                  value={editForm.admissionAmount}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      admissionAmount: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address *</Label>
              <Textarea
                id="edit-address"
                value={editForm.address}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, address: e.target.value }))
                }
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Gender *</Label>
              <RadioGroup
                value={editForm.gender}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, gender: value as Gender }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Gender.male} id="edit-male" />
                  <Label htmlFor="edit-male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Gender.female} id="edit-female" />
                  <Label htmlFor="edit-female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Gender.other} id="edit-other" />
                  <Label htmlFor="edit-other">Other</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/30">
              <Checkbox
                id="edit-isFreeStudent"
                checked={editForm.isFreeStudent}
                onCheckedChange={(checked) =>
                  setEditForm((prev) => ({
                    ...prev,
                    isFreeStudent: checked === true,
                  }))
                }
              />
              <div className="flex flex-col">
                <Label
                  htmlFor="edit-isFreeStudent"
                  className="cursor-pointer font-medium"
                >
                  Free Student (Fee Exempt)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Check this box if the student is exempt from paying monthly
                  fees
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-photo">Student Photo</Label>
              {editForm.existingPhotoUrl && !editForm.photo && (
                <div className="mb-2">
                  <img
                    src={editForm.existingPhotoUrl}
                    alt="Current"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Current photo
                  </p>
                </div>
              )}
              {editForm.photo && (
                <div className="mb-2">
                  <img
                    src={URL.createObjectURL(editForm.photo)}
                    alt="New"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    New photo selected
                  </p>
                </div>
              )}
              <Input
                id="edit-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              <p className="text-sm text-muted-foreground">
                Leave empty to keep current photo
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={updateStudentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateStudentMutation.isPending}
            >
              {updateStudentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this student?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              student record for <strong>{studentToDelete?.studentName}</strong>{" "}
              (Admission No: {studentToDelete?.admissionNumber}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteStudentMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteStudentMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteStudentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
