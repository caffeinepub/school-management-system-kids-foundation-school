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
import { Loader2, LogIn } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        <CardContent>
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
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base"
              size="lg"
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
        </CardContent>
      </Card>
      <footer className="mt-8">
        <p className="text-sm text-center text-muted-foreground">
          Built & Developed by SS. Zahir Khan
        </p>
      </footer>
    </div>
  );
}
