"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { authService } from "@/services/auth-service"

interface User {
  id: string
  name: string
  email: string
  role?: string,
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<User> // Change this
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      authService
        .getCurrentUser()
        .then(setUser)
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { user, token } = await authService.login(email, password)
    localStorage.setItem("token", token)
    
    setUser(user)

    return user
  }

  const register = async (name: string, email: string, password: string) => {
    const { user, token } = await authService.register(name, email, password)
    localStorage.setItem("token", token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
