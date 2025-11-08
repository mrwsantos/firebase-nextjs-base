"use server";

import { firestore, auth } from "@/firebase/server";
import { cookies } from "next/headers";

async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("firebaseAuthToken")?.value;

    if (!token) {
      return null;
    }

    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// === USER ACTIONS ===
export async function registerUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {

  try {
    // Verifica se email já existe
    try {
      await auth.getUserByEmail(data.email);
      return {
        error: true,
        message: "A user with this email already exists.",
      };
    } catch (error: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    // Cria usuário no Firebase Auth
    const userRecord = await auth.createUser({
      displayName: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: data.password,
      emailVerified: false,
    });


 

    // Cria usuário no Firestore
    const userData = {
      id: userRecord.uid,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      role: "admin",

      // Status simples
      accountStatus: "active", // modificar isso se precisar
      accountApproved: false,

      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await firestore.collection("users").doc(userRecord.uid).set(userData);

    return {
      success: true,
      userId: userRecord.uid,
      message: "User created successfully!",
    };
  } catch (error: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("❌ Error creating user:", error);
    return {
      error: true,
      message:
        error.code === "auth/email-already-exists"
          ? "A user with this email already exists."
          : "Failed to create user. Please try again.",
    };
  }
}
export async function updateUser(
  userId: string,
  data: {
    firstName: string;
    lastName: string;
  }
) {
  try {
    // Cria usuário no Firebase Auth
    const userRecord = await auth.updateUser(userId, {
      displayName: `${data.firstName} ${data.lastName}`,
    });

    // Cria usuário no Firestore
    const userData = {
      id: userId,
      name: `${data.firstName} ${data.lastName}`,
      updatedAt: new Date().toISOString(),
    };

    await firestore.collection("users").doc(userId).update(userData);

    console.log("✅ User created successfully");

    return {
      success: true,
      userId: userRecord.uid,
      message: "User updated Successfully!",
    };
  } catch (error: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("❌ Error updating user:", error);
    return {
      error: true,
      message: "Failed to update user. Please try again later.",
    };
  }
}
export async function updateUserPass(
  userId: string,
  data: {
    currentPassword: string;
    newPassword: string;
    newPasswordConfirmation: string;
  }
) {
  try {
    console.log("🔍 Starting password update for user:", userId);

    //Verificar se as senhas novas coincidem
    if (data.newPassword !== data.newPasswordConfirmation) {
      return {
        error: true,
        message: "New passwords don't match",
      };
    }

    // vuscar dados do usuário para verificar a senha atual
    const userDoc = await firestore.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return {
        error: true,
        message: "User not found",
      };
    }

    const userData = userDoc.data();
    const userEmail = userData?.email;

    if (!userEmail) {
      return {
        error: true,
        message: "User email not found",
      };
    }

    console.log("🔍 Verifying current password for:", userEmail);

    //Verificar senha atual fazendo login com ela
    try {
      // Usar Firebase Auth para verificar a senha atual
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { auth: clientAuth } = await import("@/firebase/client");

      await signInWithEmailAndPassword(
        clientAuth,
        userEmail,
        data.currentPassword
      );
      console.log("✅ Current password verified");
    } catch (authError: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log("❌ Current password verification failed:", authError.code);

      if (
        authError.code === "auth/invalid-credential" ||
        authError.code === "auth/wrong-password"
      ) {
        return {
          error: true,
          message: "Current password is incorrect",
        };
      }

      return {
        error: true,
        message: "Failed to verify current password",
      };
    }

    // 4. Atualizar a senha no Firebase Auth
    console.log("🔄 Updating password in Firebase Auth...");

    const userRecord = await auth.updateUser(userId, {
      password: data.newPassword,
    });

    console.log("✅ Password updated successfully");

    return {
      success: true,
      userId: userRecord.uid,
      message: "Password updated successfully!",
    };
  } catch (error: any) {// eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("❌ Error updating password:", error);

    let errorMessage = "Failed to update password. Please try again.";

    if (error.code === "auth/weak-password") {
      errorMessage = "Password is too weak. Please choose a stronger password.";
    } else if (error.code === "auth/user-not-found") {
      errorMessage = "User not found.";
    }

    return {
      error: true,
      message: errorMessage,
    };
  }
}
export async function completeUserRegistration(data: {
  userId: string;
  name: string;
  password: string;
}) {
  console.log("🔍 Completing registration for:", data.userId);

  try {
    // Verifica se usuário existe
    const userDoc = await firestore.collection("users").doc(data.userId).get();
    if (!userDoc.exists) {
      console.log("❌ User not found:", data.userId);
      return { error: true, message: "User not found." };
    }

    const userData = userDoc.data();
    console.log("🔍 Current user data:", {
      accountStatus: userData?.accountStatus,
      role: userData?.role,
      email: userData?.email,
    });

    // Verifica se ainda está pendente
    if (userData?.accountStatus !== "pending") {
      console.log("❌ User registration already completed");
      return { error: true, message: "User registration already completed." };
    }

    console.log("🔍 Updating Firebase Auth user...");

    // Atualiza senha no Firebase Auth
    await auth.updateUser(data.userId, {
      password: data.password,
      emailVerified: true,
      displayName: data.name,
    });

    console.log("✅ Firebase Auth updated");
    console.log("🔍 Updating Firestore user document...");

    // 🔥 CORRIGIDO: Staff convidado fica ATIVO automaticamente
    const updateData = {
      name: data.name,
      accountStatus: "active", // ✅ Fica ativo imediatamente para staff
      updatedAt: new Date().toISOString(),
      accountApproved: true,
    };

    // 🔥 ADICIONAL: Se for staff (não admin), não precisa de aprovação
    if (userData?.role !== "admin") {
      console.log("🔍 Staff member - setting as active immediately");
      // Staff convidado pelo admin já fica ativo
    }

    await firestore.collection("users").doc(data.userId).update(updateData);

    console.log("✅ Firestore updated with:", updateData);
    console.log("✅ Registration completed successfully");

    return {
      success: true,
      message: "Registration completed successfully!",
    };
  } catch (error: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("❌ Error completing registration:", error);
    return {
      error: true,
      message:
        error.code === "auth/weak-password"
          ? "Password is too weak"
          : "Failed to complete registration",
    };
  }
}
//-------------------------------------------------------------
