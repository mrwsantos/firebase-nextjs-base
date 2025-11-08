"use server";

import { auth } from "@/firebase/server";
import { cookies } from "next/headers";

export const setToken = async ({
  token,
  refreshToken,
}: {
  token: string;
  refreshToken: string;
}) => {
  try {
    // Verify token first
    const verifiedToken = await auth.verifyIdToken(token);
    if (!verifiedToken) {
      throw new Error("Invalid token");
    }

    const cookieStore = await cookies();

    // Simple cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      // maxAge: 60 * 60 * 24 * 7, // 7 days
      maxAge: 60 * 60 * 12, // 12 hours
      path: "/",
    };

    // Set cookies
    cookieStore.set("firebaseAuthToken", token, cookieOptions);
    cookieStore.set("firebaseAuthRefreshToken", refreshToken, cookieOptions);

    console.log("✅ Cookies set");
    return { success: true };

  } catch (error) {
    console.error("❌ Error setting token:", error);
    throw error;
  }
};

export const removeToken = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("firebaseAuthToken");
    cookieStore.delete("firebaseAuthRefreshToken");
    console.log("✅ Tokens removed");
  } catch (error) {
    console.error("❌ Error removing tokens:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("firebaseAuthToken")?.value;

    if (!token) {
      return null;
    }

    const verifiedToken = await auth.verifyIdToken(token);
    const userRecord = await auth.getUser(verifiedToken.uid);

    return {
      uid: verifiedToken.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      emailVerified: userRecord.emailVerified,
    };
  } catch (error) {
    console.error("❌ Error getting current user:", error);
    return null;
  }
};