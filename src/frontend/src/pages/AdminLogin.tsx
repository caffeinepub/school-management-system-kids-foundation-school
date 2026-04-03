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
import { Copy, ExternalLink, Loader2, LogIn, Users } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onOpenParentPortal?: () => void;
}

export default function AdminLogin({
  onLoginSuccess,
  onOpenParentPortal,
}: AdminLoginProps) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const parentPortalUrl = `${window.location.origin}${window.location.pathname}#/parent-portal`;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validate empty fields
    if (!userId.trim() || !password.trim()) {
      toast.error("Please enter both User ID and Password");
      return;
    }

    setIsLoading(true);

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      // Check hardcoded credentials
      if (userId === "ZAHIRKHAN" && password === "202819204") {
        // Store login session
        localStorage.setItem("adminLoggedIn", "true");
        toast.success("Login successful!");
        onLoginSuccess();
      } else {
        toast.error("Invalid Login Details");
        setPassword("");
      }
      setIsLoading(false);
    }, 500);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(parentPortalUrl).then(() => {
      toast.success("Parent Portal link copied!");
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/assets/school logo.jpg"
              alt="KIDS' FOUNDATION SCHOOL Logo"
              className="h-32 w-32 object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">
              KIDS' FOUNDATION SCHOOL
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Admin Login
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="text"
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={isLoading}
                className="h-11"
                data-ocid="login.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-11"
                data-ocid="login.input"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base"
              size="lg"
              data-ocid="login.submit_button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Login
                </>
              )}
            </Button>
          </form>

          {/* Parent Portal Section */}
          <div className="border-t pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-primary flex-shrink-0" />
              <p className="text-sm font-semibold text-foreground">
                Parent Portal
              </p>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Are you a parent? Access your child's fee details and admission
              information here — no login required.
            </p>
            <div className="flex gap-2">
              {onOpenParentPortal && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={onOpenParentPortal}
                  data-ocid="login.primary_button"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open Parent Portal
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={handleCopyUrl}
                data-ocid="login.secondary_button"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Link
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-mono break-all">
              {parentPortalUrl}
            </p>
          </div>
        </CardContent>
      </Card>
      <footer className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Built &amp; Developed by SS. Zahir Khan
        </p>
      </footer>
    </div>
  );
}
