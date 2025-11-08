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

// GET - Buscar TODOS os usuários pendentes de aprovação
export async function GET() {
    try {
        console.log('🔍 GET /api/users/pending-approval - Starting request')

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

        // Verificar se o usuário atual tem permissão (deve ser master)
        const currentUserDoc = await firestore.collection("users").doc(currentUser.uid).get()

        if (!currentUserDoc.exists) {
            console.log('❌ Current user document not found')
            return NextResponse.json(
                { error: true, message: "User not found" },
                { status: 403 }
            )
        }

        const currentUserData = currentUserDoc.data()
        console.log('🔍 Current user data:', {
            role: currentUserData?.role
        })

        // Verificar se é master
        if (currentUserData?.role !== 'master') {
            console.log('❌ User is not master')
            return NextResponse.json(
                { error: true, message: "Access denied - Master role required" },
                { status: 403 }
            )
        }

        console.log('✅ User access verified, fetching ALL pending users...')

        const usersSnapshot = await firestore
            .collection("users")
            .get()

        console.log('🔍 Found total users count:', usersSnapshot.docs.length)

        // Filtrar usuários pendentes (accountApproved = false ou não existe)
        const pendingUsers = usersSnapshot.docs
            .map(doc => {
                const data = doc.data()
                return {
                    id: doc.id,
                    ...data
                }
            })
            .filter((user: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                const accountApproved = user.accountApproved
                const isPending = accountApproved === false || accountApproved === undefined
                
                console.log('🔍 User check:', {
                    id: user.id,
                    email: user.email || 'No email',
                    accountApproved: accountApproved ?? 'undefined',
                    isPending
                })
                
                return isPending
            })

        console.log('🔍 Found pending users count:', pendingUsers.length)

        // Ordenar por data de criação (mais recentes primeiro)
        pendingUsers.sort((a: any, b: any) => {// eslint-disable-line @typescript-eslint/no-explicit-any
            const dateA = new Date(a.createdAt || 0).getTime()
            const dateB = new Date(b.createdAt || 0).getTime()
            return dateB - dateA
        })

        console.log('✅ Returning ALL pending users successfully')

        return NextResponse.json({
            success: true,
            users: pendingUsers,
            count: pendingUsers.length
        })

    } catch (error: any) {// eslint-disable-line @typescript-eslint/no-explicit-any
        console.error("❌ Error fetching pending users:", error)
        console.error("❌ Error stack:", error.stack)
        return NextResponse.json(
            { error: true, message: "Failed to fetch pending users", details: error.message },
            { status: 500 }
        )
    }
}