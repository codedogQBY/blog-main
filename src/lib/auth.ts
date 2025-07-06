import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from './api'

interface LoginResponse {
  accessToken: string
}

interface AuthState {
  isLoggedIn: boolean
  username: string | null
  accessToken: string | null
  isSuperAdmin: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      username: null,
      accessToken: null,
      isSuperAdmin: false,
      login: async (email: string, password: string) => {
        try {
          const response = await api.post<LoginResponse>('/auth/login', {
            mail: email,
            password: password
          })
          
          if (response.accessToken) {
            // 解码 JWT token 来获取用户信息
            const tokenPayload = JSON.parse(atob(response.accessToken.split('.')[1]))
            
            // 打印 JWT 解密信息
            console.log('JWT Token 解密信息:', {
              fullToken: response.accessToken,
              payload: tokenPayload,
              name: tokenPayload.name,
              isSuperAdmin: tokenPayload.isSuperAdmin,
              permissions: tokenPayload.permissions
            })
            
            // 检查是否为超级管理员
            if (tokenPayload.isSuperAdmin) {
              const newState = {
                isLoggedIn: true, 
                username: tokenPayload.name || email.split('@')[0], // 使用JWT中的name字段
                accessToken: response.accessToken,
                isSuperAdmin: true
              }
              
              console.log('设置登录状态:', newState)
              set(newState)
              return true
            } else {
              // 不是超级管理员，登录失败
              return false
            }
          }
          return false
        } catch (error) {
          console.error('登录失败:', error)
          return false
        }
      },
      logout: () => set({ isLoggedIn: false, username: null, accessToken: null, isSuperAdmin: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
) 