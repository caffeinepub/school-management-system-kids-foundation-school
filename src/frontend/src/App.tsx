import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile, useIsCallerAdmin } from "./hooks/useQueries";
import AdminLogin from "./pages/AdminLogin";
import AdmissionForm from "./pages/AdmissionForm";
import ClassManagement from "./pages/ClassManagement";
import Dashboard from "./pages/Dashboard";
import FeeManagement from "./pages/FeeManagement";
import LoginScreen from "./pages/LoginScreen";
import ParentPortal from "./pages/ParentPortal";
import ProfileSetup from "./pages/ProfileSetup";
import StaffManagement from "./pages/StaffManagement";
import StudentSearch from "./pages/StudentSearch";

export type ViewType =
  | "dashboard"
  | "admission"
  | "search"
  | "fees"
  | "classes"
  | "staff"
  | "parent";

function App() {
  const { identity, isInitializing: isIdentityInitializing } =
    useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isCheckingAdminSession, setIsCheckingAdminSession] = useState(true);

  // Check admin login session on mount
  useEffect(() => {
    const adminSession = localStorage.getItem("adminLoggedIn");
    setIsAdminLoggedIn(adminSession === "true");
    setIsCheckingAdminSession(false);
  }, []);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (isAuthenticated && userProfile) {
      setCurrentView("dashboard");
    }
  }, [isAuthenticated, userProfile]);

  // Show admin login first if not logged in
  if (isCheckingAdminSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Parent portal accessible without admin login
  if (currentView === "parent") {
    return <ParentPortal />;
  }

  if (!isAdminLoggedIn) {
    return (
      <AdminLogin
        onLoginSuccess={() => setIsAdminLoggedIn(true)}
        onOpenParentPortal={() => setCurrentView("parent")}
      />
    );
  }

  // Show loading only during identity initialization
  if (isIdentityInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login screen immediately
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Wait for actor to be ready before checking profile
  if (!actor || isActorFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Connecting...</p>
        </div>
      </div>
    );
  }

  // Wait for profile to be fetched
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show profile setup if profile is null and has been fetched
  const showProfileSetup = profileFetched && userProfile === null;

  if (showProfileSetup) {
    return <ProfileSetup />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        isAdmin={isAdmin || false}
        onAdminLogout={() => setIsAdminLoggedIn(false)}
      />
      <main className="flex-1">
        {currentView === "dashboard" && (
          <Dashboard onNavigate={setCurrentView} />
        )}
        {currentView === "admission" && (
          <AdmissionForm onNavigate={setCurrentView} />
        )}
        {currentView === "search" && <StudentSearch />}
        {currentView === "fees" && <FeeManagement />}
        {currentView === "classes" && <ClassManagement />}
        {currentView === "staff" && isAdmin && <StaffManagement />}
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
