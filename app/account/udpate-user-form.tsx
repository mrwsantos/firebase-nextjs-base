"use client";

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
import { updateUser, updateUserPass } from "@/actions";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";

// Schema para atualizar dados do usuário
const updateUserSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
});

export function UpdateUserForm() {
  const [error, setError] = useState<string | null>(null);
  const { userData, loading: userLoading } = useAuth();

  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  // Atualizar os valores do form quando userData carregar
  useEffect(() => {
    if (userData?.name) {
      const nameParts = userData.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || ""; // Pega tudo depois do primeiro nome
      
      form.reset({
        firstName,
        lastName,
      });
    }
  }, [userData, form]);

  // Mostrar loading enquanto não tem dados
  if (userLoading || !userData) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: z.infer<typeof updateUserSchema>) => {
    setError(null);
    
    if (!userData?.id) {
      setError("User ID not found");
      return;
    }

    try {
      const response = await updateUser(userData.id, data);

      if (response?.error) {
        toast.error("Error!", {
          description: response.message,
        });
        setError(response.message);
        return;
      }

      toast.success("Success!", {
        description: "Profile updated successfully!",
      });
      
    } catch {
      setError("An unexpected error occurred");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full">
        <fieldset
          className="flex flex-col gap-3"
          disabled={form.formState.isSubmitting}
        >
          <div className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="First Name"
                      className="bg-muted border-none rounded-full px-5"
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
                      {...field}
                      placeholder="Last Name"
                      className="bg-muted border-none rounded-full px-5"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting} className="rounded-full ">
            {form.formState.isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                Update
              </>
            )}
          </Button>
        </fieldset>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </Form>
  );
}

// Schema para atualizar senha
const updatePassSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    newPasswordConfirmation: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "Passwords don't match",
    path: ["newPasswordConfirmation"],
  });

export function UpdatePassForm() {
  const [error, setError] = useState<string | null>(null);
  const { userData, loading: userLoading } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const form = useForm<z.infer<typeof updatePassSchema>>({
    resolver: zodResolver(updatePassSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirmation: "",
    },
  });

  // Mostrar loading enquanto não tem dados
  if (userLoading || !userData) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  const handlePassSubmit = async (data: z.infer<typeof updatePassSchema>) => {
    setError(null);
    
    if (!userData?.id) {
      setError("User ID not found");
      return;
    }

    try {
      const response = await updateUserPass(userData.id, data);

      if (response?.error) {
        toast.error("Error!", {
          description: response.message,
        });
        setError(response.message);
        return;
      }

      toast.success("Success!", {
        description: "Password updated successfully!",
      });
      
      // Reset form after successful update
      form.reset();
      
    } catch {
      setError("An unexpected error occurred");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handlePassSubmit)} className="w-full">
        <fieldset
          className="flex flex-col gap-3"
          disabled={form.formState.isSubmitting}
        >
          <div className="flex flex-col gap-3">
            {/* Current Password */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        {...field}
                        placeholder="Current Password"
                        className="rounded-full px-5 bg-muted border-none flex-1"
                        type={showCurrentPassword ? "text" : "password"}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="w-10 h-10 rounded-full shadow-none"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
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

            {/* New Password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        {...field}
                        placeholder="New Password"
                        className="rounded-full px-5 bg-muted border-none flex-1"
                        type={showNewPassword ? "text" : "password"}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="w-10 h-10 rounded-full shadow-none"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
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

            {/* New Password Confirmation */}
            <FormField
              control={form.control}
              name="newPasswordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Confirm New Password"
                      className="rounded-full px-5 bg-muted border-none"
                      type={showNewPassword ? "text" : "password"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button type="submit" disabled={form.formState.isSubmitting} className="rounded-full ">
            {form.formState.isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Updating password...
              </>
            ) : (
              <>
                Update password
              </>
            )}
          </Button>
        </fieldset>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </Form>
  );
}