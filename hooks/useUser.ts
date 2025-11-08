// hooks/useUser.ts
"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth"

export const useUser = () => {
  const [loading, setLoading] = useState(false)
  const { userData } = useAuth() // Assumindo que seu AuthContext tem userData

  // Verificar status de convite
  const checkInvitationStatus = async (userId?: string, email?: string) => {
    try {
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (email) params.append('email', email)

      const response = await fetch(`/api/users/complete-registration?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check invitation')
      }

      return data
    } catch (error: any) {
      console.error('Error checking invitation:', error)
      throw error
    }
  }

  // Completar registro
  const completeRegistration = async (userId: string, name: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/users/complete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, name, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to complete registration')
      }

      return result
    } catch (error: any) {
      console.error('Error completing registration:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    checkInvitationStatus,
    completeRegistration,
    // 🔥 Função helper para verificar se é admin
    isAdmin: userData?.role === 'admin',
  }
}