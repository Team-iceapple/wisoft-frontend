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

// 이미지 정보를 포함한 타입
interface AwardWithImage {
  imageUrl: string
  orientation: 'landscape' | 'portrait'
}

// 슬라이드 라인/열 설정
const ROW_COUNT = 3
const MIN_ITEMS_PER_ROW = 10
const ANIMATION_DURATIONS = [60, 70, 65] as const
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
  padding: 0.5rem 1rem;
  gap: 2.5rem;
  overflow: hidden;
`

const AwardRow = styled.div<{ $totalRows: number; $rowIndex: number }>`
  position: relative;
  width: 100%;
  height: ${(props) => {
    const availableHeight = 'calc(100% - 5rem)';
    if (props.$rowIndex < 2) {
      return `calc(${availableHeight} * 0.28)`;
    } else {
      return `calc(${availableHeight} * 0.44)`;
    }
  }};
  min-height: 0;
  overflow: hidden;
`

const SlideWrapper = styled.div<{ $duration: number; $reverse: boolean }>`
  display: flex;
  width: max-content;
  height: 100%;
  animation: ${slide} ${(props) => props.$duration}s linear infinite;
  animation-direction: ${(props) => (props.$reverse ? 'reverse' : 'normal')};
  will-change: transform;
  
  &::after {
    content: '';
    display: block;
    flex-shrink: 0;
  }
`

const SlideSet = styled.div`
  display: flex;
  height: 100%;
  gap: 2.5rem; 
  padding-right: 2.5rem;
  box-sizing: border-box;
`

const AwardItem = styled.div`
  height: 100%;
  width: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;
`

const AwardImage = styled.img`
  height: 100%;
  width: auto;
  object-fit: contain;
  object-position: center;
`

const getImageOrientation = (imageUrl: string): Promise<'landscape' | 'portrait'> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const orientation = img.width >= img.height ? 'landscape' : 'portrait'
      resolve(orientation)
    }
    img.onerror = () => {
      resolve('landscape')
    }
    img.src = imageUrl
  })
}

const distributeIntoRows = (items: AwardWithImage[]): string[][] => {
  const rows = Array.from({ length: ROW_COUNT }, () => [] as string[])

  items.forEach((item) => {
    if (item.orientation === 'landscape') {
      const rowIndex = rows[0].length <= rows[1].length ? 0 : 1
      rows[rowIndex].push(item.imageUrl)
    } else {
      rows[2].push(item.imageUrl)
    }
  })

  if (items.length > 0) {
    rows.forEach((row, rowIndex) => {
      if (row.length === 0) {
        const fallbackItem = items.find((item) =>
          rowIndex < 2 ? item.orientation === 'landscape' : item.orientation === 'portrait'
        ) || items[0]
        rows[rowIndex].push(fallbackItem.imageUrl)
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
  const [awardImages, setAwardImages] = useState<AwardWithImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
        const response = await fetch(`${apiBaseUrl}/api/awards`)

        if (!response.ok) {
          throw new Error('수상 데이터를 불러오는 데 실패했습니다.')
        }

        const data: AwardsApiResponse = await response.json()

        if (data.awards && data.awards.length > 0) {
          const awardsWithImages = await Promise.all(
            data.awards.map(async (award) => {
              const imageUrl = processImageUrl(award.image_url)
              const orientation = await getImageOrientation(imageUrl)
              return {
                imageUrl,
                orientation,
              }
            })
          )
          setAwardImages(awardsWithImages)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
        console.error('수상 데이터 로딩 오류:', err)
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
        const displayItems = ensureMinimumItems(rowItems, MIN_ITEMS_PER_ROW)
        if (displayItems.length === 0) return null

        const duration = ANIMATION_DURATIONS[rowIndex % ANIMATION_DURATIONS.length]
        const isReverse = ROW_DIRECTIONS[rowIndex % ROW_DIRECTIONS.length] === 'reverse'

        return (
          <AwardRow key={rowIndex} $totalRows={ROW_COUNT} $rowIndex={rowIndex}>
            <SlideWrapper $duration={duration} $reverse={isReverse}>
              {/* 2개의 복제본을 만들어 무한 루프 효과 생성 */}
              {[0, 1].map((cloneIndex) => (
                <SlideSet key={`${rowIndex}-set-${cloneIndex}`}>
                  {displayItems.map((image, index) => (
                    <AwardItem key={`${rowIndex}-${cloneIndex}-${index}`}>
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

