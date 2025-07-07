import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from './api'

interface LoginResponse {
  accessToken?: string
  requires2FA?: boolean
  userId?: string
  message?: string
  user?: any
  needsSetup2FA?: boolean
}

interface TwoFactorVerifyResponse {
  success: boolean
  message?: string
  accessToken?: string
}

interface TwoFactorCompleteResponse {
  accessToken: string
}

interface LoginResult {
  success: boolean
  needTwoFactor?: boolean
  notEnabled?: boolean
  message?: string
}

interface AuthState {
  isLoggedIn: boolean
  username: string | null
  accessToken: string | null
  isSuperAdmin: boolean
  login: (email: string, password: string, authCode?: string) => Promise<LoginResult>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      username: null,
      accessToken: null,
      isSuperAdmin: false,
      login: async (email: string, password: string, authCode?: string) => {
        try {
          // 如果有authCode，说明是2FA验证阶段
          if (authCode) {
            // 这里需要调用2FA验证接口
            // 由于前台没有保存userId，我们需要重新获取
            const loginResponse = await api.post<LoginResponse>('/auth/login', {
              mail: email,
              password: password
            })
            
            if (loginResponse.requires2FA && loginResponse.userId) {
              // 调用2FA验证接口
              const verifyResponse = await api.post<TwoFactorVerifyResponse>('/auth/two-factor/verify', {
                userId: loginResponse.userId,
                token: authCode
              })
              
              // verify接口直接返回完整的登录信息
              if (verifyResponse.accessToken) {
                const tokenPayload = JSON.parse(atob(verifyResponse.accessToken.split('.')[1]))
                
                if (tokenPayload.isSuperAdmin) {
                  const newState = {
                    isLoggedIn: true, 
                    username: tokenPayload.name || email.split('@')[0],
                    accessToken: verifyResponse.accessToken,
                    isSuperAdmin: true
                  }
                  
                  set(newState)
                  return { success: true }
                } else {
                  return { success: false, message: '只有超级管理员才能登录前台' }
                }
              } else {
                return { success: false, message: '验证码错误' }
              }
            }
            
            return { success: false, message: '2FA验证失败' }
          }
          
          // 正常的登录流程
          const response = await api.post<LoginResponse>('/auth/login', {
            mail: email,
            password: password
          })
          
          // 如果需要2FA验证
          if (response.requires2FA) {
            return { success: false, needTwoFactor: true }
          }
          
          // 如果需要设置2FA
          if (response.needsSetup2FA) {
            return { success: false, notEnabled: true }
          }
          
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
              return { success: true }
            } else {
              // 不是超级管理员，登录失败
              return { success: false, message: '只有超级管理员才能登录前台' }
            }
          }
          return { success: false, message: '登录失败' }
        } catch (error: any) {
          console.error('登录失败:', error)
          
          // 根据错误类型返回不同的结果
          if (error.response?.status === 401) {
            if (error.response?.data?.message?.includes('2FA')) {
              return { success: false, needTwoFactor: true }
            } else if (error.response?.data?.message?.includes('not enabled')) {
              return { success: false, notEnabled: true }
            }
          }
          
          return { success: false, message: '登录失败，请稍后重试' }
        }
      },
      logout: () => set({ isLoggedIn: false, username: null, accessToken: null, isSuperAdmin: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
) 