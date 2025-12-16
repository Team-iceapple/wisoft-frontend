/**
 * API 설정 및 유틸리티 함수
 */

// 환경 변수에서 API 베이스 URL 가져오기
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const HOME_API_BASE_URL = import.meta.env.VITE_HOME_API_BASE_URL || ''

/**
 * API 응답 타입
 */
export interface ApiError {
  message: string
  status?: number
}

/**
 * API 요청 옵션
 */
interface RequestOptions extends RequestInit {
  timeout?: number
}

/**
 * 기본 fetch 래퍼 함수
 */
async function apiRequest<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeout = 10000, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Content-Type 확인하여 JSON인지 검증
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      // HTML 응답인 경우 (에러 페이지 등)
      const text = await response.text()
      if (text.trim().startsWith('<!')) {
        throw new Error(`서버가 HTML을 반환했습니다. API 엔드포인트가 올바른지 확인해주세요. (URL: ${url})`)
      }
      throw new Error(`예상하지 못한 응답 형식입니다. (Content-Type: ${contentType})`)
    }

    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('요청 시간이 초과되었습니다.')
      }
      throw error
    }
    throw new Error('알 수 없는 오류가 발생했습니다.')
  }
}

/**
 * URL 조합 헬퍼 함수
 * 베이스 URL과 엔드포인트를 올바르게 조합합니다
 */
function combineUrl(baseUrl: string, endpoint: string): string {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${base}${path}`
}

/**
 * 일반 API (task-api) 엔드포인트 호출
 */
export async function apiGet<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  const url = combineUrl(API_BASE_URL, endpoint)
  return apiRequest<T>(url, { ...options, method: 'GET' })
}

/**
 * 홈 API (home-api) 엔드포인트 호출
 */
export async function homeApiGet<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  const url = combineUrl(HOME_API_BASE_URL, endpoint)
  return apiRequest<T>(url, { ...options, method: 'GET' })
}

/**
 * API 엔드포인트 상수
 */
export const API_ENDPOINTS = {
  // 일반 API
  PROJECTS: 'projects',
  PROJECT_DETAIL: (id: string) => `projects/${id}`,
  AWARDS: 'awards',
  PATENT: 'patent',
  PAPERS: 'papers',
  SEMINARS: 'notion/seminars',
  
  // 홈 API
  HOME: 'home',
} as const

