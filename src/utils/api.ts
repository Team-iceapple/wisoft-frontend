/**
 * API 설정 및 유틸리티 함수
 */

// 환경 변수에서 API 베이스 URL 가져오기
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
export const HOME_API_BASE_URL = import.meta.env.VITE_HOME_API_BASE_URL || ''

// 메모리 캐시 저장소
const apiCache = new Map<string, any>()

/**
 * API 응답 타입
 */
export interface ApiError {
  message: string
  status?: number
}

/**
 * API 에러 응답 타입 (명세에 따른 실패 응답 형식)
 */
interface ApiErrorResponse {
  error: string
  message: string
}

/**
 * API 요청 옵션
 */
interface RequestOptions extends RequestInit {
  timeout?: number
  useCache?: boolean // 캐시 사용 여부 선택 옵션 (기본값 true)
}

/**
 * 기본 fetch 래퍼 함수 (메모리 캐시 적용)
 */
async function apiRequest<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeout = 10000, useCache = true, ...fetchOptions } = options

  // GET 요청이고 캐시 사용이 활성화된 경우 캐시 확인
  if ((!fetchOptions.method || fetchOptions.method === 'GET') && useCache) {
    if (apiCache.has(url)) {
      return apiCache.get(url) as T
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const contentType = response.headers.get('content-type')
    const text = await response.text()

    if (!response.ok) {
      if (text.trim().startsWith('<!')) {
        throw new Error(`서버가 HTML을 반환했습니다. (URL: ${url})`)
      }
      
      try {
        const errorData: ApiErrorResponse = JSON.parse(text)
        if (errorData.error && errorData.message) {
          throw new Error(errorData.message)
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message) {
          throw parseError
        }
        throw new Error(`예상하지 못한 응답 형식입니다. (Content-Type: ${contentType})`)
      }
    }

    const trimmedText = text.trim()
    if (!trimmedText) {
      throw new Error(`서버가 빈 응답을 반환했습니다. (URL: ${url})`)
    }
    
    if (trimmedText.startsWith('<!')) {
      throw new Error(`서버가 HTML을 반환했습니다. (URL: ${url})`)
    }
    
    try {
      const result = JSON.parse(trimmedText) as T
      
      // 요청이 성공하면 메모리 캐시에 저장
      if ((!fetchOptions.method || fetchOptions.method === 'GET') && useCache) {
        apiCache.set(url, result)
      }
      
      return result
    } catch (parseError) {
      const preview = trimmedText.substring(0, 100)
      throw new Error(
        `JSON 파싱에 실패했습니다. (Content-Type: ${contentType || '없음'})\n` +
        `응답 미리보기: ${preview}${trimmedText.length > 100 ? '...' : ''}`
      )
    }
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

function getBaseUrl(baseUrl: string): string {
  if (!baseUrl) return baseUrl
  const normalized = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const labIndex = normalized.indexOf('/lab')
  if (labIndex !== -1) {
    const afterLab = normalized.substring(labIndex + 4)
    if (afterLab === '' || afterLab.startsWith('/')) {
      return normalized.substring(0, labIndex + 4)
    }
  }
  if (normalized.endsWith('/api')) {
    return normalized.slice(0, -4)
  }
  return normalized
}

function combineUrl(baseUrl: string, endpoint: string, isApiRequest: boolean = true): string {
  const base = getBaseUrl(baseUrl)
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  if (isApiRequest) {
    return `${base}/api${path}`
  }
  return `${base}${path}`
}

export function processImageUrl(imageUrl: string, baseUrl: string = API_BASE_URL): string {
  if (!imageUrl) return imageUrl
  
  const removeApiPath = (path: string): string => {
    if (path.startsWith('/api/')) {
      return path.replace(/^\/api/, '')
    }
    if (path === '/api') {
      return '/'
    }
    return path
  }
  
  const base = getBaseUrl(baseUrl)
  
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    if (imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1')) {
      try {
        const url = new URL(imageUrl)
        let path = url.pathname + url.search + url.hash
        path = removeApiPath(path)
        return `${base}${path}`
      } catch {
        const pathMatch = imageUrl.match(/^https?:\/\/[^/]+(\/.*)$/)
        if (pathMatch) {
          let path = pathMatch[1]
          path = removeApiPath(path)
          return `${base}${path}`
        }
        let path = imageUrl.replace(/^https?:\/\/[^/]+/, '')
        path = removeApiPath(path)
        return `${base}${path}`
      }
    }
    try {
      const url = new URL(imageUrl)
      let path = url.pathname + url.search + url.hash
      path = removeApiPath(path)
      return `${base}${path}`
    } catch {
      return imageUrl
    }
  }
  
  let path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
  path = removeApiPath(path)
  return `${base}${path}`
}

export async function apiGet<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  const url = combineUrl(API_BASE_URL, endpoint)
  return apiRequest<T>(url, { ...options, method: 'GET' })
}

export async function homeApiGet<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  const url = combineUrl(HOME_API_BASE_URL, endpoint)
  return apiRequest<T>(url, { ...options, method: 'GET' })
}

export const API_ENDPOINTS = {
  PROJECTS: 'projects',
  PROJECT_DETAIL: (id: string) => `projects/${id}`,
  AWARDS: 'awards',
  PATENT: 'patents',
  PAPERS: 'papers',
  SEMINARS: 'notion/seminars',
  HOME: 'home',
} as const