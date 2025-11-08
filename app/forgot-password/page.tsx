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
import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { toast } from "sonner";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/client";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const ForgotPassword = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      await sendPasswordResetEmail(auth, data.email, {
        url: `https://localhost:3000/login`,
        handleCodeInApp: false,
      });

      setEmailSent(true);
      toast.success("Email sent!", {
        description: "Check your inbox for password reset instructions.",
      });
    } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
      console.error("Password reset error:", error);

      let errorMessage = "Failed to send reset email. Please try again.";

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      }

      toast.error("Reset Failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              {emailSent ? "Check Your Email" : "Forgot Password"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {emailSent ? (
              <div className="flex flex-col gap-4 text-center py-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-gray-600 mb-4">
                    {"We've"} sent a password reset link to{" "}
                    <strong>{form.getValues("email")}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    Click the link in the email to reset your password. The link
                    will expire in 1 hour.
                  </p>
                </div>

                <Button
                  onClick={() => setEmailSent(false)}
                  variant="outline"
                  className="mt-4"
                >
                  Send Another Email
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="flex flex-col gap-4"
                >
                  <p className="text-sm text-gray-600 mb-2">
                    Enter your email address and {"we'll"} send you a link to reset
                    your password.
                  </p>

                  <fieldset className="flex flex-col gap-4" disabled={isLoading}>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Your email"
                              type="email"
                              autoComplete="email"
                              className="rounded-full shadow-none px-5"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full transition-all rounded-full"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </div>
                      ) : (
                        "Send Reset Link"
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

export default ForgotPassword;