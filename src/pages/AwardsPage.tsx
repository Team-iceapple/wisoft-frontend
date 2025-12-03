import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
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

// 연도별 상장 데이터 (예시 - 실제 데이터로 교체 필요)
const awardsByYear: Record<string, {
  vertical: string[]; // 세로 상장 이미지들
  horizontal: string[]; // 가로 상장 이미지들
}> = {
  '2025': {
    vertical: [awardImage1, awardImage2],
    horizontal: [awardImage3, awardImage4, awardImage5],
  },
  '2024': {
    vertical: [awardImage1, awardImage2],
    horizontal: [awardImage3, awardImage4],
  },
  '2023': {
    vertical: [awardImage1],
    horizontal: [awardImage2, awardImage3],
  },
}

const availableYears = Object.keys(awardsByYear).sort((a, b) => Number(b) - Number(a))

// 스타일 컴포넌트
const AwardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 2rem 4rem 4rem;
  gap: 4rem;
  overflow: hidden;
`

const YearSelector = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0;
  position: relative;
  flex-shrink: 0;
`

const YearButton = styled.button`
  font-size: 4rem;
  font-weight: bold;
  background: none;
  border: none;
  cursor: pointer;
  color: #000;
  padding: 1rem 2rem;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.7;
  }
`

const YearDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 0.2rem solid #ddd;
  border-radius: 1rem;
  box-shadow: 0 0.4rem 0.6rem rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
  flex-direction: column;
  min-width: 20rem;
  margin-top: 1rem;
`

const YearOption = styled.button`
  padding: 1.2rem 2.5rem;
  font-size: 2.2rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: center;
  transition: background 0.2s;

  &:hover {
    background: #f0f0f0;
  }

  &:not(:last-child) {
    border-bottom: 0.1rem solid #eee;
  }
`

const Divider = styled.hr`
  width: 100%;
  border: none;
  border-top: 0.3rem solid #dee2e6;
  margin: 1rem 0;
  flex-shrink: 0;
`

// 세로 상장 슬라이드 섹션
const VerticalAwardsSection = styled.section`
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-radius: 2rem;
`

const VerticalSlideWrapper = styled.div<{ $currentIndex: number; $totalSlides: number; $isTransitioning: boolean }>`
  display: flex;
  width: ${(props) => (props.$totalSlides + 2) * 50}%; // section 기준: (그룹 수 + 클론 2개) * 50%
  height: 100%;
  transform: translateX(${(props) => -(props.$currentIndex) * 50}%); // section 기준으로 50%씩 이동
  transition: ${(props) => (props.$isTransitioning ? 'transform 0.5s ease-in-out' : 'none')};
`

const VerticalSlideGroup = styled.div<{ $totalSlides: number }>`
  display: flex;
  gap: 2rem;
  width: 50%; // section 기준으로 각 그룹이 정확히 50% (2개씩 표시)
  height: 100%;
  flex-shrink: 0;
  padding: 0 1rem;
  box-sizing: border-box;
`

const VerticalAwardImage = styled.img`
  flex: 1;
  height: 100%;
  object-fit: contain;
  background: #f8f9fa;
  border-radius: 1rem;
  min-width: 0;
  padding: 2rem;
  box-sizing: border-box;
`

// 가로 상장 슬라이드 섹션
const HorizontalAwardsSection = styled.section`
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-radius: 2rem;
`

const HorizontalSlideWrapper = styled.div<{ $currentIndex: number; $totalSlides: number; $isTransitioning: boolean }>`
  display: flex;
  width: ${(props) => (props.$totalSlides + 2) * 100}%;
  height: 100%;
  transform: translateX(${(props) => -(props.$currentIndex) * (100 / (props.$totalSlides + 2))}%);
  transition: ${(props) => (props.$isTransitioning ? 'transform 0.5s ease-in-out' : 'none')};
`

const HorizontalSlideGroup = styled.div<{ $totalSlides: number }>`
  width: ${(props) => 100 / (props.$totalSlides + 2)}%; // 전체 그룹 수 + 클론 2개 기준으로 각 그룹 너비 계산
  height: 100%;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 1rem;
  box-sizing: border-box;
`

const HorizontalAwardImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  background: #f8f9fa;
  border-radius: 1rem;
  padding: 2rem;
  box-sizing: border-box;
`

const AwardsPage = () => {
  const [selectedYear, setSelectedYear] = useState(availableYears[0])
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false)
  const [verticalSlideIndex, setVerticalSlideIndex] = useState(1)
  const [verticalIsTransitioning, setVerticalIsTransitioning] = useState(false)
  const [horizontalSlideIndex, setHorizontalSlideIndex] = useState(1)
  const [horizontalIsTransitioning, setHorizontalIsTransitioning] = useState(false)
  const yearSelectorRef = useRef<HTMLDivElement>(null)

  const currentAwards = awardsByYear[selectedYear]
  const verticalAwards = currentAwards.vertical
  const horizontalAwards = currentAwards.horizontal

  // 세로 상장을 2개씩 그룹화
  const verticalGroups: string[][] = []
  for (let i = 0; i < verticalAwards.length; i += 2) {
    verticalGroups.push(verticalAwards.slice(i, i + 2))
  }

  // 가로 상장을 1개씩 그룹화 (각각이 하나의 그룹)
  const horizontalGroups: string[][] = horizontalAwards.map(award => [award])

  const handleVerticalSlideNext = () => {
    if (verticalGroups.length === 0) return
    
    if (verticalSlideIndex === verticalGroups.length) {
      // 마지막 실제 이미지에서 첫 번째 클론으로 이동
      setVerticalIsTransitioning(true)
      setVerticalSlideIndex(verticalGroups.length + 1)
      setTimeout(() => {
        setVerticalIsTransitioning(false)
        setVerticalSlideIndex(1)
      }, 500)
    } else {
      setVerticalIsTransitioning(true)
      setVerticalSlideIndex((prev) => prev + 1)
      setTimeout(() => {
        setVerticalIsTransitioning(false)
      }, 500)
    }
  }

  const handleHorizontalSlideNext = () => {
    if (horizontalGroups.length === 0) return
    
    if (horizontalSlideIndex === horizontalGroups.length) {
      // 마지막 실제 이미지에서 첫 번째 클론으로 이동
      setHorizontalIsTransitioning(true)
      setHorizontalSlideIndex(horizontalGroups.length + 1)
      setTimeout(() => {
        setHorizontalIsTransitioning(false)
        setHorizontalSlideIndex(1)
      }, 500)
    } else {
      setHorizontalIsTransitioning(true)
      setHorizontalSlideIndex((prev) => prev + 1)
      setTimeout(() => {
        setHorizontalIsTransitioning(false)
      }, 500)
    }
  }

  // 세로 상장 자동 슬라이드 (6초마다)
  useEffect(() => {
    // 세로 상장을 2개씩 그룹화
    const groups: string[][] = []
    for (let i = 0; i < verticalAwards.length; i += 2) {
      groups.push(verticalAwards.slice(i, i + 2))
    }
    
    const groupsLength = groups.length
    // 이미지가 3개 이상일 때만 자동 슬라이드 (그룹이 2개 이상)
    if (verticalAwards.length < 3 || groupsLength <= 1) return

    let timeoutId: NodeJS.Timeout | null = null

    const slideInterval = setInterval(() => {
      setVerticalIsTransitioning(true)
      setVerticalSlideIndex((prevIndex) => {
        if (prevIndex === groupsLength) {
          // 마지막 실제 이미지에서 첫 번째 클론으로 이동
          return groupsLength + 1
        } else {
          return prevIndex + 1
        }
      })
      
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setVerticalIsTransitioning(false)
      }, 500)
    }, 6000)

    return () => {
      clearInterval(slideInterval)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [selectedYear, verticalAwards.length])

  // 가로 상장 자동 슬라이드 (6초마다)
  useEffect(() => {
    // 가로 상장을 1개씩 그룹화
    const groups: string[][] = horizontalAwards.map(award => [award])
    const groupsLength = groups.length
    
    // 이미지가 2개 이상일 때만 자동 슬라이드
    if (horizontalAwards.length < 2 || groupsLength <= 1) return

    let timeoutId: NodeJS.Timeout | null = null

    const slideInterval = setInterval(() => {
      setHorizontalIsTransitioning(true)
      setHorizontalSlideIndex((prevIndex) => {
        if (prevIndex === groupsLength) {
          // 마지막 실제 이미지에서 첫 번째 클론으로 이동
          return groupsLength + 1
        } else {
          return prevIndex + 1
        }
      })
      
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setHorizontalIsTransitioning(false)
      }, 500)
    }, 6000)

    return () => {
      clearInterval(slideInterval)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [selectedYear, horizontalAwards.length])

  // 세로 상장 슬라이드가 클론 위치에 도달했을 때 실제 위치로 이동
  useEffect(() => {
    if (!verticalIsTransitioning) {
      if (verticalSlideIndex === 0) {
        setVerticalSlideIndex(verticalGroups.length)
      } else if (verticalSlideIndex === verticalGroups.length + 1) {
        setVerticalSlideIndex(1)
      }
    }
  }, [verticalIsTransitioning, verticalSlideIndex, verticalGroups.length])

  // 가로 상장 슬라이드가 클론 위치에 도달했을 때 실제 위치로 이동
  useEffect(() => {
    if (!horizontalIsTransitioning) {
      if (horizontalSlideIndex === 0) {
        setHorizontalSlideIndex(horizontalGroups.length)
      } else if (horizontalSlideIndex === horizontalGroups.length + 1) {
        setHorizontalSlideIndex(1)
      }
    }
  }, [horizontalIsTransitioning, horizontalSlideIndex, horizontalGroups.length])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (yearSelectorRef.current && !yearSelectorRef.current.contains(event.target as Node)) {
        setIsYearDropdownOpen(false)
      }
    }

    if (isYearDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isYearDropdownOpen])

  // 연도 변경 시 슬라이드 인덱스 리셋
  useEffect(() => {
    setVerticalSlideIndex(1)
    setHorizontalSlideIndex(1)
  }, [selectedYear])

  const handleYearSelect = (year: string) => {
    setSelectedYear(year)
    setIsYearDropdownOpen(false)
  }

  return (
    <AwardsContainer>
      {/* 연도 선택 */}
      <YearSelector ref={yearSelectorRef}>
        <YearButton onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}>
          {selectedYear}
        </YearButton>
        <YearDropdown $isOpen={isYearDropdownOpen}>
          {availableYears.map((year) => (
            <YearOption key={year} onClick={() => handleYearSelect(year)}>
              {year}
            </YearOption>
          ))}
        </YearDropdown>
      </YearSelector>

      {/* 세로 상장 슬라이드 */}
      {verticalGroups.length > 0 && (
        <VerticalAwardsSection>
          <VerticalSlideWrapper
            $currentIndex={verticalSlideIndex}
            $totalSlides={verticalGroups.length}
            $isTransitioning={verticalIsTransitioning}
          >
            {/* 마지막 그룹 클론 */}
            {verticalGroups.length > 0 && (
              <VerticalSlideGroup $totalSlides={verticalGroups.length}>
                {verticalGroups[verticalGroups.length - 1].map((image, idx) => (
                  <VerticalAwardImage key={`clone-last-${idx}`} src={image} alt={`Vertical Award clone last ${idx + 1}`} />
                ))}
                {verticalGroups[verticalGroups.length - 1].length === 1 && (
                  <div style={{ flex: 1, minWidth: 0 }} />
                )}
              </VerticalSlideGroup>
            )}
            {/* 실제 그룹들 */}
            {verticalGroups.map((group, groupIndex) => (
              <VerticalSlideGroup key={groupIndex} $totalSlides={verticalGroups.length}>
                {group.map((image, idx) => (
                  <VerticalAwardImage key={`${groupIndex}-${idx}`} src={image} alt={`Vertical Award ${groupIndex + 1}-${idx + 1}`} />
                ))}
                {group.length === 1 && (
                  <div style={{ flex: 1, minWidth: 0 }} />
                )}
              </VerticalSlideGroup>
            ))}
            {/* 첫 번째 그룹 클론 */}
            {verticalGroups.length > 0 && (
              <VerticalSlideGroup $totalSlides={verticalGroups.length}>
                {verticalGroups[0].map((image, idx) => (
                  <VerticalAwardImage key={`clone-first-${idx}`} src={image} alt={`Vertical Award clone first ${idx + 1}`} />
                ))}
                {verticalGroups[0].length === 1 && (
                  <div style={{ flex: 1, minWidth: 0 }} />
                )}
              </VerticalSlideGroup>
            )}
          </VerticalSlideWrapper>
        </VerticalAwardsSection>
      )}

      {/* 가로 구분선 */}
      <Divider />

      {/* 가로 상장 슬라이드 */}
      {horizontalGroups.length > 0 && (
        <HorizontalAwardsSection>
          <HorizontalSlideWrapper
            $currentIndex={horizontalSlideIndex}
            $totalSlides={horizontalGroups.length}
            $isTransitioning={horizontalIsTransitioning}
          >
            {/* 마지막 그룹 클론 */}
            {horizontalGroups.length > 0 && (
              <HorizontalSlideGroup $totalSlides={horizontalGroups.length}>
                <HorizontalAwardImage
                  src={horizontalGroups[horizontalGroups.length - 1][0]}
                  alt="Horizontal Award clone last"
                />
              </HorizontalSlideGroup>
            )}
            {/* 실제 그룹들 */}
            {horizontalGroups.map((group, groupIndex) => (
              <HorizontalSlideGroup key={groupIndex} $totalSlides={horizontalGroups.length}>
                <HorizontalAwardImage
                  src={group[0]}
                  alt={`Horizontal Award ${groupIndex + 1}`}
                />
              </HorizontalSlideGroup>
            ))}
            {/* 첫 번째 그룹 클론 */}
            {horizontalGroups.length > 0 && (
              <HorizontalSlideGroup $totalSlides={horizontalGroups.length}>
                <HorizontalAwardImage
                  src={horizontalGroups[0][0]}
                  alt="Horizontal Award clone first"
                />
              </HorizontalSlideGroup>
            )}
          </HorizontalSlideWrapper>
        </HorizontalAwardsSection>
      )}
    </AwardsContainer>
  )
}

export default AwardsPage

