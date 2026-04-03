import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  IndianRupee,
  Loader2,
  MapPin,
  Phone,
  Search,
  User,
} from "lucide-react";
import { useState } from "react";
import { Gender, type ParentStudentInfo } from "../backend";
import { useGetStudentInfoForParent } from "../hooks/useQueries";

const MONTHS = [
  { key: "january", label: "Jan" },
  { key: "february", label: "Feb" },
  { key: "march", label: "Mar" },
  { key: "april", label: "Apr" },
  { key: "may", label: "May" },
  { key: "june", label: "Jun" },
  { key: "july", label: "Jul" },
  { key: "august", label: "Aug" },
  { key: "september", label: "Sep" },
  { key: "october", label: "Oct" },
  { key: "november", label: "Nov" },
  { key: "december", label: "Dec" },
];

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatGender(gender: Gender): string {
  switch (gender) {
    case Gender.male:
      return "Male";
    case Gender.female:
      return "Female";
    default:
      return "Other";
  }
}

function MonthFeeGrid({
  payments,
  isFreeStudent,
}: { payments: ParentStudentInfo["monthlyPayments"]; isFreeStudent: boolean }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
      {MONTHS.map(({ key, label }) => {
        const amount = Number(
          (payments as unknown as Record<string, bigint>)[key] ?? 0n,
        );
        const isPaid = amount > 0;
        return (
          <div
            key={key}
            className={`rounded-lg border p-2 text-center transition-colors ${
              isFreeStudent
                ? "border-muted bg-muted/30"
                : isPaid
                  ? "border-green-400 bg-green-50 dark:bg-green-950/20"
                  : "border-red-300 bg-red-50 dark:bg-red-950/20"
            }`}
          >
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            {isFreeStudent ? (
              <p className="text-xs font-bold text-muted-foreground mt-0.5">
                Free
              </p>
            ) : (
              <>
                <p
                  className={`text-xs font-bold mt-0.5 ${
                    isPaid
                      ? "text-green-700 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {isPaid ? `₹${amount}` : "Pending"}
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ParentPortalProps {
  onBack?: () => void;
}

export default function ParentPortal({ onBack }: ParentPortalProps) {
  const [inputValue, setInputValue] = useState("");
  const [searchAdmNo, setSearchAdmNo] = useState("");

  const {
    data: studentInfo,
    isLoading,
    isError,
    error,
  } = useGetStudentInfoForParent(searchAdmNo);

  const handleSearch = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setSearchAdmNo(trimmed);
  };

  const hasSearched = searchAdmNo.length > 0;
  const notFound =
    hasSearched && !isLoading && !isError && studentInfo === null;
  const info =
    hasSearched &&
    !isLoading &&
    !isError &&
    studentInfo !== null &&
    studentInfo !== undefined
      ? studentInfo
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-4">
          <img
            src="/assets/school logo.jpg"
            alt="KIDS' FOUNDATION SCHOOL"
            className="h-14 w-14 object-contain rounded-full border"
          />
          <div className="flex-1">
            <h1 className="text-lg font-bold text-primary leading-tight">
              KIDS' FOUNDATION SCHOOL
            </h1>
            <p className="text-sm text-muted-foreground">
              Parent Portal — Academic Session 2026
            </p>
          </div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="parent.link"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Admin Login
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Search Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Your Child's Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="admNo"
                  className="text-xs text-muted-foreground"
                >
                  Enter Admission Number (e.g. KFS/ADM/38291)
                </Label>
                <Input
                  id="admNo"
                  placeholder="KFS/ADM/XXXXX"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-10"
                  data-ocid="parent.search_input"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  disabled={isLoading || !inputValue.trim()}
                  className="h-10"
                  data-ocid="parent.primary_button"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">Search</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12" data-ocid="parent.loading_state">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
            <p className="text-sm text-muted-foreground">
              Fetching student details...
            </p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <Card className="border-destructive" data-ocid="parent.error_state">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">
                  {String(error).includes("not found") ||
                  String(error).includes("null")
                    ? "No student found with this admission number. Please check and try again."
                    : "Something went wrong. Please try again."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Not Found */}
        {notFound && (
          <Card data-ocid="parent.empty_state">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center py-6 text-center gap-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">No student found</p>
                <p className="text-sm text-muted-foreground">
                  No record exists for admission number{" "}
                  <span className="font-mono font-semibold">{searchAdmNo}</span>
                  . Please double-check and try again.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student Info Card */}
        {info && (
          <div className="space-y-4">
            {/* Basic Details */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{info.studentName}</h2>
                      <p className="text-sm text-muted-foreground font-mono">
                        {info.admissionNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="font-semibold">
                      Class {info.admittedClass}
                    </Badge>
                    {info.isFreeStudent && (
                      <Badge variant="secondary">Free Student</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Father Name
                      </p>
                      <p className="font-medium">{info.fatherName || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Mother Name
                      </p>
                      <p className="font-medium">{info.motherName || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Gender</p>
                      <p className="font-medium">{formatGender(info.gender)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-8" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Date of Birth
                      </p>
                      <p className="font-medium">
                        {formatDate(info.dateOfBirth)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Phone Number
                      </p>
                      <p className="font-medium">{info.phoneNumber || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Admission Date
                      </p>
                      <p className="font-medium">
                        {formatDate(info.admissionDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="font-medium">{info.address || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <IndianRupee className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Admission Amount
                      </p>
                      <p className="font-medium">
                        ₹{Number(info.admissionAmount).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Fee Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  Monthly Fee Status — 2026
                </CardTitle>
                {!info.isFreeStudent && (
                  <div className="flex gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500" />
                      Paid
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-400" />
                      Pending
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <MonthFeeGrid
                  payments={info.monthlyPayments}
                  isFreeStudent={info.isFreeStudent}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t py-4 mt-auto">
        <div className="max-w-2xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground font-semibold">
          <span>© 2025 KIDS' FOUNDATION SCHOOL. All rights reserved.</span>
          <span>Developed and Built by SS. Zahir Khan</span>
        </div>
      </footer>
    </div>
  );
}
