import { useAuth } from "@/context/auth";
import { useMemo } from "react";

export const usePermissions = () => {
    const {  isAdmin} = useAuth();

    const permissions = useMemo(() => ({
        canManageUsers: isAdmin,
    }), [ isAdmin, 
        ]);

    return permissions;
};