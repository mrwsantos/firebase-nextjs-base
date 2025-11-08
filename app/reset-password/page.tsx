"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect, Suspense } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { toast } from "sonner";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { passwordValidation } from "@/validation/registerUser";
import { PasswordStrengthCompact } from "@/components/ui/password-strenght-indicator";

const formSchema = z
  .object({
    password: passwordValidation,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Loading component for Suspense fallback
function LoadingState() {
  return (
    <div
      className="w-full h-screen flex items-center justify-center"
      style={{ backgroundColor: "#f2f0ed" }}
    >
      <div className="mx-auto p-5 w-[500px] flex flex-col gap-10">
        <div className="logo m-auto flex items-center justify-center w-60">
          <Logo />
        </div>
        <Card
          className="bg-[#ffffff] border-0 shadow-none"
          style={{ backdropFilter: "blur(15px)" }}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main component that uses searchParams
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidCode, setIsValidCode] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const oobCode = searchParams.get("oobCode");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");

  useEffect(() => {
    const validateResetCode = async () => {
      if (!oobCode) {
        toast.error("Invalid Link", {
          description: "No reset code found. Please request a new reset link.",
        });
        setIsValidating(false);
        return;
      }

      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        setUserEmail(email);
        setIsValidCode(true);
        setIsValidating(false);
      } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
        console.error("Code validation error:", error);

        let errorMessage = "Invalid or expired reset link.";

        if (error.code === "auth/invalid-action-code") {
          errorMessage = "This reset link is invalid or has already been used.";
        } else if (error.code === "auth/expired-action-code") {
          errorMessage = "This reset link has expired. Please request a new one.";
        }

        toast.error("Invalid Link", {
          description: errorMessage,
        });

        setIsValidCode(false);
        setIsValidating(false);
      }
    };

    validateResetCode();
  }, [oobCode]);

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!oobCode) {
      toast.error("Error", {
        description: "Reset code is missing. Please try again.",
      });
      return;
    }

    try {
      setIsLoading(true);

      await confirmPasswordReset(auth, oobCode, data.password);

      setResetSuccess(true);
      toast.success("Password Reset Successfully!", {
        description: "You can now log in with your new password.",
      });

      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
      console.error("Password reset error:", error);

      let errorMessage = "Failed to reset password. Please try again.";

      if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (error.code === "auth/invalid-action-code") {
        errorMessage = "This reset link is invalid or has already been used.";
      } else if (error.code === "auth/expired-action-code") {
        errorMessage = "This reset link has expired. Please request a new one.";
      }

      toast.error("Reset Failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div
        className="w-full h-screen flex items-center justify-center"
        style={{ backgroundColor: "#f2f0ed" }}
      >
        <div className="mx-auto p-5 w-[500px] flex flex-col gap-10">
          <div className="logo m-auto flex items-center justify-center w-60">
            <Logo />
          </div>
          <Card
            className="bg-[#ffffff] border-0 shadow-none"
            style={{ backdropFilter: "blur(15px)" }}
          >
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Validating reset link...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isValidCode) {
    return (
      <div
        className="w-full h-screen flex items-center justify-center"
        style={{ backgroundColor: "#f2f0ed" }}
      >
        <div className="mx-auto p-5 w-[500px] flex flex-col gap-10">
          <div className="logo m-auto flex items-center justify-center w-60">
            <Logo />
          </div>
          <Card
            className="bg-[#ffffff] border-0 shadow-none"
            style={{ backdropFilter: "blur(15px)" }}
          >
            <CardHeader>
              <CardTitle className="text-2xl text-center text-dark-grey font-bold">
                Invalid Reset Link
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">
                This password reset link is invalid or has expired.
              </p>
              <p className="text-sm text-gray-500">
                Please request a new password reset link.
              </p>
            </CardContent>
            <hr />
            <CardFooter className="flex justify-center py-4">
              <Link href="/forgot-password">
                <Button className="bg-primary hover:bg-dark-grey">
                  Request New Link
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-screen flex items-center justify-center"
      style={{ backgroundColor: "#f2f0ed" }}
    >
      <div className="mx-auto p-5 w-[500px] flex flex-col gap-10">
        <div className="logo m-auto flex items-center justify-center w-60">
          <Logo />
        </div>

        <Card
          className="bg-[#ffffff] border-0 shadow-none"
          style={{ backdropFilter: "blur(15px)" }}
        >
          <CardHeader>
            <CardTitle className="text-2xl text-center text-dark-grey font-bold">
              {resetSuccess ? "Password Reset!" : "Reset Password"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {resetSuccess ? (
              <div className="flex flex-col gap-4 text-center py-4">
                <div className="mx-auto w-16 h-16 bg-secondary-2/50 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-dark-grey"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-gray-600 mb-2">
                    Your password has been reset successfully!
                  </p>
                  <p className="text-sm text-gray-500">
                    Redirecting you to login...
                  </p>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="flex flex-col gap-4"
                >
                  {userEmail && (
                    <p className="text-sm text-gray-600 mb-2">
                      Resetting password for <strong>{userEmail}</strong>
                    </p>
                  )}

                  <fieldset className="flex flex-col gap-4" disabled={isLoading}>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Input
                                  {...field}
                                  placeholder="New password"
                                  type={showPassword ? "text" : "password"}
                                  autoComplete="new-password"
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setShowPassword(!showPassword)}
                                  title={showPassword ? "Hide password" : "Show password"}
                                >
                                  {showPassword ? (
                                    <EyeOffIcon className="h-4 w-4" />
                                  ) : (
                                    <EyeIcon className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>

                              {/* Password Strength Indicator */}
                              {password && (
                                <PasswordStrengthCompact password={password} />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Confirm new password"
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                            />
                          </FormControl>
                          <FormMessage />
                          {password && field.value && password === field.value && (
                            <p className="text-xs text-dark-grey">
                              ✓ Passwords match
                            </p>
                          )}
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary hover:bg-dark-grey transition-all"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Resetting Password...
                        </div>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </fieldset>
                </form>
              </Form>
            )}
          </CardContent>

          <hr />

          <CardFooter className="flex justify-center text-dark-grey text-xs">
            <span className="font-bold">Remember your password?</span>
            <Link href="/login" className="underline ml-1">
              Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

// Wrapper component with Suspense
export default function ResetPassword() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordForm />
    </Suspense>
  );
}