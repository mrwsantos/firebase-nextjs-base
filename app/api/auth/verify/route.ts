// app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/firebase/server";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("firebaseAuthToken")?.value;
        const refreshToken = cookieStore.get("firebaseAuthRefreshToken")?.value;

        console.log("🔍 Auth verify API:", {
            hasToken: !!token,
            hasRefreshToken: !!refreshToken,
            tokenLength: token?.length || 0
        });

        if (!token) {
            return NextResponse.json(
                { authenticated: false, reason: "No token" },
                { status: 401 }
            );
        }

        // Verificar se o token é válido
        const decodedToken = await auth.verifyIdToken(token);

        if (!decodedToken) {
            return NextResponse.json(
                { authenticated: false, reason: "Invalid token" },
                { status: 401 }
            );
        }

        console.log("✅ Auth verify successful for user:", decodedToken.uid);

        return NextResponse.json({
            authenticated: true,
            userId: decodedToken.uid,
            email: decodedToken.email
        });

    } catch (error) {
        console.error("❌ Auth verify error:", error);
        return NextResponse.json(
            { authenticated: false, reason: "Verification failed" },
            { status: 401 }
        );
    }
}