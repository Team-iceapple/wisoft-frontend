import { useState, useEffect } from 'react'
import styled from 'styled-components'

interface Patent {
  id: string
  title: string
  pdfUrl: string
}

const allPatents: Patent[] = [
  {
    id: '1',
    title: '특허 제목 1',
    pdfUrl: '/patents/patent1.pdf',
  },
  {
    id: '2',
    title: '특허 제목 2',
    pdfUrl: '/patents/patent2.pdf',
  },
  {
    id: '3',
    title: '특허 제목 3',
    pdfUrl: '/patents/patent3.pdf',
  },
  {
    id: '4',
    title: '특허 제목 4',
    pdfUrl: '/patents/patent4.pdf', // 실제 PDF 경로로 변경
  },
  {
    id: '5',
    title: '특허 제목 5',
    pdfUrl: '/patents/patent5.pdf', // 실제 PDF 경로로 변경
  },
]

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

const PdfSlide = styled.div<{ $totalSlides: number }>`
  width: ${(props) => 100 / (props.$totalSlides + 2)}%;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

const PdfViewer = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
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
  const [slideIndex, setSlideIndex] = useState(1) // 첫 번째 클론 다음부터 시작 (인덱스 1)
  const [isTransitioning, setIsTransitioning] = useState(true)

  // 모든 특허 표시
  const patents = allPatents

  // 슬라이드가 클론 위치에 도달했을 때 실제 위치로 이동
  useEffect(() => {
    if (!isTransitioning) {
      // transition이 끝난 후 클론 위치에 있으면 실제 위치로 즉시 이동
      if (slideIndex === 0) {
        // 첫 번째 클론에 도달하면 마지막 실제 PDF로 이동
        setSlideIndex(patents.length)
      } else if (slideIndex === patents.length + 1) {
        // 마지막 클론에 도달하면 첫 번째 실제 PDF로 이동
        setSlideIndex(1)
      }
    }
  }, [isTransitioning, slideIndex, patents.length])

  const handleSlidePrev = () => {
    if (patents.length <= 1) return

    if (slideIndex === 1) {
      // 첫 번째 실제 PDF에서 마지막 클론으로 이동
      setIsTransitioning(true)
      setSlideIndex(0)
      setTimeout(() => {
        setIsTransitioning(false)
        setSlideIndex(patents.length)
      }, 500)
    } else {
      setIsTransitioning(true)
      setSlideIndex((prev) => prev - 1)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 500)
    }
  }

  const handleSlideNext = () => {
    if (patents.length <= 1) return

    if (slideIndex === patents.length) {
      // 마지막 실제 PDF에서 첫 번째 클론으로 이동
      setIsTransitioning(true)
      setSlideIndex(patents.length + 1)
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
  }

  const handleIndicatorClick = (index: number) => {
    setIsTransitioning(true)
    setSlideIndex(index + 1) // 실제 PDF 인덱스는 클론 때문에 +1
    setTimeout(() => {
      setIsTransitioning(false)
    }, 500)
  }

  // 실제 슬라이드 인덱스 계산 (클론 제외, 인디케이터용)
  const actualSlideIndex = slideIndex <= 0 ? patents.length - 1 : slideIndex > patents.length ? 0 : slideIndex - 1

  if (patents.length === 0) {
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
          $totalSlides={patents.length}
          $isTransitioning={isTransitioning}
        >
          {/* 마지막 PDF 클론 (무한 루프용) */}
          <PdfSlide $totalSlides={patents.length}>
            <PdfViewer src={patents[patents.length - 1].pdfUrl} title={patents[patents.length - 1].title} />
          </PdfSlide>
          {/* 실제 PDF들 */}
          {patents.map((patent) => (
            <PdfSlide key={patent.id} $totalSlides={patents.length}>
              <PdfViewer src={patent.pdfUrl} title={patent.title} />
            </PdfSlide>
          ))}
          {/* 첫 번째 PDF 클론 (무한 루프용) */}
          <PdfSlide $totalSlides={patents.length}>
            <PdfViewer src={patents[0].pdfUrl} title={patents[0].title} />
          </PdfSlide>
        </SlideWrapper>
        {patents.length > 1 && (
          <>
            <SlideButton $direction="left" onClick={handleSlidePrev}>
              ‹
            </SlideButton>
            <SlideButton $direction="right" onClick={handleSlideNext}>
              ›
            </SlideButton>
            <SlideIndicators>
              {patents.map((_, index) => (
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
