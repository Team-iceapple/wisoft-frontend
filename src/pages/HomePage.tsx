import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
// @ts-ignore
import slideImage1 from '../assets/image-slide1.jpg'
// @ts-ignore
import slideImage2 from '../assets/image-slide2.jpg'

// API 응답 타입 정의
interface CalendarEvent {
  id: number
  title: string
}

interface Calendar {
  range_start: string
  range_end: string
  events: CalendarEvent[]
}

interface Lab {
  title: string
  description: string
  image_urls: string[]
}

interface Project {
  id: number
  title: string
  grade: number
}

interface News {
  id: number
  title: string
  detail: string
}

interface HomeApiResponse {
  lab: Lab
  calendar: Calendar
  projects: Project[]
  news: News[]
}

// 뉴스 아이템 인터페이스 (UI용)
interface NewsItem {
  title: string
  content: string
}

// 일정 아이템 인터페이스 (UI용)
interface ScheduleItem {
  date: string
  title: string
}

// 스타일 컴포넌트
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 2rem 3rem;
  gap: 2rem;
  overflow: hidden;
`

// 슬라이드 섹션
const SlideSection = styled.section`
  position: relative;
  width: 100%;
  height: 35rem;
  overflow: hidden;
  border-radius: 2rem;
  flex-shrink: 0;
`

const SlideWrapper = styled.div<{ $currentIndex: number; $totalSlides: number; $isTransitioning: boolean }>`
  display: flex;
  width: ${(props) => (props.$totalSlides + 2) * 100}%;
  height: 100%;
  transform: translateX(${(props) => -(props.$currentIndex) * (100 / (props.$totalSlides + 2))}%);
  transition: ${(props) => (props.$isTransitioning ? 'transform 0.5s ease-in-out' : 'none')};
`

const SlideImage = styled.img<{ $totalSlides: number }>`
  width: ${(props) => 100 / (props.$totalSlides + 2)}%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  flex-shrink: 0;
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
  gap: 1rem;
  padding: 1rem 0;
  position: relative;
  flex-shrink: 0;
`

const IntroTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 0.5rem;
`

const IntroText = styled.div`
  font-size: 1.6rem;
  line-height: 1.5;
  text-align: center;
  max-width: 112.5rem;
  color: #495057;
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
  gap: 2rem;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

const LeftColumn = styled.div`
  flex: 1;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 2rem;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const RightColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: 0;
`

const ScheduleTitle = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #666666;
`

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

const TimelineItem = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  border-left: 0.25rem solid #007bff;
`

const TimelineDate = styled.div`
  font-size: 1.6rem;
  font-weight: bold;
  color: #007bff;
  min-width: 12.5rem;
`

const TimelineContent = styled.div`
  font-size: 1.6rem;
  color: #333;
`

const ProjectBox = styled.div`
  flex: 1;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 2rem;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const NewsBox = styled.div`
  flex: 0.6;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 2rem;
  position: relative;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

const BoxTitle = styled.h3`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: ${(props) => (props.className === 'project-title' ? '1.5rem' : '1rem')};
  color: #737373;
`

const ProjectList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

const ProjectItem = styled.li`
  font-size: 1.6rem;
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  position: relative;
  color: #333;
  box-shadow: 0 0.2rem 0.8rem rgba(0, 0, 0, 0.1);

  &::before {
    content: '•';
    position: absolute;
    left: 1.5rem;
    color: #007bff;
    font-size: 2.2rem;
  }
`

const NewsContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  flex: 1;
  min-height: 0;
`

const NewsCardWrapper = styled.div<{ $currentIndex: number; $totalCards: number; $isTransitioning: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: ${(props) => (props.$totalCards + 2) * 100}%;
  display: flex;
  flex-direction: column;
  gap: 0;
  transform: translateY(${(props) => -(props.$currentIndex) * 100}%);
  transition: ${(props) => (props.$isTransitioning ? 'transform 0.5s ease-in-out' : 'none')};
`

const NewsCard = styled.div<{ $totalCards: number }>`
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 0.2rem 0.8rem rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
`

const NewsCardTitle = styled.div`
  font-size: 1.6rem;
  font-weight: bold;
  color: #333;
  margin-top: 0;
`

const NewsCardContent = styled.div`
  font-size: 1.6rem;
  color: #666;
  line-height: 1.5;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;
`

const HomePage = () => {
  const [slideIndex, setSlideIndex] = useState(1) // 첫 번째 클론 다음부터 시작 (인덱스 1)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [newsCardIndex, setNewsCardIndex] = useState(1) // 뉴스 카드 인덱스
  const [isNewsTransitioning, setIsNewsTransitioning] = useState(true)
  
  // API 데이터 상태
  const [labData, setLabData] = useState<Lab | null>(null)
  const [slideImages, setSlideImages] = useState<string[]>([slideImage1, slideImage2]) // 기본값으로 로컬 이미지 사용
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // API 데이터 가져오기
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
        const response = await fetch(`${apiBaseUrl}/home`)

        if (!response.ok) {
          throw new Error('홈 데이터를 불러오는 데 실패했습니다.')
        }

        const data: HomeApiResponse = await response.json()

        // Lab 데이터 설정
        setLabData(data.lab)
        if (data.lab.image_urls && data.lab.image_urls.length > 0) {
          setSlideImages(data.lab.image_urls)
        }

        // Calendar 데이터 변환 및 설정
        const formattedSchedule: ScheduleItem[] = data.calendar.events.map((event) => {
          // range_start를 기준으로 날짜 포맷팅 (ISO 8601 -> YY/MM/DD(요일) 형식)
          const eventDate = new Date(data.calendar.range_start)
          const year = eventDate.getFullYear().toString().slice(-2)
          const month = String(eventDate.getMonth() + 1).padStart(2, '0')
          const day = String(eventDate.getDate()).padStart(2, '0')
          const weekdays = ['일', '월', '화', '수', '목', '금', '토']
          const weekday = weekdays[eventDate.getDay()]
          const formattedDate = `${year}/${month}/${day}(${weekday})`
          
          return {
            date: formattedDate,
            title: event.title,
          }
        })
        setScheduleItems(formattedSchedule)

        // Projects 데이터 설정
        setProjects(data.projects)

        // News 데이터 변환 및 설정
        const formattedNews: NewsItem[] = data.news.map((item) => ({
          title: item.title,
          content: item.detail,
        }))
        setNewsItems(formattedNews)
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
        console.error('홈 데이터 로딩 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  const handleSlidePrev = useCallback(() => {
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
  }, [slideIndex, slideImages.length])

  const handleSlideNext = useCallback(() => {
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
  }, [slideIndex, slideImages.length])

  // 슬라이드 무한 루프 구현
  useEffect(() => {
    if (slideImages.length <= 1) return

    const slideInterval = setInterval(() => {
      handleSlideNext()
    }, 5000)

    return () => clearInterval(slideInterval)
  }, [slideImages.length, handleSlideNext])

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
  }, [isTransitioning, slideIndex, slideImages.length])

  const handleIndicatorClick = (index: number) => {
    setIsTransitioning(true)
    setSlideIndex(index + 1) // 실제 이미지 인덱스는 클론 때문에 +1
  }

  // 일주일 일정 필터링 - 현재 날짜 기준
  const getWeeklySchedule = () => {
    if (scheduleItems.length === 0) return []
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    const filtered = scheduleItems.filter((item) => {
      // 날짜 문자열 파싱 (YY/MM/DD 형식)
      const dateMatch = item.date.match(/(\d{2})\/(\d{2})\/(\d{2})/)
      if (!dateMatch) return false
      
      const [, yearStr, monthStr, dayStr] = dateMatch
      const year = 2000 + parseInt(yearStr, 10)
      const month = parseInt(monthStr, 10) - 1
      const day = parseInt(dayStr, 10)
      
      const itemDate = new Date(year, month, day)
      itemDate.setHours(0, 0, 0, 0)
      return itemDate >= today && itemDate <= weekFromNow
    })

    return filtered.length > 0 ? filtered : scheduleItems
  }

  const upcomingSchedule = getWeeklySchedule()

  const actualSlideIndex = slideIndex <= 0 ? slideImages.length - 1 : slideIndex > slideImages.length ? 0 : slideIndex - 1

  useEffect(() => {
    if (newsItems.length <= 1) return

    const newsInterval = setInterval(() => {
      handleNewsCardNext()
    }, 5000)

    return () => clearInterval(newsInterval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newsCardIndex])

  useEffect(() => {
    if (!isNewsTransitioning) {
      if (newsCardIndex === 0) {
        setNewsCardIndex(newsItems.length)
      } else if (newsCardIndex === newsItems.length + 1) {
        setNewsCardIndex(1)
      }
    }
  }, [isNewsTransitioning, newsCardIndex])

  const handleNewsCardNext = () => {
    if (newsItems.length <= 1) return

    if (newsCardIndex === newsItems.length) {
      setIsNewsTransitioning(true)
      setNewsCardIndex(newsItems.length + 1)
      setTimeout(() => {
        setIsNewsTransitioning(false)
        setNewsCardIndex(1)
      }, 500)
    } else {
      setIsNewsTransitioning(true)
      setNewsCardIndex((prev) => prev + 1)
      setTimeout(() => {
        setIsNewsTransitioning(false)
      }, 500)
    }
  }

  const truncateContent = (content: string, maxLength: number = 45) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  }

  // 프로젝트 포맷팅 함수
  const formatProject = (project: Project) => {
    return `${project.title} (${project.grade}학년)`
  }

  if (loading) {
    return (
      <HomeContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '2rem' }}>
          로딩 중...
        </div>
      </HomeContainer>
    )
  }

  if (error) {
    return (
      <HomeContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '2rem', color: '#dc3545' }}>
          {error}
        </div>
      </HomeContainer>
    )
  }

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
          {slideImages.length > 0 && (
            <>
              <SlideImage $totalSlides={slideImages.length} src={slideImages[slideImages.length - 1]} alt="Slide clone last" />
              {/* 실제 이미지들 */}
              {slideImages.map((image, index) => (
                <SlideImage key={index} $totalSlides={slideImages.length} src={image} alt={`Slide ${index + 1}`} />
              ))}
              {/* 첫 번째 이미지 클론 (무한 루프용) */}
              <SlideImage $totalSlides={slideImages.length} src={slideImages[0]} alt="Slide clone first" />
            </>
          )}
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
        <IntroTitle>{labData?.title || '와이소프트'}</IntroTitle>
        <IntroText>
          {labData?.description || '국립한밭대학교 와이소프트(WiSoft)는 프로그래밍으로 미래를 설계하는 소프트웨어 중심의 연구실입니다.'}
        </IntroText>
        <GradientCircle />
      </IntroSection>

      {/* 하단 섹션 */}
      <BottomSection>
        {/* 왼쪽: 일정 */}
        <LeftColumn>
          {upcomingSchedule.length > 0 ? (
            <>
              <ScheduleTitle>연구실 일정</ScheduleTitle>
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
            <BoxTitle className="project-title">진행중인 프로젝트</BoxTitle>
            <ProjectList>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <ProjectItem key={project.id}>{formatProject(project)}</ProjectItem>
                ))
              ) : (
                <ProjectItem>진행 중인 프로젝트가 없습니다</ProjectItem>
              )}
            </ProjectList>
          </ProjectBox>

          <NewsBox>
            <BoxTitle>와이소프트 소식</BoxTitle>
            <NewsContainer>
              <NewsCardWrapper
                $currentIndex={newsCardIndex}
                $totalCards={newsItems.length}
                $isTransitioning={isNewsTransitioning}
              >
                {/* 마지막 카드 클론 (무한 루프용) */}
                <NewsCard $totalCards={newsItems.length}>
                  <NewsCardTitle>{newsItems[newsItems.length - 1].title}</NewsCardTitle>
                  <NewsCardContent>{truncateContent(newsItems[newsItems.length - 1].content)}</NewsCardContent>
                </NewsCard>
                {/* 실제 카드들 */}
                {newsItems.map((news, index) => (
                  <NewsCard key={index} $totalCards={newsItems.length}>
                    <NewsCardTitle>{news.title}</NewsCardTitle>
                    <NewsCardContent>{truncateContent(news.content)}</NewsCardContent>
                  </NewsCard>
                ))}
                {/* 첫 번째 카드 클론 (무한 루프용) */}
                <NewsCard $totalCards={newsItems.length}>
                  <NewsCardTitle>{newsItems[0].title}</NewsCardTitle>
                  <NewsCardContent>{truncateContent(newsItems[0].content)}</NewsCardContent>
                </NewsCard>
              </NewsCardWrapper>
            </NewsContainer>
          </NewsBox>
        </RightColumn>
      </BottomSection>
    </HomeContainer>
  )
}

export default HomePage
