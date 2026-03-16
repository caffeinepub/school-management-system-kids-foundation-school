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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  DollarSign,
  Filter,
  Loader2,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useGetFeeStatus,
  useGetPredefinedClassOptions,
  useMarkMonthPaid,
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

export default function FeeManagement() {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const { data: predefinedClasses, isLoading: classesLoading } =
    useGetPredefinedClassOptions();
  const {
    data: feeRecords,
    isLoading,
    isFetching,
    refetch,
  } = useGetFeeStatus(selectedClass || null);
  const { mutate: markPaid, isPending } = useMarkMonthPaid();

  // Set first class as default when classes are loaded
  useEffect(() => {
    if (predefinedClasses && predefinedClasses.length > 0 && !selectedClass) {
      setSelectedClass(predefinedClasses[0]);
    }
  }, [predefinedClasses, selectedClass]);

  // Refetch when selectedClass changes
  useEffect(() => {
    if (selectedClass) {
      refetch();
    }
  }, [selectedClass, refetch]);

  const handleMarkPaid = (admissionNumber: string, month: string) => {
    markPaid(
      { admissionNumber, month },
      {
        onSuccess: () => {
          toast.success(`Marked ${month} as paid`);
        },
        onError: (error) => {
          toast.error(`Failed to mark payment: ${error.message}`);
        },
      },
    );
  };

  const getUnpaidMonths = (paidMonths: string[]) => {
    return MONTHS.filter((month) => !paidMonths.includes(month));
  };

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
  };

  // Show loading state while classes are being fetched
  if (classesLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center gap-2 min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-center text-muted-foreground">
            Loading classes...
          </p>
        </div>
      </div>
    );
  }

  // Show loading state while initial data is being fetched
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center gap-2 min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-center text-muted-foreground">
            Loading fee records...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Fee Management</h1>
        <p className="text-muted-foreground">
          Track and manage student fee payments
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
              <Filter className="h-6 w-6 text-chart-3" />
            </div>
            <div>
              <CardTitle>Filter by Class</CardTitle>
              <CardDescription>
                Select a class to view students and their fee status
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="class-filter">Class</Label>
            <Select
              value={selectedClass}
              onValueChange={handleClassChange}
              disabled={isFetching}
            >
              <SelectTrigger id="class-filter">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {predefinedClasses?.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    Class {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isFetching && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating student list...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {isFetching && !feeRecords ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-lg font-medium mb-2">Loading students...</p>
              <p className="text-sm text-muted-foreground">
                Please wait while we fetch the data
              </p>
            </CardContent>
          </Card>
        ) : feeRecords && feeRecords.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                Showing {feeRecords.length} student
                {feeRecords.length !== 1 ? "s" : ""} in Class {selectedClass}
              </p>
            </div>
            {feeRecords.map((record) => {
              const isFreeStudent = record.studentAdmission.isFreeStudent;
              const unpaidMonths = getUnpaidMonths(record.paidMonths);
              const paidCount = record.paidMonths.length;
              const unpaidCount = unpaidMonths.length;

              return (
                <Card
                  key={record.studentAdmission.admissionNumber}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">
                              {record.studentAdmission.studentName}
                            </CardTitle>
                            {isFreeStudent && (
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
                            Class {record.studentAdmission.admittedClass} •
                            Admission No:{" "}
                            {record.studentAdmission.admissionNumber}
                          </CardDescription>
                        </div>
                      </div>
                      {!isFreeStudent && (
                        <div className="flex gap-2">
                          <Badge
                            variant={
                              unpaidCount === 0 ? "default" : "destructive"
                            }
                          >
                            {unpaidCount === 0
                              ? "All Paid"
                              : `${unpaidCount} Pending`}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isFreeStudent ? (
                      <div className="py-6 text-center border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-950/20">
                        <ShieldCheck className="h-10 w-10 text-green-600 dark:text-green-400 mx-auto mb-3" />
                        <p className="text-base font-semibold text-green-800 dark:text-green-200 mb-1">
                          Fee Exempt
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          This student is exempt from monthly fee payments
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-muted-foreground">
                              Paid Months:
                            </span>
                            <span className="font-medium">{paidCount}/12</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-destructive" />
                            <span className="text-muted-foreground">
                              Unpaid Months:
                            </span>
                            <span className="font-medium">{unpaidCount}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {MONTHS.map((month) => {
                            const isPaid = record.paidMonths.includes(month);
                            return (
                              <Badge
                                key={month}
                                variant={isPaid ? "default" : "outline"}
                                className={
                                  isPaid
                                    ? "bg-green-600 hover:bg-green-700"
                                    : ""
                                }
                              >
                                {month}
                              </Badge>
                            );
                          })}
                        </div>

                        {unpaidCount > 0 && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                <DollarSign className="mr-2 h-4 w-4" />
                                Mark Payments
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Mark Fee Payments</DialogTitle>
                                <DialogDescription>
                                  Select months to mark as paid for{" "}
                                  {record.studentAdmission.studentName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                {unpaidMonths.map((month) => (
                                  <div
                                    key={month}
                                    className="flex items-center justify-between"
                                  >
                                    <Label className="text-base">{month}</Label>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleMarkPaid(
                                          record.studentAdmission
                                            .admissionNumber,
                                          month,
                                        )
                                      }
                                      disabled={isPending}
                                    >
                                      {isPending ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Processing...
                                        </>
                                      ) : (
                                        "Mark as Paid"
                                      )}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No fee records found</p>
              <p className="text-sm text-muted-foreground">
                {selectedClass
                  ? `No students found in Class ${selectedClass}. Try selecting a different class.`
                  : "Add students through the admission form to see fee records"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
