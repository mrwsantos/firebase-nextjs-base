import { NextResponse } from "next/server"
import { firestore, auth } from "@/firebase/server"
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

// GET - Buscar TODOS os usuários
export async function GET() {
    try {
        console.log('🔍 GET /api/users/all - Starting request')

        // Verificar autenticação
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            console.log('❌ No authenticated user')
            return NextResponse.json(
                { error: true, message: "Unauthorized" },
                { status: 401 }
            )
        }

        // Verificar se é master
        const currentUserDoc = await firestore.collection("users").doc(currentUser.uid).get()
        const currentUserData = currentUserDoc.data()

        if (currentUserData?.role !== 'master') {
            console.log('❌ User is not master')
            return NextResponse.json(
                { error: true, message: "Access denied - Master role required" },
                { status: 403 }
            )
        }

        console.log('✅ User access verified, fetching ALL users...')
    } catch (error: any) {  //eslint-disable-line @typescript-eslint/no-explicit-any
        console.error("❌ Error fetching users:", error)
        return NextResponse.json(
            { 
                error: true, 
                message: "Failed to fetch users", 
                details: error.message 
            },
            { status: 500 }
        )
    }
}

// POST para aprovar/negar usuários
export async function POST(request: Request) {
    try {
        console.log('🔍 POST /api/users/all - Starting request')

        // Verificar autenticação
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            console.log('❌ No authenticated user')
            return NextResponse.json(
                { error: true, message: "Unauthorized" },
                { status: 401 }
            )
        }

        // Verificar se é master
        const currentUserDoc = await firestore.collection("users").doc(currentUser.uid).get()
        const currentUserData = currentUserDoc.data()

        if (currentUserData?.role !== 'master') {
            console.log('❌ User is not master')
            return NextResponse.json(
                { error: true, message: "Access denied - Master role required" },
                { status: 403 }
            )
        }

        // Pegar dados do request
        const { userId, action } = await request.json()

        if (!userId || !action) {
            return NextResponse.json(
                { error: true, message: "userId and action are required" },
                { status: 400 }
            )
        }

        console.log(`🔍 Processing ${action} for user:`, userId)

        if (action === "approve") {
            // Aprovar usuário
            await firestore.collection("users").doc(userId).update({
                accountApproved: true,
                approvedAt: new Date().toISOString(),
                approvedBy: currentUser.uid
            })

            console.log('✅ User approved:', userId)
            return NextResponse.json({
                success: true,
                message: "User approved successfully"
            })

        } else if (action === "deny") {
            console.log('🗑️ Starting user deletion process for:', userId)

            try {
                // ✅ PASSO 1: Remover do Firebase Authentication
                console.log('🔥 Deleting user from Firebase Auth...')
                await auth.deleteUser(userId)
                console.log('✅ User deleted from Firebase Auth')

            } catch (authError: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
                console.warn('⚠️ Failed to delete from Firebase Auth (user may not exist):', authError.message)
                // Continuar mesmo se falhar - usuário pode não existir no Auth
            }

            try {
                // ✅ PASSO 2: Remover do Firestore
                console.log('📄 Deleting user from Firestore...')
                await firestore.collection("users").doc(userId).delete()
                console.log('✅ User deleted from Firestore')

            } catch (firestoreError: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
                console.error('❌ Failed to delete from Firestore:', firestoreError)
                // Se falhar no Firestore, é mais crítico
                return NextResponse.json(
                    { 
                        error: true, 
                        message: "Failed to delete user from database",
                        details: firestoreError.message 
                    },
                    { status: 500 }
                )
            }

            console.log('✅ User completely removed from both Auth and Firestore:', userId)
            return NextResponse.json({
                success: true,
                message: "User removed successfully from both authentication and database"
            })

        } else {
            return NextResponse.json(
                { error: true, message: "Invalid action. Use 'approve' or 'deny'" },
                { status: 400 }
            )
        }

    } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
        console.error("❌ Error processing user action:", error)
        return NextResponse.json(
            { 
                error: true, 
                message: "Failed to process user action", 
                details: error.message 
            },
            { status: 500 }
        )
    }
}
