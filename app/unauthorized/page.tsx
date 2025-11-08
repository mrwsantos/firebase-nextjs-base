"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import Logo from "@/components/Logo";

const UnauthorizedPage = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { logout, userData } = useAuth();

  useEffect(() => setMounted(true), []);

  const handleGoHome = () => {
    // Redirect based on user role
    if (userData?.role === 'admin') {
      router.push('/welcome');
    } else if (userData?.role === 'master') {
      router.push('/admin/users');
    } 
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-dark-grey w-full">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-10">
            <Logo/>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            You shall not pass!
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-gray-600">
              You {"don't"} have permission to access this page.
            </p>
            <p className="text-sm text-gray-500">
              This area is restricted to administrators only.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={handleGoHome}
              className="w-full"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">
              If you believe this is a mistake, please contact your administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;