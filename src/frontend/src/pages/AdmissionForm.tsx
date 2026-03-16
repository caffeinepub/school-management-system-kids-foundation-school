import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ViewType } from "../App";
import { ExternalBlob, Gender } from "../backend";
import {
  useAddAdmissionRecord,
  useGetGenderOptions,
  useGetPredefinedClassOptions,
} from "../hooks/useQueries";

interface AdmissionFormProps {
  onNavigate?: (view: ViewType) => void;
}

export default function AdmissionForm({ onNavigate }: AdmissionFormProps) {
  const [formData, setFormData] = useState({
    studentName: "",
    fatherName: "",
    motherName: "",
    fatherAadhaarNumber: "",
    motherAadhaarNumber: "",
    admittedClass: "",
    aadhaarNumber: "",
    phoneNumber: "",
    admissionAmount: "",
    address: "",
    gender: "" as "" | Gender,
    dateOfBirth: "",
    isFreeStudent: false,
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Fetch class options and gender options from backend
  const {
    data: classOptions,
    isLoading: classOptionsLoading,
    error: classOptionsError,
  } = useGetPredefinedClassOptions();
  const {
    data: genderOptions,
    isLoading: genderOptionsLoading,
    error: genderOptionsError,
  } = useGetGenderOptions();
  const { mutate: addAdmission, isPending } = useAddAdmissionRecord();

  const isLoadingData = classOptionsLoading || genderOptionsLoading;
  const hasError = classOptionsError || genderOptionsError;

  // Show error toast if data fetching fails
  useEffect(() => {
    if (classOptionsError) {
      toast.error("Failed to load class options", {
        description: "Please refresh the page to try again",
      });
    }
    if (genderOptionsError) {
      toast.error("Failed to load gender options", {
        description: "Please refresh the page to try again",
      });
    }
  }, [classOptionsError, genderOptionsError]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.studentName ||
      !formData.fatherName ||
      !formData.motherName ||
      !formData.fatherAadhaarNumber ||
      !formData.motherAadhaarNumber ||
      !formData.admittedClass ||
      !formData.aadhaarNumber ||
      !formData.phoneNumber ||
      !formData.admissionAmount ||
      !formData.address ||
      !formData.gender ||
      !formData.dateOfBirth
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    let photoBlob: ExternalBlob | undefined = undefined;

    if (photoFile) {
      try {
        const arrayBuffer = await photoFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        photoBlob = ExternalBlob.fromBytes(uint8Array);
      } catch (error) {
        console.error("Error processing photo:", error);
        toast.error("Failed to process photo");
        return;
      }
    }

    const dateOfBirthTimestamp =
      new Date(formData.dateOfBirth).getTime() * 1000000;

    const admission = {
      studentName: formData.studentName,
      fatherName: formData.fatherName,
      motherName: formData.motherName,
      fatherAadhaarNumber: formData.fatherAadhaarNumber,
      motherAadhaarNumber: formData.motherAadhaarNumber,
      admittedClass: formData.admittedClass,
      aadhaarNumber: formData.aadhaarNumber,
      phoneNumber: formData.phoneNumber,
      admissionDate: BigInt(Date.now() * 1000000),
      admissionAmount: BigInt(formData.admissionAmount),
      admissionNumber: "",
      photo: photoBlob,
      address: formData.address,
      gender: formData.gender,
      dateOfBirth: BigInt(dateOfBirthTimestamp),
      isFreeStudent: formData.isFreeStudent,
    };

    addAdmission(admission, {
      onSuccess: (admissionNumber) => {
        toast.success("Admission Successful!", {
          description: `Admission Number: ${admissionNumber}. Redirecting to dashboard...`,
          duration: 3000,
          icon: <CheckCircle2 className="h-5 w-5" />,
        });

        setFormData({
          studentName: "",
          fatherName: "",
          motherName: "",
          fatherAadhaarNumber: "",
          motherAadhaarNumber: "",
          admittedClass: "",
          aadhaarNumber: "",
          phoneNumber: "",
          admissionAmount: "",
          address: "",
          gender: "",
          dateOfBirth: "",
          isFreeStudent: false,
        });
        setPhotoFile(null);
        setPhotoPreview(null);

        if (onNavigate) {
          setTimeout(() => {
            onNavigate("dashboard");
          }, 1000);
        }
      },
      onError: (error) => {
        toast.error("Admission Failed", {
          description:
            error.message || "An error occurred while processing the admission",
        });
      },
    });
  };

  const formatGenderLabel = (gender: Gender): string => {
    switch (gender) {
      case Gender.male:
        return "Male";
      case Gender.female:
        return "Female";
      case Gender.other:
        return "Other";
      default:
        return gender;
    }
  };

  // Show loading state while fetching initial data
  if (isLoadingData) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">New Admission</h1>
          <p className="text-muted-foreground">
            Register a new student to the school
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading form data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if data fetching failed
  if (hasError) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">New Admission</h1>
          <p className="text-muted-foreground">
            Register a new student to the school
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load form data. Please refresh the page to try again.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">New Admission</h1>
        <p className="text-muted-foreground">
          Register a new student to the school
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
              <img
                src="/assets/generated/admission-icon.dim_64x64.png"
                alt=""
                className="h-8 w-8"
              />
            </div>
            <div>
              <CardTitle>Admission Form</CardTitle>
              <CardDescription>
                Fill in the student details below. Admission number will be
                auto-generated in format KFS/ADM/XXXXX
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div className="space-y-2">
              <Label htmlFor="photo">Student Photo (Optional)</Label>
              <div className="flex items-start gap-4">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Student preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={handleRemovePhoto}
                      disabled={isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={isPending}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload a photo of the student (max 5MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="studentName">Student Name *</Label>
                <Input
                  id="studentName"
                  placeholder="Enter student's full name"
                  value={formData.studentName}
                  onChange={(e) =>
                    setFormData({ ...formData, studentName: e.target.value })
                  }
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherName">Father Name *</Label>
                <Input
                  id="fatherName"
                  placeholder="Enter father's full name"
                  value={formData.fatherName}
                  onChange={(e) =>
                    setFormData({ ...formData, fatherName: e.target.value })
                  }
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherName">Mother Name *</Label>
                <Input
                  id="motherName"
                  placeholder="Enter mother's full name"
                  value={formData.motherName}
                  onChange={(e) =>
                    setFormData({ ...formData, motherName: e.target.value })
                  }
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherAadhaarNumber">
                  Father Aadhaar Number *
                </Label>
                <Input
                  id="fatherAadhaarNumber"
                  placeholder="Enter father's 12-digit Aadhaar"
                  value={formData.fatherAadhaarNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fatherAadhaarNumber: e.target.value,
                    })
                  }
                  disabled={isPending}
                  maxLength={12}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherAadhaarNumber">
                  Mother Aadhaar Number *
                </Label>
                <Input
                  id="motherAadhaarNumber"
                  placeholder="Enter mother's 12-digit Aadhaar"
                  value={formData.motherAadhaarNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      motherAadhaarNumber: e.target.value,
                    })
                  }
                  disabled={isPending}
                  maxLength={12}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  disabled={isPending}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-2">
                <Label>Gender *</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value as Gender })
                  }
                  disabled={isPending}
                  className="flex gap-4"
                >
                  {genderOptions?.map((gender) => (
                    <div key={gender} className="flex items-center space-x-2">
                      <RadioGroupItem value={gender} id={gender} />
                      <Label
                        htmlFor={gender}
                        className="font-normal cursor-pointer"
                      >
                        {formatGenderLabel(gender)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admittedClass">Class *</Label>
                <Select
                  value={formData.admittedClass}
                  onValueChange={(value) =>
                    setFormData({ ...formData, admittedClass: value })
                  }
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions?.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadhaarNumber">Student Aadhaar Number *</Label>
                <Input
                  id="aadhaarNumber"
                  placeholder="Enter student's 12-digit Aadhaar"
                  value={formData.aadhaarNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, aadhaarNumber: e.target.value })
                  }
                  disabled={isPending}
                  maxLength={12}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Enter 10-digit phone number"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  disabled={isPending}
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admissionAmount">Admission Amount (₹) *</Label>
                <Input
                  id="admissionAmount"
                  type="number"
                  placeholder="Enter admission fee"
                  value={formData.admissionAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      admissionAmount: e.target.value,
                    })
                  }
                  disabled={isPending}
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                placeholder="Enter complete address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                disabled={isPending}
                rows={3}
              />
            </div>

            {/* Free Student Checkbox */}
            <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/30">
              <Checkbox
                id="isFreeStudent"
                checked={formData.isFreeStudent}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFreeStudent: checked === true })
                }
                disabled={isPending}
              />
              <div className="flex flex-col">
                <Label
                  htmlFor="isFreeStudent"
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

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    studentName: "",
                    fatherName: "",
                    motherName: "",
                    fatherAadhaarNumber: "",
                    motherAadhaarNumber: "",
                    admittedClass: "",
                    aadhaarNumber: "",
                    phoneNumber: "",
                    admissionAmount: "",
                    address: "",
                    gender: "",
                    dateOfBirth: "",
                    isFreeStudent: false,
                  });
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                disabled={isPending}
              >
                Clear Form
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Submit Admission
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
