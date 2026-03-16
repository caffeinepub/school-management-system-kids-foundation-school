import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import type { ViewType } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface HeaderProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  isAdmin: boolean;
  onAdminLogout: () => void;
}

export default function Header({
  currentView,
  onNavigate,
  isAdmin,
  onAdminLogout,
}: HeaderProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    // Clear Internet Identity session
    await clear();
    queryClient.clear();

    // Clear admin login session
    localStorage.removeItem("adminLoggedIn");

    // Trigger admin logout to return to admin login page
    onAdminLogout();
  };

  const navItems = [
    { id: "dashboard" as ViewType, label: "Dashboard" },
    { id: "admission" as ViewType, label: "Admission" },
    { id: "search" as ViewType, label: "Search" },
    { id: "classes" as ViewType, label: "Classes" },
    ...(isAdmin
      ? [{ id: "staff" as ViewType, label: "Staff Management" }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/assets/school logo.jpg"
            alt="KIDS' FOUNDATION SCHOOL Logo"
            className="h-12 w-12 object-contain rounded-full"
          />
          <div>
            <h1 className="text-lg font-bold text-primary">
              KIDS' FOUNDATION SCHOOL
            </h1>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-card">
          <nav className="container py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className="justify-start"
              >
                {item.label}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
