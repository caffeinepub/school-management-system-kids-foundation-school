import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cake, MapPin, Phone, ShieldCheck, User, Users } from "lucide-react";
import { useState } from "react";
import { Gender } from "../backend";
import { useGetClassAdmissions } from "../hooks/useQueries";

const CLASSES = [
  "Nursery",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
];

export default function ClassManagement() {
  const [selectedClass, setSelectedClass] = useState("");
  const { data: students, isLoading } = useGetClassAdmissions(selectedClass);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  const getPhotoUrl = (student: any) => {
    if (student.photo) {
      return student.photo.getDirectURL();
    }
    return null;
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Class Management</h1>
        <p className="text-muted-foreground">
          View and manage students by class
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <img
                src="/assets/generated/class-icon.dim_64x64.png"
                alt=""
                className="h-8 w-8"
              />
            </div>
            <div>
              <CardTitle>Select Class</CardTitle>
              <CardDescription>
                Choose a class to view all students
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedClass && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {isLoading
                ? "Loading..."
                : `${students?.length || 0} Students in ${selectedClass}`}
            </h2>
          </div>

          {students && students.length > 0 ? (
            <div className="grid gap-4">
              {students.map((student) => (
                <Card
                  key={student.admissionNumber}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
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
                                Free Student
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            Admission No: {student.admissionNumber}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">{student.admittedClass}</Badge>
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
                        <span className="text-muted-foreground">
                          Date of Birth:
                        </span>
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
                      <div className="flex items-start gap-2 text-sm md:col-span-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground">Address:</span>
                        <span className="font-medium">{student.address}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : selectedClass && !isLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">
                  No students in this class
                </p>
                <p className="text-sm text-muted-foreground">
                  Add students through the admission form
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      {!selectedClass && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Select a class</p>
            <p className="text-sm text-muted-foreground">
              Choose a class from the dropdown to view students
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
