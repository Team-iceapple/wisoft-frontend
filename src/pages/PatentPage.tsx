import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { apiGet, API_ENDPOINTS, processImageUrl } from '../utils/api'

interface Patent {
  id: string
  year: number
  pdf_url: string
}

interface PatentsApiResponse {
  patents: Patent[]
}

interface PatentData {
  url: string
  type: 'pdf'
}

const PatentContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 4rem 2rem 1rem;
  gap: 1rem;
  overflow: hidden;
  align-items: center;
  justify-content: flex-start;
`

const SlideSection = styled.section`
  position: relative;
  width: 100%;
  max-width: 140rem;
  height: 92%;
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

const SlideControls = styled.div`
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1.4rem;
  z-index: 10;
`

const SlideIndicators = styled.div`
  display: flex;
  gap: 1.4rem;
`

const SlideButton = styled.button<{ $direction: 'left' | 'right' }>`
  width: 3.8rem;
  height: 3.8rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 2.2rem;
  line-height: 1;
  padding-bottom: 0.6rem;
  border-radius: 50%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.3s, transform 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: translateY(-0.1rem);
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
  const [slideIndex, setSlideIndex] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatents = async () => {
      try {
        const data: PatentsApiResponse = await apiGet<PatentsApiResponse>(API_ENDPOINTS.PATENT)

        if (data.patents && data.patents.length > 0) {
          const viewerParams = {
            view: 'FitH',
            navpanes: '0',
            pagemode: 'none',
            toolbar: '0'
          }

          const appendViewerParams = (url: string) => {
            const [base, hash = ''] = url.split('#', 2)
            const searchParams = new URLSearchParams(hash)
            Object.entries(viewerParams).forEach(([key, value]) => {
              if (!searchParams.has(key)) searchParams.set(key, value)
            })
            const hashString = searchParams.toString()
            return hashString ? `${base}#${hashString}` : url
          }

          const patentDataList = data.patents.map((patent) => ({
            url: appendViewerParams(processImageUrl(patent.pdf_url)),
            type: 'pdf' as const
          }))
          setPatentData(patentDataList)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      } finally {
        setLoading(false)
      }
    }
    fetchPatents()
  }, [])

  const handleTransitionEnd = () => {
    setIsTransitioning(false)
    if (slideIndex === 0) {
      setSlideIndex(patentData.length)
    } else if (slideIndex === patentData.length + 1) {
      setSlideIndex(1)
    }
  }

  const handleSlideNext = useCallback(() => {
    if (patentData.length <= 1 || isTransitioning) return
    setIsTransitioning(true)
    setSlideIndex((prev) => prev + 1)
  }, [patentData.length, isTransitioning])

  const handleSlidePrev = useCallback(() => {
    if (patentData.length <= 1 || isTransitioning) return
    setIsTransitioning(true)
    setSlideIndex((prev) => prev - 1)
  }, [patentData.length, isTransitioning])

  useEffect(() => {
    if (patentData.length <= 1) return
    const slideInterval = setInterval(handleSlideNext, 5000)
    return () => clearInterval(slideInterval)
  }, [patentData.length, handleSlideNext])

  const handleIndicatorClick = (index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setSlideIndex(index + 1)
  }

  const actualSlideIndex = slideIndex <= 0 ? patentData.length - 1 : slideIndex > patentData.length ? 0 : slideIndex - 1

  if (loading) return <PatentContainer><div style={{ fontSize: '2rem' }}>로딩 중...</div></PatentContainer>
  if (error && patentData.length === 0) return <PatentContainer><div style={{ fontSize: '2rem', color: '#dc3545' }}>{error}</div></PatentContainer>
  if (patentData.length === 0) return <PatentContainer><SlideSection><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '2.4rem' }}>특허가 없습니다</div></SlideSection></PatentContainer>

  return (
    <PatentContainer>
      <SlideSection>
        <SlideWrapper
          $currentIndex={slideIndex}
          $totalSlides={patentData.length}
          $isTransitioning={isTransitioning}
          onTransitionEnd={handleTransitionEnd}
        >
          <SlidePdf $totalSlides={patentData.length} src={patentData[patentData.length - 1]?.url} title="clone-last" />
          {patentData.map((patent, index) => (
            <SlidePdf key={index} $totalSlides={patentData.length} src={patent.url} title={`slide-${index}`} />
          ))}
          <SlidePdf $totalSlides={patentData.length} src={patentData[0]?.url} title="clone-first" />
        </SlideWrapper>
        {patentData.length > 1 && (
          <SlideControls>
            <SlideButton $direction="left" onClick={handleSlidePrev}>‹</SlideButton>
            <SlideIndicators>
              {patentData.map((_, index) => (
                <Indicator key={index} $active={index === actualSlideIndex} onClick={() => handleIndicatorClick(index)} />
              ))}
            </SlideIndicators>
            <SlideButton $direction="right" onClick={handleSlideNext}>›</SlideButton>
          </SlideControls>
        )}
      </SlideSection>
    </PatentContainer>
  )
}

export default PatentPage