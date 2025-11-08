import { z } from "zod";

// ✅ Validação mais granular e reutilizável
export const passwordCriteria = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
};

// Função para verificar cada critério individualmente
export const checkPasswordCriteria = (password: string) => {
  return {
    minLength: password.length >= passwordCriteria.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };
};

// Função para verificar se senha é válida (todos os critérios)
export const isPasswordValid = (password: string) => {
  const criteria = checkPasswordCriteria(password);
  return Object.values(criteria).every(Boolean);
};

// Schema do Zod melhorado com mensagens mais específicas
export const passwordValidation = z
  .string()
  .min(1, "Password is required")
  .refine(
    (value) => value.length >= passwordCriteria.minLength,
    {
      message: `Password must be at least ${passwordCriteria.minLength} characters long`,
    }
  )
  .refine(
    (value) => /[A-Z]/.test(value),
    {
      message: "Password must contain at least one uppercase letter",
    }
  )
  .refine(
    (value) => /[a-z]/.test(value),
    {
      message: "Password must contain at least one lowercase letter",
    }
  )
  .refine(
    (value) => /\d/.test(value),
    {
      message: "Password must contain at least one number",
    }
  );

// Alternativa mais simples (original melhorada)
export const passwordValidationSimple = z.string()
  .min(1, "Password is required")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
    "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, and 1 number"
  );

// Schema de força da senha (opcional)
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  const criteria = checkPasswordCriteria(password);
  const validCount = Object.values(criteria).filter(Boolean).length;

  if (validCount <= 2) return 'weak';
  if (validCount === 3) return 'medium';
  return 'strong';
};

export const registerUserSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),

    email: z.string().email(),
    password: passwordValidation,
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        message: "Passwords do not match",
        path: ["confirmPassword"],
        code: "custom",
      });
    }
  });