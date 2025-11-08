// app/api/auth/debug-cookies/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies();

        // Listar todos os cookies
        const allCookies = cookieStore.getAll();

        const authToken = cookieStore.get("firebaseAuthToken");
        const refreshToken = cookieStore.get("firebaseAuthRefreshToken");

        console.log("🔍 Debug API - All cookies:", allCookies.map(c => ({
            name: c.name,
            hasValue: !!c.value,
            valueLength: c.value?.length || 0
        })));

        const debugInfo = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            vercelUrl: process.env.VERCEL_URL,

            cookies: {
                total: allCookies.length,
                authToken: authToken ? {
                    name: authToken.name,
                    hasValue: !!authToken.value,
                    valueLength: authToken.value?.length || 0,
                    valuePreview: authToken.value?.substring(0, 20) + "..."
                } : null,
                refreshToken: refreshToken ? {
                    name: refreshToken.name,
                    hasValue: !!refreshToken.value,
                    valueLength: refreshToken.value?.length || 0
                } : null,
                allCookieNames: allCookies.map(c => c.name)
            },

            headers: {
                userAgent: process.env.VERCEL ? "Vercel" : "Local",
                host: process.env.VERCEL_URL || "localhost"
            }
        };

        console.log("🔍 Debug info:", debugInfo);

        return NextResponse.json({
            success: true,
            debug: debugInfo,
            hasAuthToken: !!authToken?.value,
            hasRefreshToken: !!refreshToken?.value
        });

    } catch (error) {
        console.error("❌ Debug cookies error:", error);
        const errorMessage = (error instanceof Error) ? error.message : String(error);
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}