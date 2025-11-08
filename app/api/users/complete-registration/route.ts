import { NextRequest, NextResponse } from "next/server"
import { firestore } from "@/firebase/server"
import { completeUserRegistration } from "@/actions"
import { z } from "zod"

// Schema para completar registro
const completeRegistrationSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

// Interface para dados do usuário
interface UserData {
    id: string;
    email?: string;
    accountStatus?: string;
    name?: string;
    role?: string;
    [key: string]: unknown; // Para outras propriedades do Firestore
}

// POST - Completar registro do usuário
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validar dados
        const validation = completeRegistrationSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                {
                    error: true,
                    message: validation.error.issues[0].message
                },
                { status: 400 }
            )
        }

        const { userId, name, password } = validation.data

        // Usar action centralizada
        const result = await completeUserRegistration({ userId, name, password })

        if (result.error) {
            return NextResponse.json(
                { error: true, message: result.message },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: result.message
        })
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to complete registration";
        console.error("Error completing registration:", error)
        return NextResponse.json(
            { error: true, message: errorMessage },
            { status: 500 }
        )
    }
}

// GET - Verificar status de convite
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const email = searchParams.get('email')

        if (!userId && !email) {
            return NextResponse.json(
                { error: true, message: "User ID or email is required" },
                { status: 400 }
            )
        }

        let userDoc

        if (userId) {
            userDoc = await firestore.collection("users").doc(userId).get()
        } else if (email) {
            const userSnapshot = await firestore
                .collection("users")
                .where("email", "==", email)
                .limit(1)
                .get()

            if (!userSnapshot.empty) {
                userDoc = userSnapshot.docs[0]
            }
        }

        if (!userDoc || !userDoc.exists) {
            return NextResponse.json(
                { error: true, message: "User not found" },
                { status: 404 }
            )
        }

        // Tipo seguro para os dados do usuário
        const userData: UserData = { 
            id: userDoc.id, 
            ...userDoc.data() 
        } as UserData

        // Informações seguras para o frontend
        const publicData = {
            id: userData.id,
            email: userData.email,
            accountStatus: userData.accountStatus,
            name: userData.name,
            role: userData.role,
        }

        return NextResponse.json({
            success: true,
            user: publicData,
            needsRegistration: userData.accountStatus === "pending"
        })
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to check invitation status";
        console.error("Error checking invitation:", error)
        return NextResponse.json(
            { error: true, message: errorMessage },
            { status: 500 }
        )
    }
}