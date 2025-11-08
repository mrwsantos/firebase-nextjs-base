// hooks/useSimpleGuard.ts
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAdminOnly() {
    const { userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!userData?.role || userData.role !== 'admin') {
            router.push('/unauthorized');
        }
    }, [userData, loading, router]);

    return {
        isAdmin: userData?.role === 'admin',
        loading: loading || userData?.role !== 'admin'
    };
}