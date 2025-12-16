import { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { QRCodeSVG } from 'qrcode.react'
import { apiGet, API_ENDPOINTS, processImageUrl } from '../utils/api'

const ITEMS_PER_PAGE = 6

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
  team_name: string | null
  members: Member[]
  pdf_url?: string | null
  description: string
  main_url: string
  year: number
}

interface ProjectsApiResponse {
  projects: Project[]
}

interface ProjectDetailApiResponse extends ProjectDetail {}

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
  const [projects, setProjects] = useState<UIProject[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedProject, setSelectedProject] = useState<{
    projectName: string
    qrLink: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // API에서 프로젝트 목록 가져오기
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data: ProjectsApiResponse = await apiGet<ProjectsApiResponse>(API_ENDPOINTS.PROJECTS)

        // 모든 프로젝트를 단일 배열로 변환
        const allProjects: UIProject[] = data.projects.map((project) => {
          // members 배열을 문자열 배열로 변환 (name + extra)
          const participants = project.members.map((member) => 
            member.extra ? `${member.name} (${member.extra})` : member.name
          )

          return {
            id: project.id,
            image: processImageUrl(project.thumbnail),
            projectName: project.name,
            participants,
            qrLink: undefined, // 상세 정보에서 가져올 예정
            status: '진행중', // API 응답에 status가 없으므로 기본값 사용
          }
        })

        setProjects(allProjects)
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
        console.error('프로젝트 데이터 로딩 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // 페이지네이션 계산
  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE)
  const startIndex = currentPage * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const displayedProjects = projects.slice(startIndex, endIndex)

  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex)
  }

  const handleProjectClick = async (project: UIProject) => {
    // 프로젝트 상세 정보 가져오기
    setLoadingDetail(true)
    try {
      const data: ProjectDetailApiResponse = await apiGet<ProjectDetailApiResponse>(API_ENDPOINTS.PROJECT_DETAIL(project.id))
      
      // API 응답 로깅 (디버깅용)
      console.log('프로젝트 상세 응답:', data)
      console.log('main_url 값:', data.main_url)
      
      // main_url이 존재하는지 확인 (빈 문자열도 체크)
      const mainUrl = data.main_url?.trim() || ''
      
      if (mainUrl) {
        setSelectedProject({
          projectName: data.name || project.projectName,
          qrLink: mainUrl,
        })
      } else {
        // main_url이 없으면 프로젝트 정보로 모달 표시 시도
        if (project.qrLink) {
          setSelectedProject({
            projectName: data.name || project.projectName,
            qrLink: project.qrLink,
          })
        } else {
          console.warn('main_url이 없습니다:', data)
        }
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

      <ProjectsGrid>
        {displayedProjects.length > 0 ? (
          displayedProjects.map((project) => (
            <ProjectCard key={project.id}>
              {project.specialNote && <SpecialNote>{project.specialNote}</SpecialNote>}
              <ProjectImageWrapper onClick={() => handleProjectClick(project)}>
                <ProjectImage 
                  src={project.image} 
                  alt={project.projectName}
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
            프로젝트가 없습니다
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
              {selectedProject.qrLink ? (
                <>
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
              ) : (
                <div style={{ fontSize: '1.8rem', color: '#666', padding: '2rem' }}>
                  배포 링크가 없습니다.
                </div>
              )}
            </>
          ) : null}
        </ModalContent>
      </ModalOverlay>
    </Container>
  )
}

export default ProjectPage
