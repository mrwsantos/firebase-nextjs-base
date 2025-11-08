import { NextRequest, NextResponse } from "next/server"
import { firestore } from '@/firebase/server'

// GET - Buscar usuário específico
export async function GET(
   request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: true, message: "User ID is required" },
        { status: 400 }
      )
    }

    // Buscar usuário no Firestore
    const userDoc = await firestore.collection("users").doc(id).get()

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: true, message: "User not found" },
        { status: 404 }
      )
    }

    const userData = { id: userDoc.id, ...userDoc.data() }

    return NextResponse.json({
      success: true,
      user: userData
    })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: true, message: "Failed to fetch user" },
      { status: 500 }
    )
  }
}

// // DELETE - Remover usuário
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;

//     if (!id) {
//       return NextResponse.json(
//         { error: true, message: "User ID is required" },
//         { status: 400 }
//       )
//     }

//     // Usar action centralizada
//     const result = await deleteStaffUser(id)

//     if (result.error) {
//       return NextResponse.json(
//         { error: true, message: result.message },
//         { status: 400 }
//       )
//     }

//     return NextResponse.json({
//       success: true,
//       message: result.message
//     })
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (error: any) {
//     console.error("Error deleting user:", error)
//     return NextResponse.json(
//       { error: true, message: "Failed to delete user" },
//       { status: 500 }
//     )
//   }
// }