import { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
// @ts-ignore
import slideImage1 from '../assets/image-slide1.jpg'
// @ts-ignore
import slideImage2 from '../assets/image-slide2.jpg'

// 슬라이드 이미지 데이터
const slideImages = [
  slideImage1,
  slideImage2,
]

// 일주일 일정 데이터 (예시 - 실제 데이터로 교체 필요)
const weeklySchedule = [
  { date: '2025-01-15', title: '프로젝트 발표회' },
  { date: '2025-01-17', title: '연구실 회의' },
]

// 프로젝트 데이터 (예시 - 실제 데이터로 교체 필요)
const currentProjects = [
  '연구실 전용 키오스크 (4학년)',
  '비밀리에 진행되는 시크릿 프로젝트 (3학년)',
]

// 뉴스 데이터 (예시 - 실제 데이터로 교체 필요)
const newsItems = [
  '최근 정보통신기술 어쩌구.. (2025) (이은채, 이혜현, 김나연, 정예환) 논문 등록을 축하합니다 🎉',
  '대학원생 문동민 생일 축하했습니다 🎂',
  '새로운 프로젝트 시작!',
  '모바일융합공학과 1기 졸업 축하할 예정입니다',
  'Test 세미나 드디어 끝난 거 축하합니다',
  '김바나나 상 받았다',
  '모바비 상 받았다',
]

// 스타일 컴포넌트
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 4rem;
  gap: 4rem;
  overflow-y: auto;
`

// 슬라이드 섹션
const SlideSection = styled.section`
  position: relative;
  width: 100%;
  height: 75rem;
  overflow: hidden;
  border-radius: 2rem;
`

const SlideWrapper = styled.div<{ $currentIndex: number; $totalSlides: number; $isTransitioning: boolean }>`
  display: flex;
  width: ${(props) => (props.$totalSlides + 2) * 100}%;
  height: 100%;
  transform: translateX(${(props) => -(props.$currentIndex) * (100 / (props.$totalSlides + 2))}%);
  transition: ${(props) => (props.$isTransitioning ? 'transform 0.5s ease-in-out' : 'none')};
`

const SlideImage = styled.img`
  width: ${100 / (slideImages.length + 2)}%;
  height: 100%;
  object-fit: cover;
  flex-shrink: 0;
`

const SlideButton = styled.button<{ $direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${(props) => (props.$direction === 'left' ? 'left: 2rem;' : 'right: 2rem;')}
  transform: translateY(-50%);
  width: 5rem;
  height: 5rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 3rem;
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

const SlideIndicators = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  z-index: 10;
`

const Indicator = styled.div<{ $active: boolean }>`
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: ${(props) => (props.$active ? 'white' : 'rgba(255, 255, 255, 0.5)')};
  cursor: pointer;
  transition: background 0.3s;
`

// 소개 섹션
const IntroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  padding: 4rem 0;
  position: relative;
`

const IntroTitle = styled.h1`
  font-size: 6rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
`

const IntroText = styled.div`
  font-size: 2.4rem;
  line-height: 1.8;
  text-align: center;
  max-width: 112.5rem;
  color: #333;
`

const GradientCircle = styled.div`
  position: absolute;
  bottom: -12.5rem;
  width: 50rem;
  height: 50rem;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 70%);
  pointer-events: none;
  z-index: -1;
`

// 하단 레이아웃
const BottomSection = styled.section`
  display: flex;
  gap: 4rem;
  flex: 1;
  min-height: 50rem;
`

const LeftColumn = styled.div`
  flex: 1;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 2rem;
`

const RightColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3rem;
`

const ScheduleTitle = styled.h2`
  font-size: 3.6rem;
  font-weight: bold;
  margin-bottom: 3rem;
  color: #333;
`

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

const TimelineItem = styled.div`
  display: flex;
  gap: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  border-left: 0.25rem solid #007bff;
`

const TimelineDate = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
  min-width: 12.5rem;
`

const TimelineContent = styled.div`
  font-size: 2.2rem;
  color: #333;
`

const ProjectBox = styled.div`
  flex: 1;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 2rem;
`

const NewsBox = styled.div`
  flex: 1;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 2rem;
  position: relative;
  overflow: hidden;
`

const BoxTitle = styled.h3`
  font-size: 3.6rem;
  font-weight: bold;
  margin-bottom: ${(props) => (props.className === 'project-title' ? '3rem' : '2rem')};
  color: #333;
`

const ProjectList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const ProjectItem = styled.li`
  font-size: 2.4rem;
  padding-left: 2rem;
  position: relative;
  color: #333;

  &::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #007bff;
    font-size: 3rem;
  }
`

const NewsContainer = styled.div`
  position: relative;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const scrollTextVertical = keyframes`
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
`

const NewsList = styled.div<{ $itemCount: number }>`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: ${scrollTextVertical} ${(props) => props.$itemCount * 3}s linear infinite;
  
  /* 무한 루프를 위해 뉴스 항목을 두 번 복제 */
  &::after {
    content: '';
    display: block;
  }
`

const NewsItem = styled.div`
  font-size: 2.4rem;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  color: #333;
  min-height: 8rem;
  display: flex;
  align-items: center;
  flex-shrink: 0;
`

const HomePage = () => {
  const [slideIndex, setSlideIndex] = useState(1) // 첫 번째 클론 다음부터 시작 (인덱스 1)
  const [isTransitioning, setIsTransitioning] = useState(true)

  // 슬라이드 무한 루프 구현
  useEffect(() => {
    if (slideImages.length <= 1) return

    const slideInterval = setInterval(() => {
      handleSlideNext()
    }, 5000)

    return () => clearInterval(slideInterval)
  }, [])

  // 슬라이드가 클론 위치에 도달했을 때 실제 위치로 이동
  useEffect(() => {
    if (!isTransitioning) {
      // transition이 끝난 후 클론 위치에 있으면 실제 위치로 즉시 이동
      if (slideIndex === 0) {
        // 첫 번째 클론에 도달하면 마지막 실제 이미지로 이동
        setSlideIndex(slideImages.length)
      } else if (slideIndex === slideImages.length + 1) {
        // 마지막 클론에 도달하면 첫 번째 실제 이미지로 이동
        setSlideIndex(1)
      }
    }
  }, [isTransitioning, slideIndex])

  const handleSlidePrev = () => {
    if (slideIndex === 1) {
      // 첫 번째 실제 이미지에서 마지막 클론으로 이동
      setIsTransitioning(true)
      setSlideIndex(0)
      setTimeout(() => {
        setIsTransitioning(false)
        setSlideIndex(slideImages.length)
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
    if (slideIndex === slideImages.length) {
      // 마지막 실제 이미지에서 첫 번째 클론으로 이동
      setIsTransitioning(true)
      setSlideIndex(slideImages.length + 1)
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
    setSlideIndex(index + 1) // 실제 이미지 인덱스는 클론 때문에 +1
  }

  // 일주일 일정 필터링 - 현재 날짜 기준
  const getWeeklySchedule = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    const filtered = weeklySchedule.filter((item) => {
      const itemDate = new Date(item.date)
      itemDate.setHours(0, 0, 0, 0)
      return itemDate >= today && itemDate <= weekFromNow
    })

    // 테스트용: 일정이 없으면 모든 일정 표시
    return filtered.length > 0 ? filtered : weeklySchedule
  }

  const upcomingSchedule = getWeeklySchedule()

  // 실제 슬라이드 인덱스 계산 (클론 제외, 인디케이터용)
  const actualSlideIndex = slideIndex <= 0 ? slideImages.length - 1 : slideIndex > slideImages.length ? 0 : slideIndex - 1

  return (
    <HomeContainer>
      {/* 슬라이드 섹션 */}
      <SlideSection>
        <SlideWrapper
          $currentIndex={slideIndex}
          $totalSlides={slideImages.length}
          $isTransitioning={isTransitioning}
        >
          {/* 마지막 이미지 클론 (무한 루프용) */}
          <SlideImage src={slideImages[slideImages.length - 1]} alt="Slide clone last" />
          {/* 실제 이미지들 */}
          {slideImages.map((image, index) => (
            <SlideImage key={index} src={image} alt={`Slide ${index + 1}`} />
          ))}
          {/* 첫 번째 이미지 클론 (무한 루프용) */}
          <SlideImage src={slideImages[0]} alt="Slide clone first" />
        </SlideWrapper>
        {slideImages.length > 1 && (
          <>
            <SlideButton $direction="left" onClick={handleSlidePrev}>
              ‹
            </SlideButton>
            <SlideButton $direction="right" onClick={handleSlideNext}>
              ›
            </SlideButton>
            <SlideIndicators>
              {slideImages.map((_, index) => (
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

      {/* 소개 섹션 */}
      <IntroSection>
        <IntroTitle>HBNU WISOFT.IO</IntroTitle>
        <IntroText>
          국립한밭대학교 와이소프트(WiSoft)는 프로그래밍으로 미래를 설계하는 소프트웨어 중심의 연구실입니다.
          <br />
          <br />
          박현주 교수님의 지도 아래, 탄탄한 이론을 바탕으로 실제 동작하는 소프트웨어를 만드는 데 집중합니다. 
          <br />
          다양한 프로젝트 경험을 통해 실무 역량을 갖추고 미래 기술을 선도하는 SW 핵심 인재 양성을 목표로 합니다.
        </IntroText>
        <GradientCircle />
      </IntroSection>

      {/* 하단 섹션 */}
      <BottomSection>
        {/* 왼쪽: 일정 */}
        <LeftColumn>
          {upcomingSchedule.length > 0 ? (
            <>
              <ScheduleTitle>이번 주 일정</ScheduleTitle>
              <Timeline>
                {upcomingSchedule.map((item, index) => (
                  <TimelineItem key={index}>
                    <TimelineDate>{item.date}</TimelineDate>
                    <TimelineContent>{item.title}</TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </>
          ) : (
            <ScheduleTitle>이번 주 일정이 없습니다</ScheduleTitle>
          )}
        </LeftColumn>

        {/* 오른쪽: 프로젝트 & 뉴스 */}
        <RightColumn>
          <ProjectBox>
            <BoxTitle className="project-title">Current Project</BoxTitle>
            <ProjectList>
              {currentProjects.map((project, index) => (
                <ProjectItem key={index}>{project}</ProjectItem>
              ))}
            </ProjectList>
          </ProjectBox>

          <NewsBox>
            <BoxTitle>WiSoft News</BoxTitle>
            <NewsContainer>
              <NewsList $itemCount={newsItems.length}>
                {/* 원본 뉴스 항목들 */}
                {newsItems.map((news, index) => (
                  <NewsItem key={`original-${index}`}>{news}</NewsItem>
                ))}
                {/* 무한 루프를 위한 복제 뉴스 항목들 */}
                {newsItems.map((news, index) => (
                  <NewsItem key={`clone-${index}`}>{news}</NewsItem>
                ))}
              </NewsList>
            </NewsContainer>
          </NewsBox>
        </RightColumn>
      </BottomSection>
    </HomeContainer>
  )
}

export default HomePage
