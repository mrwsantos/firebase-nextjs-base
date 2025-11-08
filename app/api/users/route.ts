import { NextRequest, NextResponse } from "next/server"
import { firestore, auth } from "@/firebase/server"
import { z } from "zod"
import { cookies } from "next/headers"

// Função para pegar o usuário atual
async function getCurrentUser() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("firebaseAuthToken")?.value

        if (!token) {
            console.log('❌ No token found')
            return null
        }

        const decodedToken = await auth.verifyIdToken(token)
        console.log('✅ Token verified for user:', decodedToken.uid)
        return decodedToken
    } catch (error) {
        console.error("❌ Error getting current user:", error)
        return null
    }
}

// Schema de validação para criação
const createUserSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(['editor', 'viewer', 'master'], {
        required_error: "Role is required",
    }),
})

// Schema de validação unificado para aprovação/negação
const userActionSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    action: z.enum(['approve', 'deny'], {
        required_error: "Action is required (approve or deny)",
    }),
})

// GET - Buscar usuários pendentes de aprovação
export async function GET(request: NextRequest) {
    try {
        console.log('🔍 GET /api/users - Starting request for pending approvals')

        const { searchParams } = new URL(request.url)

        // Verificar autenticação
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            console.log('❌ No authenticated user')
            return NextResponse.json(
                { error: true, message: "Unauthorized" },
                { status: 401 }
            )
        }

        console.log('🔍 Current user:', currentUser.uid)

        // Verificar se o usuário pertence à empresa
        const currentUserDoc = await firestore.collection("users").doc(currentUser.uid).get()

        if (!currentUserDoc.exists) {
            console.log('❌ Current user document not found')
            return NextResponse.json(
                { error: true, message: "User not found" },
                { status: 403 }
            )
        }
    } catch (error: any) {// eslint-disable-line @typescript-eslint/no-explicit-any
        console.error("❌ Error fetching pending users:", error)
        console.error("❌ Error stack:", error.stack)
        return NextResponse.json(
            { error: true, message: "Failed to fetch pending users", details: error.message },
            { status: 500 }
        )
    }
}

// POST - Criar usuário, aprovar ou negar
export async function POST(request: NextRequest) {
    try {
        console.log('🔍 POST /api/users - Starting request')

        const body = await request.json()
        console.log('🔍 Request body:', body)

        // Verificar se é ação de aprovação/negação ou criação
        if (body.userId && body.action) {
            // Processo de aprovação/negação
            const validation = userActionSchema.safeParse(body)
            if (!validation.success) {
                console.log('❌ User action validation failed:', validation.error.issues)
                return NextResponse.json(
                    {
                        error: true,
                        message: validation.error.issues[0].message
                    },
                    { status: 400 }
                )
            }

            const { userId, action } = validation.data

            // Verificar autenticação
            const currentUser = await getCurrentUser()
            if (!currentUser) {
                console.log('❌ No authenticated user')
                return NextResponse.json(
                    { error: true, message: "Unauthorized" },
                    { status: 401 }
                )
            }

            // Verificar se o usuário atual tem permissão (master)
            const currentUserDoc = await firestore.collection("users").doc(currentUser.uid).get()
            if (!currentUserDoc.exists) {
                return NextResponse.json(
                    { error: true, message: "User not found" },
                    { status: 403 }
                )
            }

            const currentUserData = currentUserDoc.data()
            if (currentUserData?.role !== 'master') {
                return NextResponse.json(
                    { error: true, message: "Access denied - Master role required" },
                    { status: 403 }
                )
            }

            // Verificar se o usuário alvo existe
            const targetUserDoc = await firestore.collection("users").doc(userId).get()
            if (!targetUserDoc.exists) {
                return NextResponse.json(
                    { error: true, message: "User not found" },
                    { status: 404 }
                )
            }

            console.log(`🔍 ${action}ing user:`, userId)

            if (action === 'approve') {
                // Aprovar usuário
                await firestore.collection("users").doc(userId).update({
                    accountApproved: true,
                    approvedAt: new Date().toISOString(),
                    approvedBy: currentUser.uid
                })

                console.log('✅ User approved successfully')

                return NextResponse.json({
                    success: true,
                    message: "User approved successfully",
                    userId: userId
                })

            } else if (action === 'deny') {
                // Negar usuário (deletar)
                await firestore.collection("users").doc(userId).delete()

                console.log('✅ User denied and deleted successfully')

                return NextResponse.json({
                    success: true,
                    message: "User denied and removed successfully",
                    userId: userId
                })
            }

        } else {
            // Processo de criação (código original)
            const validation = createUserSchema.safeParse(body)
            if (!validation.success) {
                console.log('❌ Creation validation failed:', validation.error.issues)
                return NextResponse.json(
                    {
                        error: true,
                        message: validation.error.issues[0].message
                    },
                    { status: 400 }
                )
            }

            const { email, role } = validation.data

            console.log('🔍 Creating staff user:', { email, role })
        }

    } catch (error: any) {// eslint-disable-line @typescript-eslint/no-explicit-any
        console.error("❌ Error in POST /api/users:", error)
        console.error("❌ Error stack:", error.stack)
        return NextResponse.json(
            { error: true, message: "Operation failed", details: error.message },
            { status: 500 }
        )
    }
}