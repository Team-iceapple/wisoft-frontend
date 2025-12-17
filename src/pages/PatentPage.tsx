import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { apiGet, API_ENDPOINTS, processImageUrl } from '../utils/api'

// API 응답 타입 정의
interface Patent {
  id: string
  year: number
  pdf_url: string
}

interface PatentsApiResponse {
  patents: Patent[]
}

// 특허 데이터 타입
interface PatentData {
  url: string
  type: 'pdf'
}

const PatentContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 2rem 4rem 4rem;
  gap: 2rem;
  overflow: hidden;
  align-items: center;
  justify-content: center;
`

const SlideSection = styled.section`
  position: relative;
  width: 100%;
  max-width: 140rem;
  height: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-radius: 2rem;
  background: #525252;
`

const SlideWrapper = styled.div<{ $currentIndex: number; $totalSlides: number; $isTransitioning: boolean }>`
  display: flex;
  width: ${(props) => (props.$totalSlides + 2) * 100}%;
  height: 100%;
  transform: translateX(${(props) => -(props.$currentIndex) * (100 / (props.$totalSlides + 2))}%);
  transition: ${(props) => (props.$isTransitioning ? 'transform 0.5s ease-in-out' : 'none')};
`

const SlidePdf = styled.iframe<{ $totalSlides: number }>`
  width: ${(props) => 100 / (props.$totalSlides + 2)}%;
  height: 100%;
  border: none;
  flex-shrink: 0;
  display: block;
`

const SlideIndicators = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1.5rem;
  z-index: 10;
`

const SlideButton = styled.button<{ $direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${(props) => (props.$direction === 'left' ? 'left: 1.5rem;' : 'right: 1.5rem;')}
  transform: translateY(-50%);
  width: 4rem;
  height: 4rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 2.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`

const Indicator = styled.button<{ $active: boolean }>`
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  background: ${(props) => (props.$active ? '#333' : '#ccc')};
  border: none;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  padding: 0;
  box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.2);

  &:hover {
    transform: scale(1.3);
    background: ${(props) => (props.$active ? '#333' : '#999')};
  }
`

const PatentPage = () => {
  const [patentData, setPatentData] = useState<PatentData[]>([])
  const [slideIndex, setSlideIndex] = useState(1) // 첫 번째 클론 다음부터 시작 (인덱스 1)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // API에서 특허 데이터 가져오기
  useEffect(() => {
    const fetchPatents = async () => {
      try {
        const data: PatentsApiResponse = await apiGet<PatentsApiResponse>(API_ENDPOINTS.PATENT)

        // pdf_url을 처리하여 저장 (모두 PDF)
        if (data.patents && data.patents.length > 0) {
          const patentDataList = data.patents.map((patent) => {
            const processedUrl = processImageUrl(patent.pdf_url)
            // PDF를 꽉 차게 표시하기 위한 파라미터 추가
            const pdfUrl = processedUrl.includes('#') 
              ? processedUrl 
              : `${processedUrl}#view=FitH`
            return {
              url: pdfUrl,
              type: 'pdf' as const
            }
          })
          setPatentData(patentDataList)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
        console.error('특허 데이터 로딩 오류:', err)
        // 에러 발생 시 빈 배열 유지
      } finally {
        setLoading(false)
      }
    }

    fetchPatents()
  }, [])

  // 슬라이드가 클론 위치에 도달했을 때 실제 위치로 이동
  useEffect(() => {
    if (!isTransitioning) {
      // transition이 끝난 후 클론 위치에 있으면 실제 위치로 즉시 이동
      if (slideIndex === 0) {
        // 첫 번째 클론에 도달하면 마지막 실제 이미지로 이동
        setSlideIndex(patentData.length)
      } else if (slideIndex === patentData.length + 1) {
        // 마지막 클론에 도달하면 첫 번째 실제 이미지로 이동
        setSlideIndex(1)
      }
    }
  }, [isTransitioning, slideIndex, patentData.length])

  const handleSlidePrev = useCallback(() => {
    if (patentData.length <= 1) return

    if (slideIndex === 1) {
      // 첫 번째 실제 이미지에서 마지막 클론으로 이동
      setIsTransitioning(true)
      setSlideIndex(0)
      setTimeout(() => {
        setIsTransitioning(false)
        setSlideIndex(patentData.length)
      }, 500)
    } else {
      setIsTransitioning(true)
      setSlideIndex((prev) => prev - 1)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 500)
    }
  }, [slideIndex, patentData.length])

  const handleSlideNext = useCallback(() => {
    if (patentData.length <= 1) return

    if (slideIndex === patentData.length) {
      // 마지막 실제 이미지에서 첫 번째 클론으로 이동
      setIsTransitioning(true)
      setSlideIndex(patentData.length + 1)
      setTimeout(() => {
        setIsTransitioning(false)
        setSlideIndex(1)
      }, 500)
    } else {
      setIsTransitioning(true)
      setSlideIndex((prev) => prev + 1)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 500)
    }
  }, [slideIndex, patentData.length])

  // 슬라이드 자동 재생
  useEffect(() => {
    if (patentData.length <= 1) return

    const slideInterval = setInterval(() => {
      handleSlideNext()
    }, 5000)

    return () => clearInterval(slideInterval)
  }, [patentData.length, handleSlideNext])

  const handleIndicatorClick = (index: number) => {
    setIsTransitioning(true)
    setSlideIndex(index + 1) // 실제 이미지 인덱스는 클론 때문에 +1
    setTimeout(() => {
      setIsTransitioning(false)
    }, 500)
  }

  // 실제 슬라이드 인덱스 계산 (클론 제외, 인디케이터용)
  const actualSlideIndex = slideIndex <= 0 ? patentData.length - 1 : slideIndex > patentData.length ? 0 : slideIndex - 1

  if (loading) {
    return (
      <PatentContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '2rem' }}>
          로딩 중...
        </div>
      </PatentContainer>
    )
  }

  if (error && patentData.length === 0) {
    return (
      <PatentContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '2rem', color: '#dc3545' }}>
          {error}
        </div>
      </PatentContainer>
    )
  }

  if (patentData.length === 0) {
    return (
      <PatentContainer>
        <SlideSection>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '2.4rem' }}>
            특허가 없습니다
          </div>
        </SlideSection>
      </PatentContainer>
    )
  }

  return (
    <PatentContainer>
      {/* 슬라이드 섹션 */}
      <SlideSection>
        <SlideWrapper
          $currentIndex={slideIndex}
          $totalSlides={patentData.length}
          $isTransitioning={isTransitioning}
        >
          {/* 마지막 PDF 클론 (무한 루프용) */}
          {patentData.length > 0 && (
            <>
              <SlidePdf 
                $totalSlides={patentData.length} 
                src={patentData[patentData.length - 1].url}
                title="Patent slide clone last"
              />
              {/* 실제 PDF들 */}
              {patentData.map((patent, index) => (
                <SlidePdf 
                  key={index} 
                  $totalSlides={patentData.length} 
                  src={patent.url}
                  title={`Patent slide ${index + 1}`}
                />
              ))}
              {/* 첫 번째 PDF 클론 (무한 루프용) */}
              <SlidePdf 
                $totalSlides={patentData.length} 
                src={patentData[0].url}
                title="Patent slide clone first"
              />
            </>
          )}
        </SlideWrapper>
        {patentData.length > 1 && (
          <>
            <SlideButton $direction="left" onClick={handleSlidePrev}>
              ‹
            </SlideButton>
            <SlideButton $direction="right" onClick={handleSlideNext}>
              ›
            </SlideButton>
            <SlideIndicators>
              {patentData.map((_, index) => (
                <Indicator
                  key={index}
                  $active={index === actualSlideIndex}
                  onClick={() => handleIndicatorClick(index)}
                />
              ))}
            </SlideIndicators>
          </>
        )}
      </SlideSection>
    </PatentContainer>
  )
}

export default PatentPage
