// app/(protected)/layout.tsx
"use client";

import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "@/components/ui/loading";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        // Se não tem usuário, vai pro login
        if (!user) {
            router.push("/login");
            return;
        }
    }, [user, loading, router]);

    // Loading
    if (loading || !user ) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading  text="Loading..." />
            </div>
        );
    }

    return <>{children}</>;
}