// hooks/useProtectedPage.ts
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UseProtectedPageOptions {
    adminOnly?: boolean;
    masterOnly?:boolean;
}

export function useProtectedPage(options: UseProtectedPageOptions = {}) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (loading) return;

        // Básico: precisa estar logado
        if (!user) {
            router.push("/login");
            return;
        }

        // Se é admin only
        if (options.adminOnly && userData?.role !== 'admin') {
            router.push("/unauthorized");
            return;
        }

        // Se é master only
        if (options.masterOnly && userData?.role !== 'master') {
            router.push("/unauthorized");
            return;
        }

        // Tudo OK
        setIsReady(true);
    }, [user, userData, loading, router, options]);

    return {
        loading: loading || !isReady,
        isReady
    };
}