import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAssignUserRole } from "../hooks/useQueries";

export default function StaffManagement() {
  const [principalId, setPrincipalId] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const { mutate: assignRole, isPending } = useAssignUserRole();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!principalId.trim()) {
      toast.error("Please enter a principal ID");
      return;
    }

    assignRole(
      { user: principalId, role },
      {
        onSuccess: () => {
          toast.success(`Successfully assigned ${role} role`);
          setPrincipalId("");
          setRole("user");
        },
        onError: (error) => {
          toast.error(`Failed to assign role: ${error.message}`);
        },
      },
    );
  };

  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Staff Management</h1>
        <p className="text-muted-foreground">
          Create and manage staff accounts with role-based access
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-chart-5/10 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-chart-5" />
            </div>
            <div>
              <CardTitle>Add Staff Member</CardTitle>
              <CardDescription>
                Assign roles to staff members using their Internet Identity
                Principal ID
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="principalId">Principal ID *</Label>
              <Input
                id="principalId"
                placeholder="Enter Internet Identity Principal ID"
                value={principalId}
                onChange={(e) => setPrincipalId(e.target.value)}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                The staff member must log in first to get their Principal ID
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={role}
                onValueChange={(value: "user" | "admin") => setRole(value)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    Staff/Teacher (Limited Access)
                  </SelectItem>
                  <SelectItem value="admin">Admin (Full Access)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Staff members can only access their assigned classes. Admins
                have full system access.
              </p>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPrincipalId("");
                  setRole("user");
                }}
                disabled={isPending}
              >
                Clear
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Role
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Add Staff</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Step 1: Staff Member Logs In</h3>
            <p className="text-sm text-muted-foreground">
              The staff member must first log in to the system using Internet
              Identity to generate their Principal ID.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Step 2: Get Principal ID</h3>
            <p className="text-sm text-muted-foreground">
              After logging in, the staff member can find their Principal ID in
              their profile or share it with you.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Step 3: Assign Role</h3>
            <p className="text-sm text-muted-foreground">
              Enter the Principal ID above and select the appropriate role
              (Staff or Admin) to grant access.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
