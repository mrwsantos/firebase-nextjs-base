export interface UserClaims {
    admin?: boolean;
    [key: string]: any;
}

export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    emailVerified: boolean;
    claims: UserClaims;
}