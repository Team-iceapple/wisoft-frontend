import { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { QRCodeSVG } from 'qrcode.react'

const ITEMS_PER_PAGE = 6
// @ts-ignore
import projectImage1 from '../assets/image-project1.jpg'
// @ts-ignore
import projectImage2 from '../assets/image-project2.jpg'

// API 응답 타입 정의
interface Member {
  name: string
  extra?: string
}

interface Project {
  id: string
  name: string
  team_name: string
  members: Member[]
  thumbnail: string
  year: number
}

interface ProjectDetail {
  id: string
  name: string
  team_name: string
  members: Member[]
  pdf_url?: string
  description: string
  main_url: string
  year: number
}

interface ProjectsApiResponse {
  projects: Project[]
}

interface ProjectDetailApiResponse {
  work: ProjectDetail
}

// UI용 프로젝트 타입
interface UIProject {
  id: string
  image: string
  specialNote?: string
  projectName: string
  participants: string[]
  qrLink?: string
  status: '진행중' | '완료됨'
}

// 연도별 프로젝트 데이터 (기본값)
const defaultProjectsByYear: Record<number, UIProject[]> = {
  2025: [
    {
      image: projectImage1,
      specialNote: '포브스 선정 가장 영향력있는 프로젝트',
      projectName: 'Iceapple',
      participants: ['유재영', '문동민', '김나연', '신보연', '이선혜', '이은채', '이혜현', '임예은', '정예환'],
      qrLink: 'https://iceapple.wisoft.io',
      status: '진행중',
    },
    {
      image: projectImage2,
      projectName: '학슐랭',
      participants: ['김나연', '이은채', '이혜현', '정예환'],
      qrLink: 'https://hakchulraeng.wisoft.io',
      status: '진행중',
    },
    {
      image: projectImage1,
      specialNote: '신규 프로젝트',
      projectName: '프로젝트 알파',
      participants: ['김철수', '이영희', '박민수', '최지영'],
      qrLink: 'https://project-alpha.wisoft.io',
      status: '진행중',
    },
    {
      image: projectImage2,
      projectName: '프로젝트 베타',
      participants: ['정수진', '강동욱', '윤서연'],
      qrLink: 'https://project-beta.wisoft.io',
      status: '완료됨',
    },
    {
      image: projectImage1,
      projectName: '프로젝트 감마',
      participants: ['조현우', '임도현', '한소희', '오준혁', '배수진'],
      qrLink: 'https://project-gamma.wisoft.io',
      status: '완료됨',
    },
    {
      image: projectImage2,
      specialNote: '하반기 프로젝트',
      projectName: '프로젝트 델타',
      participants: ['송민준', '김하늘', '이준호'],
      qrLink: 'https://project-delta.wisoft.io',
      status: '진행중',
    },
    {
      image: projectImage1,
      projectName: '프로젝트 엡실론',
      participants: ['장예린', '홍길동', '김미영', '이태호', '박지훈', '최유진'],
      qrLink: 'https://project-epsilon.wisoft.io',
      status: '완료됨',
    },
  ],
  2024: [
    {
      image: projectImage1,
      specialNote: '우수 프로젝트',
      projectName: '프로젝트 A',
      participants: ['참여자1', '참여자2', '참여자3'],
      qrLink: 'https://project-a.wisoft.io',
      status: '완료됨',
    },
    {
      image: projectImage2,
      projectName: '프로젝트 B',
      participants: ['참여자4', '참여자5'],
      qrLink: 'https://project-b.wisoft.io',
      status: '완료됨',
    },
  ],
  2023: [
    {
      image: projectImage1,
      projectName: '프로젝트 C',
      participants: ['참여자6', '참여자7'],
      qrLink: 'https://project-c.wisoft.io',
      status: '완료됨',
    },
  ],
}

// 기본 연도 목록
const defaultAvailableYears = Object.keys(defaultProjectsByYear)
  .map(Number)
  .sort((a, b) => b - a) // 최신 연도부터 정렬

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const slideUp = keyframes`
  from {
    transform: translateY(5rem);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 2rem 4rem 4rem;
  gap: 2rem;
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

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 2.5rem;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

const ProjectCard = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 1.5rem;
  overflow: hidden;
  background: #f8f9fa;
  min-height: 0;
`

const SpecialNote = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.7rem 1.2rem;
  border-radius: 0.6rem;
  font-size: 1.2rem;
  font-weight: bold;
  z-index: 10;
  text-align: center;
`

const StatusBadge = styled.div<{ $status: '진행중' | '완료됨' }>`
  background: ${(props) => (props.$status === '진행중' ? 'rgba(52, 152, 219, 0.9)' : 'rgba(46, 204, 113, 0.9)')};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.6rem;
  font-size: 1.1rem;
  font-weight: bold;
  white-space: nowrap;
  margin-left: 1rem;
`

const ProjectImageWrapper = styled.div`
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 22rem;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 1.5rem;

  &:hover {
    transform: scale(1.02);
  }
`

const ProjectImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
  border-radius: 1.5rem;
`

const ProjectInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 3rem 2rem 2rem;
  color: white;
`

const ProjectNameContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`

const ProjectName = styled.h2`
  font-size: 2.2rem;
  font-weight: bold;
  margin: 0;
`

const Participants = styled.div`
  font-size: 1.4rem;
  line-height: 1.4;
`

const InfoText = styled.div`
  text-align: center;
  font-size: 1.6rem;
  color: #666;
  margin-top: 0;
  padding: 1.2rem;
  background: #f8f9fa;
  border-radius: 1rem;
  flex-shrink: 0;
`

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${(props) => (props.$isOpen ? fadeIn : 'none')} 0.3s ease;
`

const ModalContent = styled.div`
  background: white;
  border-radius: 2rem;
  padding: 4rem;
  max-width: 60rem;
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  position: relative;
  animation: ${slideUp} 0.3s ease;
`

const ModalTitle = styled.h2`
  font-size: 3rem;
  font-weight: bold;
  text-align: center;
  margin: 0;
`

const ModalQRCode = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  border: 0.2rem solid #ddd;
`

const ModalCloseButton = styled.button`
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: none;
  border: none;
  font-size: 4rem;
  cursor: pointer;
  color: #666;
  width: 5rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;

  &:hover {
    background: #f0f0f0;
  }
`

const ModalLink = styled.div`
  font-size: 1.8rem;
  color: #007bff;
  word-break: break-all;
  text-align: center;
`

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0;
  flex-shrink: 0;
`

const PaginationIndicator = styled.button<{ $active: boolean }>`
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  background: ${(props) => (props.$active ? '#333' : '#ccc')};
  border: none;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  padding: 0;

  &:hover {
    transform: scale(1.3);
    background: ${(props) => (props.$active ? '#333' : '#999')};
  }
`

const ProjectPage = () => {
  const [projectsByYear, setProjectsByYear] = useState<Record<number, UIProject[]>>(defaultProjectsByYear)
  const [availableYears, setAvailableYears] = useState<number[]>(defaultAvailableYears)
  const [selectedYear, setSelectedYear] = useState(defaultAvailableYears[0] || new Date().getFullYear())
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedProject, setSelectedProject] = useState<{
    projectName: string
    qrLink: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const currentProjects = projectsByYear[selectedYear] || []

  // API에서 프로젝트 목록 가져오기
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
        const response = await fetch(`${apiBaseUrl}/projects`)

        if (!response.ok) {
          throw new Error('프로젝트 데이터를 불러오는 데 실패했습니다.')
        }

        const data: ProjectsApiResponse = await response.json()

        // 연도별로 그룹화
        const groupedByYear: Record<number, UIProject[]> = {}
        
        data.projects.forEach((project) => {
          if (!groupedByYear[project.year]) {
            groupedByYear[project.year] = []
          }

          // members 배열을 문자열 배열로 변환 (name + extra)
          const participants = project.members.map((member) => 
            member.extra ? `${member.name} (${member.extra})` : member.name
          )

          groupedByYear[project.year].push({
            id: project.id,
            image: project.thumbnail || projectImage1,
            projectName: project.name,
            participants,
            qrLink: undefined, // 상세 정보에서 가져올 예정
            status: '진행중', // API 응답에 status가 없으므로 기본값 사용
          })
        })

        // 연도 정렬
        const years = Object.keys(groupedByYear)
          .map(Number)
          .sort((a, b) => b - a)

        setProjectsByYear(groupedByYear)
        setAvailableYears(years.length > 0 ? years : defaultAvailableYears)
        if (years.length > 0) {
          setSelectedYear(years[0])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
        console.error('프로젝트 데이터 로딩 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // 연도 변경 시 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(0)
  }, [selectedYear])

  // 페이지네이션 계산
  const totalPages = Math.ceil(currentProjects.length / ITEMS_PER_PAGE)
  const startIndex = currentPage * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const displayedProjects = currentProjects.slice(startIndex, endIndex)

  const handleYearClick = () => {
    setIsYearDropdownOpen(!isYearDropdownOpen)
  }

  const handleYearSelect = (year: number) => {
    setSelectedYear(year)
    setIsYearDropdownOpen(false)
  }

  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex)
  }

  const handleProjectClick = async (project: UIProject) => {
    // 프로젝트 상세 정보 가져오기
    setLoadingDetail(true)
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
      const response = await fetch(`${apiBaseUrl}/projects/${project.id}`)

      if (!response.ok) {
        throw new Error('프로젝트 상세 정보를 불러오는 데 실패했습니다.')
      }

      const data: ProjectDetailApiResponse = await response.json()
      
      if (data.work.main_url) {
        setSelectedProject({
          projectName: data.work.name,
          qrLink: data.work.main_url,
        })
      }
    } catch (err) {
      console.error('프로젝트 상세 정보 로딩 오류:', err)
      // 에러가 발생해도 기본 정보로 모달 표시 시도
      if (project.qrLink) {
        setSelectedProject({
          projectName: project.projectName,
          qrLink: project.qrLink,
        })
      }
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleCloseModal = () => {
    setSelectedProject(null)
    setLoadingDetail(false)
  }

  const handleModalOverlayClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseModal()
    }
  }

  if (loading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '2rem' }}>
          로딩 중...
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '2rem', color: '#dc3545' }}>
          {error}
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <InfoText>
        배너 사진을 클릭하면 배포 QR을 볼 수 있습니다
      </InfoText>

      {availableYears.length > 0 && (
        <YearSelector>
          <YearButton onClick={handleYearClick}>
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
      )}

      <ProjectsGrid>
        {displayedProjects.length > 0 ? (
          displayedProjects.map((project) => (
            <ProjectCard key={project.id}>
              {project.specialNote && <SpecialNote>{project.specialNote}</SpecialNote>}
              <ProjectImageWrapper onClick={() => handleProjectClick(project)}>
                <ProjectImage 
                  src={project.image || projectImage1} 
                  alt={project.projectName}
                  onError={(e) => {
                    // 이미지 로드 실패 시 기본 이미지 사용
                    const target = e.target as HTMLImageElement
                    if (target.src !== projectImage1) {
                      target.src = projectImage1
                    }
                  }}
                />
                <ProjectInfo>
                  <ProjectNameContainer>
                    <ProjectName>{project.projectName}</ProjectName>
                    <StatusBadge $status={project.status}>
                      {project.status}
                    </StatusBadge>
                  </ProjectNameContainer>
                  <Participants>{project.participants.join(' ')}</Participants>
                </ProjectInfo>
              </ProjectImageWrapper>
            </ProjectCard>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: '2rem', color: '#666', padding: '4rem' }}>
            {selectedYear}년 프로젝트가 없습니다
          </div>
        )}
      </ProjectsGrid>

      {totalPages > 1 && (
        <PaginationContainer>
          {Array.from({ length: totalPages }).map((_, index) => (
            <PaginationIndicator
              key={index}
              $active={index === currentPage}
              onClick={() => handlePageChange(index)}
              aria-label={`페이지 ${index + 1}`}
            />
          ))}
        </PaginationContainer>
      )}

      <ModalOverlay 
        $isOpen={!!selectedProject || loadingDetail} 
        onClick={handleModalOverlayClick}
        onTouchStart={handleModalOverlayClick}
      >
        <ModalContent onClick={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
          <ModalCloseButton onClick={handleCloseModal} onTouchStart={handleCloseModal}>×</ModalCloseButton>
          {loadingDetail ? (
            <div style={{ fontSize: '2rem', padding: '4rem' }}>로딩 중...</div>
          ) : selectedProject ? (
            <>
              <ModalTitle>{selectedProject.projectName}</ModalTitle>
              <ModalQRCode>
                <QRCodeSVG
                  value={selectedProject.qrLink}
                  size={300}
                  level="H"
                  includeMargin={false}
                />
              </ModalQRCode>
              <ModalLink>{selectedProject.qrLink}</ModalLink>
            </>
          ) : null}
        </ModalContent>
      </ModalOverlay>
    </Container>
  )
}

export default ProjectPage
