"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { setToken } from "@/context/actions";

const ContinueWithGoogleButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Sign in with Google popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Existing user - check status
        const userData = userDoc.data();

        if (!userData.accountApproved) {
          await auth.signOut();
          toast.error("Account Not Approved", {
            description: "Your account is pending approval. Please wait for an admin to approve your account.",
            duration: 5000,
          });
          setIsLoading(false);
          return;
        }

        if (userData.accountStatus === "suspended") {
          await auth.signOut();
          toast.error("Account Suspended", {
            description: "Your account has been suspended. Please contact support.",
            duration: 5000,
          });
          setIsLoading(false);
          return;
        }

        // Get tokens and save
        const tokenResult = await user.getIdTokenResult(true);
        if (tokenResult.token && user.refreshToken) {
          await setToken({
            token: tokenResult.token,
            refreshToken: user.refreshToken,
          });
        }

        // Success - redirect
        toast.success("Login successful!", {
          description: "Redirecting you now...",
          duration: 3000,
        });

        const redirect = searchParams?.get('redirect');
        router.push(redirect || "/");

      } else {
        // New user - create account automatically
        const newUserData = {
          id: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          role: "admin",
          emailVerified: user.emailVerified,
          accountApproved: true, // Auto-approve
          accountStatus: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: user.uid,
          photoURL: user.photoURL || "",
          provider: "google",
        };

        await setDoc(userDocRef, newUserData);

        // Get tokens and save
        const tokenResult = await user.getIdTokenResult(true);
        if (tokenResult.token && user.refreshToken) {
          await setToken({
            token: tokenResult.token,
            refreshToken: user.refreshToken,
          });
        }

        toast.success("Account Created!", {
          description: "Welcome! Setting up your account...",
          duration: 3000,
        });

        const redirect = searchParams?.get('redirect');
        router.push(redirect || "/");
      }

    } catch (error: any) {
      console.error("❌ Google sign-in error:", error);

      let errorMessage = "Failed to sign in with Google. Please try again.";

      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in cancelled.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup blocked. Please allow popups for this site.";
      } else if (error.code === "auth/account-exists-with-different-credential") {
        errorMessage = "An account already exists with this email using a different sign-in method.";
      }

      toast.error("Sign-in Failed", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full rounded-full"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
          Signing in...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </div>
      )}
    </Button>
  );
};

export default ContinueWithGoogleButton;