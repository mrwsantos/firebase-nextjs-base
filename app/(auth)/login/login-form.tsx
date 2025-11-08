"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { passwordValidation } from "@/validation/registerUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useState, useEffect, Suspense } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: passwordValidation,
});

interface AuthError {
  code?: string;
  message?: string;
}

// Componente interno que usa useSearchParams
function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const { loginWithEmailAndPassword, loading, user } = useAuth();
  const [cancelToast, setCancelToast] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ✅ SIMPLIFICADO: Redirect único e direto
  useEffect(() => {
    if (user && !loading) {
      console.log("✅ User authenticated, redirecting...");
      
      // Check for redirect parameter (OAuth ou outro)
      const redirect = searchParams.get('redirect');
      
      if (redirect) {
        console.log("✅ Redirecting to:", redirect);
        router.push(redirect);
        setCancelToast(true);
      } else {
        console.log("✅ Redirecting to default: /");
        router.push("/");
         setCancelToast(true);
      }
    }
  }, [user, loading, router, searchParams]);

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await loginWithEmailAndPassword(data.email, data.password);
      
         toast.success("Login successful!", {
          description: "Redirecting you now...",
          duration:10000,
          cancel:cancelToast,
          
        });

      // ✅ Redirect será feito automaticamente pelo useEffect acima
      
    } catch (error: unknown) {
      console.error("❌ Login error:", error);

      let errorMessage = "Login failed. Please try again.";
      const authError = error as AuthError;

      if (authError.message === "ACCOUNT_NOT_APPROVED") {
        errorMessage = "Your account is pending approval. Please wait for an admin to approve your account.";
      } else if (authError.message === "ACCOUNT_SUSPENDED") {
        errorMessage = "Your account has been suspended. Please contact support.";
      } else if (authError.message === "USER_DATA_NOT_FOUND") {
        errorMessage = "Account data not found. Please contact support.";
      } else if (authError.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password.";
      } else if (authError.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (authError.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled.";
      }

      toast.error("Login Failed", {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  const isLoading = form.formState.isSubmitting || loading;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      {...field}
                      placeholder="Your password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="rounded-full shadow-none px-5"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide password" : "Show password"}
                      className="rounded-full shadow-none"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link 
              href="/forgot-password" 
              className="text-xs text-dark-grey hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="mx-auto bg-primary transition-all rounded-full w-full"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </div>
            ) : (
              "Sign in"
            )}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}

// Componente exportado com Suspense
export default function LoginFormImproved() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}