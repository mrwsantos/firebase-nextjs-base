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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { registerUser } from "@/actions";
import { toast } from "sonner";
import { registerUserSchema } from "@/validation/registerUser";
import { PasswordStrengthCompact } from "@/components/ui/password-strenght-indicator";

// Schema melhorado

export default function RegisterFormImproved() {
  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof registerUserSchema>>({
    resolver: zodResolver(registerUserSchema),
    mode: "onChange", // Validação em tempo real
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Watch password para o indicador de força
  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");

  const handleSubmit = async (data: z.infer<typeof registerUserSchema>) => {
    try {
      setError(null);
      const response = await registerUser(data);

      if (response?.error) {
        toast.error("Error!", {
          description: response.message,
        });
        setError(response.message);
        return;
      }

      toast.success("Success!", {
        description: "Your account has been created successfully!",
      });

      setRegistered(true);
    } catch {
      toast.error("Error!", {
        description: "An unexpected error occurred. Please try again.",
      });
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {!registered ? (
          <fieldset
            className="flex flex-col gap-3"
            disabled={form.formState.isSubmitting}
          >
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          className="rounded-full shadow-none px-5"
                          placeholder="First Name"
                          autoComplete="given-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="rounded-full shadow-none px-5"
                          {...field}
                          placeholder="Last Name"
                          autoComplete="family-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        className="rounded-full shadow-none px-5"
                        {...field}
                        placeholder="Your email"
                        type="email"
                        autoComplete="email"
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
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            className="rounded-full shadow-none px-5"
                            {...field}
                            placeholder="Your password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setShowPassword(!showPassword)}
                            className="rounded-full shadow-none"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
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
                      <div className="space-y-2">
                        <Input
                          className="rounded-full shadow-none px-5"
                          {...field}
                          placeholder="Confirm password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                        />

                        {/* Password Match Indicator */}
                        {confirmPassword && password && (
                          <div
                            className={`text-xs flex items-center gap-1 ${
                              password === confirmPassword
                                ? "text-dark-grey"
                                : "text-red-500"
                            }`}
                          >
                            {/* {password === confirmPassword ? '✓ ' : '✗ '}
                                    {password === confirmPassword
                                      ? 'Passwords match'
                                      : 'Passwords do not match'
                                    } */}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button className="rounded-full">Register</Button>
          </fieldset>
        ) : (
          <div className="flex flex-col gap-4 text-center p-6">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Thank you for registering.
              </h3>
              <p className="text-gray-600">
                You’ll receive an email from us once your account has been
                approved. This usually takes about 5-10 minutes.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </form>
    </Form>
  );
}
