/**
 * API 설정 및 유틸리티 함수
 */

// 환경 변수에서 API 베이스 URL 가져오기
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
export const HOME_API_BASE_URL = import.meta.env.VITE_HOME_API_BASE_URL || ''

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

    // Content-Type 확인 (로깅용)
    const contentType = response.headers.get('content-type')

    // 응답 본문을 텍스트로 먼저 읽기 (한 번만 읽을 수 있으므로)
    const text = await response.text()

    if (!response.ok) {
      // 에러 응답 처리: 명세에 따른 에러 응답 형식 파싱 시도
      // HTML 응답인지 확인
      if (text.trim().startsWith('<!')) {
        throw new Error(`서버가 HTML을 반환했습니다. API 엔드포인트가 올바른지 확인해주세요. (URL: ${url})`)
      }
      
      // JSON 파싱 시도
      try {
        const errorData: ApiErrorResponse = JSON.parse(text)
        // 명세에 따른 에러 응답 형식인지 확인 ({ error, message })
        if (errorData.error && errorData.message) {
          throw new Error(errorData.message)
        }
        // JSON 파싱은 성공했지만 에러 형식이 아닌 경우
        throw new Error(`HTTP error! status: ${response.status}`)
      } catch (parseError) {
        // 이미 throw된 에러인 경우 다시 throw
        if (parseError instanceof Error && parseError.message) {
          throw parseError
        }
        // JSON 파싱 실패한 경우
        throw new Error(`예상하지 못한 응답 형식입니다. (Content-Type: ${contentType})`)
      }
    }

    // 성공 응답 처리: Content-Type이 없어도 JSON 파싱 시도
    // 빈 응답 처리
    const trimmedText = text.trim()
    if (!trimmedText) {
      throw new Error(`서버가 빈 응답을 반환했습니다. (URL: ${url})`)
    }
    
    // HTML 응답인지 확인
    if (trimmedText.startsWith('<!')) {
      throw new Error(`서버가 HTML을 반환했습니다. API 엔드포인트가 올바른지 확인해주세요. (URL: ${url})`)
    }
    
    // JSON 파싱 시도
    try {
      return JSON.parse(trimmedText) as T
    } catch (parseError) {
      // JSON 파싱 실패 시 더 자세한 에러 메시지 제공
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

/**
 * 베이스 URL에서 /lab까지만 추출하는 함수
 * base_url이 https://example.com/lab/api 형태여도 /lab까지만 사용
 */
function getBaseUrl(baseUrl: string): string {
  if (!baseUrl) return baseUrl
  
  // URL 정규화 (끝의 / 제거)
  const normalized = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  
  // /lab이 포함되어 있으면 /lab까지만 사용
  const labIndex = normalized.indexOf('/lab')
  if (labIndex !== -1) {
    // /lab 다음에 /가 오거나 문자열이 끝나는 경우
    const afterLab = normalized.substring(labIndex + 4) // '/lab' 길이만큼 건너뛰기
    if (afterLab === '' || afterLab.startsWith('/')) {
      return normalized.substring(0, labIndex + 4) // /lab까지 포함
    }
  }
  
  // /lab이 없으면 원본 반환 (뒤의 /api 등 제거)
  // /api로 끝나면 제거
  if (normalized.endsWith('/api')) {
    return normalized.slice(0, -4)
  }
  
  return normalized
}

/**
 * URL 조합 헬퍼 함수
 * 베이스 URL과 엔드포인트를 올바르게 조합합니다
 * API 요청 시 /api를 자동으로 붙입니다
 */
function combineUrl(baseUrl: string, endpoint: string, isApiRequest: boolean = true): string {
  const base = getBaseUrl(baseUrl)
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  // API 요청인 경우 /api를 붙임
  if (isApiRequest) {
    return `${base}/api${path}`
  }
  
  return `${base}${path}`
}

/**
 * 이미지 URL 처리 함수
 * base_url에서 /lab까지만 사용하고, /api 경로를 제거합니다
 * 미디어 요청 시 /api를 제거하여 사용합니다
 */
export function processImageUrl(imageUrl: string, baseUrl: string = API_BASE_URL): string {
  if (!imageUrl) return imageUrl
  
  // /api 경로 제거 헬퍼 함수
  const removeApiPath = (path: string): string => {
    // /api로 시작하는 경로를 제거
    if (path.startsWith('/api/')) {
      return path.replace(/^\/api/, '')
    }
    // /api로 끝나는 경우도 처리
    if (path === '/api') {
      return '/'
    }
    return path
  }
  
  // base_url에서 /lab까지만 추출
  const base = getBaseUrl(baseUrl)
  
  // 절대 URL인 경우
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // localhost를 포함하는 경우 baseurl로 교체
    if (imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1')) {
      try {
        const url = new URL(imageUrl)
        let path = url.pathname + url.search + url.hash
        // /api 경로 제거
        path = removeApiPath(path)
        return `${base}${path}`
      } catch {
        // URL 파싱 실패 시 상대 경로로 처리
        const pathMatch = imageUrl.match(/^https?:\/\/[^/]+(\/.*)$/)
        if (pathMatch) {
          let path = pathMatch[1]
          path = removeApiPath(path)
          return `${base}${path}`
        }
        // 경로 추출 실패 시 상대 경로로 처리
        let path = imageUrl.replace(/^https?:\/\/[^/]+/, '')
        path = removeApiPath(path)
        return `${base}${path}`
      }
    }
    // 이미 절대 URL이고 localhost가 아닌 경우에도 /api 제거하고 base로 교체
    try {
      const url = new URL(imageUrl)
      let path = url.pathname + url.search + url.hash
      path = removeApiPath(path)
      return `${base}${path}`
    } catch {
      // URL 파싱 실패 시 원본 반환
      return imageUrl
    }
  }
  
  // 상대 경로인 경우 baseurl을 붙여주고 /api 제거
  let path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
  path = removeApiPath(path)
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
  PATENT: 'patents',
  PAPERS: 'papers',
  SEMINARS: 'notion/seminars',
  
  // 홈 API
  HOME: 'home',
} as const

