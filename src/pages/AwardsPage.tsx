import { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
// @ts-ignore
import awardImage1 from '../assets/image-awards1.jpg'
// @ts-ignore
import awardImage2 from '../assets/image-awards2.jpg'
// @ts-ignore
import awardImage3 from '../assets/image-awards3.jpg'
// @ts-ignore
import awardImage4 from '../assets/image-awards4.jpg'
// @ts-ignore
import awardImage5 from '../assets/image-awards5.jpg'

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

// 기본 이미지 배열 (API 데이터가 없을 경우 사용)
const defaultAwardImages = [
  awardImage1,
  awardImage2,
  awardImage3,
  awardImage4,
  awardImage5,
  awardImage1,
  awardImage2,
  awardImage3,
  awardImage4,
  awardImage5,
  awardImage1,
  awardImage2,
]

// 각 줄당 상장 개수
const ITEMS_PER_ROW = 4

// 각 줄별 애니메이션 속도 (초)
const ANIMATION_DURATIONS = [20, 25, 30] // 각 줄마다 다른 속도

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

// 무한 스크롤 애니메이션 생성
const createSlideAnimation = (duration: number, itemWidth: number) => keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-${itemWidth}%);
  }
`

const SlideWrapper = styled.div<{ $duration: number; $itemWidth: number }>`
  display: flex;
  width: 200%; /* 원본 + 복제본 */
  height: 100%;
  animation: ${(props) => createSlideAnimation(props.$duration, props.$itemWidth)} ${(props) => props.$duration}s linear infinite;
`

const AwardItem = styled.div<{ $itemWidth: number }>`
  width: ${(props) => props.$itemWidth}%;
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

const AwardsPage = () => {
  const [awardImages, setAwardImages] = useState<string[]>(defaultAwardImages)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // API에서 수상 데이터 가져오기
  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
        const response = await fetch(`${apiBaseUrl}/awards`)

        if (!response.ok) {
          throw new Error('수상 데이터를 불러오는 데 실패했습니다.')
        }

        const data: AwardsApiResponse = await response.json()

        // image_url 배열로 변환
        if (data.awards && data.awards.length > 0) {
          const imageUrls = data.awards.map((award) => award.image_url)
          setAwardImages(imageUrls)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
        console.error('수상 데이터 로딩 오류:', err)
        // 에러 발생 시 기본 이미지 사용
        setAwardImages(defaultAwardImages)
      } finally {
        setLoading(false)
      }
    }

    fetchAwards()
  }, [])

  // 동적으로 줄 수 계산
  const TOTAL_ROWS = Math.ceil(awardImages.length / ITEMS_PER_ROW)

  // 각 줄의 상장 목록을 분리
  const getRowItems = (rowIndex: number): string[] => {
    const start = rowIndex * ITEMS_PER_ROW
    const end = start + ITEMS_PER_ROW
    return awardImages.slice(start, end)
  }

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
      {Array.from({ length: TOTAL_ROWS }).map((_, rowIndex) => {
        const rowItems = getRowItems(rowIndex)
        if (rowItems.length === 0) return null

        const itemWidth = 100 / ITEMS_PER_ROW // 각 아이템이 차지하는 너비 (%)
        const duration = ANIMATION_DURATIONS[rowIndex % ANIMATION_DURATIONS.length]

        return (
          <AwardRow key={rowIndex} $totalRows={TOTAL_ROWS}>
            <SlideWrapper $duration={duration} $itemWidth={itemWidth * ITEMS_PER_ROW}>
              {/* 원본 이미지들 */}
              {rowItems.map((image, index) => (
                <AwardItem key={`original-${index}`} $itemWidth={itemWidth}>
                  <AwardImage
                    src={image}
                    alt={`Award row ${rowIndex + 1} item ${index + 1}`}
                    onError={(e) => {
                      // 이미지 로드 실패 시 기본 이미지 사용
                      const target = e.target as HTMLImageElement
                      if (target.src !== awardImage1) {
                        target.src = awardImage1
                      }
                    }}
                  />
                </AwardItem>
              ))}
              
              {/* 복제본 이미지들 (무한 루프용) */}
              {rowItems.map((image, index) => (
                <AwardItem key={`clone-${index}`} $itemWidth={itemWidth}>
                  <AwardImage
                    src={image}
                    alt={`Award row ${rowIndex + 1} clone ${index + 1}`}
                    onError={(e) => {
                      // 이미지 로드 실패 시 기본 이미지 사용
                      const target = e.target as HTMLImageElement
                      if (target.src !== awardImage1) {
                        target.src = awardImage1
                      }
                    }}
                  />
                </AwardItem>
              ))}
            </SlideWrapper>
          </AwardRow>
        )
      })}
    </AwardsContainer>
  )
}

export default AwardsPage

