import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const storedUser = localStorage.getItem('authUser')
  const storedToken = localStorage.getItem('authToken')
  
  console.log('Auth store initialization:')
  console.log('Stored token:', storedToken)
  console.log('Stored user:', storedUser)
  
  const user = ref(storedUser ? JSON.parse(storedUser) : null)
  const token = ref(storedToken || null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)
  const userRole = computed(() => {
    console.log('Getting user role:', user.value?.role)
    return user.value?.role || 'guest'
  })

  // Actions
  const login = async (credentials) => {
    isLoading.value = true
    error.value = null

    try {
      // 실제 API 호출
      const loginData = await authService.login(credentials)
      console.log('Login data from authService:', loginData)

      // 응답 데이터 구조에 따라 조정 필요
      if (loginData && loginData.token && loginData.user) {
        // 상태 업데이트
        user.value = loginData.user
        token.value = loginData.token
        
        console.log('User role:', loginData.user.role)
        console.log('Token:', loginData.token)

        // 로컬 스토리지에 토큰과 사용자 정보 저장
        try {
          localStorage.setItem('authToken', loginData.token)
          localStorage.setItem('authUser', JSON.stringify(loginData.user))
          console.log('Successfully saved to localStorage')
          
          // 저장 확인
          const savedToken = localStorage.getItem('authToken')
          const savedUser = localStorage.getItem('authUser')
          console.log('Verification - saved token:', savedToken ? 'exists' : 'missing')
          console.log('Verification - saved user:', savedUser ? 'exists' : 'missing')
        } catch (storageError) {
          console.error('Failed to save to localStorage:', storageError)
        }

        return { success: true, user: loginData.user }
      } else {
        // 임시 로그인 처리 (API가 아직 준비되지 않은 경우)
        await new Promise(resolve => setTimeout(resolve, 1000))

        const mockUser = {
          id: 1,
          username: credentials.username,
          email: `${credentials.username}@example.com`,
          role: credentials.username === 'admin' ? 'ADMIN' : 'USER'
        }

        const mockToken = 'mock-jwt-token-' + Date.now()

        // 상태 업데이트
        user.value = mockUser
        token.value = mockToken

        // 로컬 스토리지에 토큰과 사용자 정보 저장
        localStorage.setItem('authToken', mockToken)
        localStorage.setItem('authUser', JSON.stringify(mockUser))

        return { success: true, user: mockUser }
      }
    } catch (err) {
      error.value = err.message || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
  }

  const register = async (userData) => {
    isLoading.value = true
    error.value = null

    try {
      // 실제 API 호출
      const response = await authService.register(userData)

      // 백엔드 응답이 SuccessResponse로 래핑되어 있는 경우
      const registerData = response.message || response

      // 회원가입 성공 시 자동 로그인
      if (registerData.token && registerData.user) {
        // 상태 업데이트
        user.value = registerData.user
        token.value = registerData.token

        // 로컬 스토리지에 토큰과 사용자 정보 저장
        localStorage.setItem('authToken', registerData.token)
        localStorage.setItem('authUser', JSON.stringify(registerData.user))

        return { success: true, user: registerData.user }
      } else if (response.status === 'success' || response.code === 200) {
        return { success: true, message: 'Registration successful' }
      } else {
        // 임시 회원가입 처리 (API가 아직 준비되지 않은 경우)
        await new Promise(resolve => setTimeout(resolve, 1000))

        return { success: true, message: 'Registration successful' }
      }
    } catch (err) {
      error.value = err.message || 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const checkAuth = async () => {
    if (!token.value) return false

    try {
      // 토큰 유효성 검증 API 호출
      const response = await authService.validateToken(token.value)
      console.log('Token validation response:', response)

      if (response.valid) {
        // 응답에 사용자 정보가 포함되어 있으면 업데이트
        if (response.user) {
          user.value = response.user
          console.log('User updated from validation response:', user.value)
        } else if (!user.value) {
          // 사용자 정보가 없으면 localStorage에서 복원 시도
          const storedUser = localStorage.getItem('authUser')
          if (storedUser) {
            user.value = JSON.parse(storedUser)
            console.log('User restored from localStorage:', user.value)
          } else {
            // 마지막 수단으로 API 호출
            try {
              const userResponse = await authService.getCurrentUser()
              user.value = userResponse.user || userResponse
              console.log('User fetched from API:', user.value)
            } catch (error) {
              console.error('Failed to get current user:', error)
            }
          }
        }

        return true
      } else {
        // 임시 토큰 검증 (API가 아직 준비되지 않은 경우)
        const isValid = token.value.startsWith('mock-jwt-token-')

        if (!isValid) {
          logout()
          return false
        }

        // 사용자 정보가 없으면 로컬 스토리지에서 복원
        if (!user.value) {
          const storedUser = localStorage.getItem('authUser')
          if (storedUser) {
            user.value = JSON.parse(storedUser)
          } else {
            user.value = {
              id: 1,
              username: 'testuser',
              email: 'testuser@example.com',
              role: 'USER'
            }
          }
        }

        return true
      }
    } catch {
      logout()
      return false
    }
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    currentUser,
    userRole,

    // Actions
    login,
    logout,
    register,
    checkAuth
  }
})
