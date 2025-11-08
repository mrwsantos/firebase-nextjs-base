import { decodeJwt } from "jose"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

// Validação simples do token
async function validateToken(token: string): Promise<boolean> {
  try {
    const decoded = decodeJwt(token) as any
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp > currentTime
  } catch {
    return false
  }
}

// Rotas publicas
const PUBLIC_ROUTES = [
  "/login",
  "/register", 
  "/forgot-password",
  "/reset-password"
]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const cookieStore = await cookies()
  const token = cookieStore.get("firebaseAuthToken")?.value

  // Se é rota pública
  if (isPublicRoute(pathname)) {
    // Se está logado, redireciona para raiz
    if (token && await validateToken(token)) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    // Se não está logado, permite acesso
    return NextResponse.next()
  }

  // Para todas as outras rotas, precisa estar logado
  if (!token || !await validateToken(token)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Está logado e é rota protegida, permite acesso
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/account",
    "/forgot-password",
    "/login",
    "/register",
    "/oauth/:path*"
  ]
}