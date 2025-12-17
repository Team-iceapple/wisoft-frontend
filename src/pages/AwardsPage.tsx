import { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { processImageUrl } from '../utils/api'

// API 응답 타입 정의
interface Award {
  id: number
  year: number
  image_url: string
  image_type: string
  orientation: 'landscape' | 'portrait'
}

interface AwardsApiResponse {
  awards: Award[]
}

// 슬라이드 라인/열 설정
const ROW_COUNT = 3
const ITEMS_PER_VIEW = 3 // 한 번에 보여줄 아이템 수
const ANIMATION_DURATIONS = [30, 36, 32] as const // 느린 속도로 유지
const ROW_DIRECTIONS: Array<'normal' | 'reverse'> = ['normal', 'reverse', 'normal']

const slide = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`

const AwardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 1rem 2rem;
  gap: 1.5rem;
  overflow: hidden;
`

const AwardRow = styled.div<{ $totalRows: number }>`
  position: relative;
  width: 100%;
  height: calc((100% - ${(props) => (props.$totalRows - 1) * 1.5}rem) / ${(props) => props.$totalRows});
  min-height: 0;
  overflow: hidden;
`

const SlideWrapper = styled.div<{ $duration: number; $reverse: boolean }>`
  display: flex;
  width: 200%; /* 원본 + 복제본 */
  height: 100%;
  animation: ${slide} ${(props) => props.$duration}s linear infinite;
  animation-direction: ${(props) => (props.$reverse ? 'reverse' : 'normal')};
  will-change: transform;
`

const SlideSet = styled.div`
  display: flex;
  width: 50%; /* 트랙의 절반 = 화면 전체 */
  height: 100%;
`

const AwardItem = styled.div<{ $itemsPerView: number }>`
  flex: 0 0 calc(100% / ${(props) => props.$itemsPerView});
  max-width: calc(100% / ${(props) => props.$itemsPerView});
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  box-sizing: border-box;
  flex-shrink: 0;
`

const AwardImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
`

const distributeIntoRows = (items: string[]): string[][] => {
  const rows = Array.from({ length: ROW_COUNT }, () => [] as string[])

  items.forEach((image, index) => {
    rows[index % ROW_COUNT].push(image)
  })

  // 데이터가 부족한 경우에도 3열을 유지하기 위해 최소 1개씩 채워 넣음
  if (items.length > 0) {
    rows.forEach((row, rowIndex) => {
      if (row.length === 0) {
        rows[rowIndex].push(items[rowIndex % items.length])
      }
    })
  }

  return rows
}

const ensureMinimumItems = (items: string[], minCount: number): string[] => {
  if (items.length === 0) return []
  if (items.length >= minCount) return items

  const extended = [...items]
  let index = 0
  while (extended.length < minCount) {
    extended.push(items[index % items.length])
    index += 1
  }
  return extended
}

const AwardsPage = () => {
  const [awardImages, setAwardImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // API에서 수상 데이터 가져오기
  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
        const response = await fetch(`${apiBaseUrl}/api/awards`)

        if (!response.ok) {
          throw new Error('수상 데이터를 불러오는 데 실패했습니다.')
        }

        const data: AwardsApiResponse = await response.json()

        // image_url 배열로 변환
        if (data.awards && data.awards.length > 0) {
          const imageUrls = data.awards.map((award) => processImageUrl(award.image_url))
          setAwardImages(imageUrls)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
        console.error('수상 데이터 로딩 오류:', err)
        // 에러 발생 시 빈 배열 유지
      } finally {
        setLoading(false)
      }
    }

    fetchAwards()
  }, [])

  const rows = distributeIntoRows(awardImages)

  if (loading) {
    return (
      <AwardsContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '2rem' }}>
          로딩 중...
        </div>
      </AwardsContainer>
    )
  }

  if (error && awardImages.length === 0) {
    return (
      <AwardsContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '2rem', color: '#dc3545' }}>
          {error}
        </div>
      </AwardsContainer>
    )
  }

  return (
    <AwardsContainer>
      {rows.map((rowItems, rowIndex) => {
        const displayItems = ensureMinimumItems(rowItems, ITEMS_PER_VIEW)
        if (displayItems.length === 0) return null

        const duration = ANIMATION_DURATIONS[rowIndex % ANIMATION_DURATIONS.length]
        const isReverse = ROW_DIRECTIONS[rowIndex % ROW_DIRECTIONS.length] === 'reverse'

        return (
          <AwardRow key={rowIndex} $totalRows={ROW_COUNT}>
            <SlideWrapper $duration={duration} $reverse={isReverse}>
              {[0, 1].map((cloneIndex) => (
                <SlideSet key={`${rowIndex}-set-${cloneIndex}`}>
                  {displayItems.map((image, index) => (
                    <AwardItem key={`${rowIndex}-${cloneIndex}-${index}`} $itemsPerView={ITEMS_PER_VIEW}>
                      <AwardImage
                        src={image}
                        alt={`Award row ${rowIndex + 1} item ${index + 1}`}
                      />
                    </AwardItem>
                  ))}
                </SlideSet>
              ))}
            </SlideWrapper>
          </AwardRow>
        )
      })}
    </AwardsContainer>
  )
}

export default AwardsPage

