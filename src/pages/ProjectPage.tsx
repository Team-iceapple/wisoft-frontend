import { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { QRCodeSVG } from 'qrcode.react'
import { apiGet, API_ENDPOINTS, processImageUrl } from '../utils/api'

const ITEMS_PER_PAGE = 6

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
  from { opacity: 0; }
  to { opacity: 1; }
`

const slideUp = keyframes`
  from { transform: translateY(5rem); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
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

const ProjectImageWrapper = styled.div`
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 22rem;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 1.5rem;
  &:hover { transform: scale(1.02); }
`

const ProjectImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
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

const Participants = styled.div`
  font-size: 1.4rem;
  line-height: 1.4;
`

const InfoText = styled.div`
  text-align: center;
  font-size: 1.6rem;
  color: #666;
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

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: relative;
`

const ModalTitle = styled.h2`
  font-size: 3rem;
  font-weight: bold;
  text-align: center;
`

const ModalCloseButton = styled.button`
  position: absolute;
  top: -4rem;
  right: -2rem;
  background: none;
  border: none;
  font-size: 3.6rem;
  cursor: pointer;
  color: #666;
`

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0;
`

const PaginationIndicator = styled.button<{ $active: boolean }>`
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  background: ${(props) => (props.$active ? '#333' : '#ccc')};
  border: none;
  cursor: pointer;
`

const ProjectPage = () => {
  const [projects, setProjects] = useState<UIProject[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedProject, setSelectedProject] = useState<{ projectName: string; qrLink: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data: ProjectsApiResponse = await apiGet<ProjectsApiResponse>(API_ENDPOINTS.PROJECTS)
        const allProjects: UIProject[] = data.projects.map((p) => ({
          id: p.id,
          image: processImageUrl(p.thumbnail),
          projectName: p.name,
          participants: p.members.map((m) => m.extra ? `${m.name} (${m.extra})` : m.name),
          status: '진행중',
        }))
        setProjects(allProjects)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const handleProjectClick = async (project: UIProject) => {
    setLoadingDetail(true)
    try {
      const data: ProjectDetailApiResponse = await apiGet<ProjectDetailApiResponse>(API_ENDPOINTS.PROJECT_DETAIL(project.id))
      if (data.main_url) setSelectedProject({ projectName: data.name, qrLink: data.main_url })
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleCloseModal = () => setSelectedProject(null)

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE)
  const displayedProjects = projects.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)

  if (loading) return null

  return (
    <Container>
      <InfoText>배너 사진을 클릭하면 배포 QR을 볼 수 있습니다</InfoText>
      <ProjectsGrid>
        {displayedProjects.map((project) => (
          <ProjectCard key={project.id}>
            <ProjectImageWrapper onClick={() => handleProjectClick(project)}>
              <ProjectImage src={project.image} alt={project.projectName} />
              <ProjectInfo>
                <ProjectNameContainer>
                  <ProjectName>{project.projectName}</ProjectName>
                  <StatusBadge $status={project.status}>{project.status}</StatusBadge>
                </ProjectNameContainer>
                <Participants>{project.participants.join(' ')}</Participants>
              </ProjectInfo>
            </ProjectImageWrapper>
          </ProjectCard>
        ))}
      </ProjectsGrid>

      {totalPages > 1 && (
        <PaginationContainer>
          {Array.from({ length: totalPages }).map((_, i) => (
            <PaginationIndicator key={i} $active={i === currentPage} onClick={() => setCurrentPage(i)} />
          ))}
        </PaginationContainer>
      )}

      <ModalOverlay $isOpen={!!selectedProject || loadingDetail} onClick={handleCloseModal}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>{loadingDetail ? '로딩 중...' : selectedProject?.projectName}</ModalTitle>
            <ModalCloseButton onClick={handleCloseModal}>×</ModalCloseButton>
          </ModalHeader>
          {selectedProject?.qrLink && (
            <>
              <div style={{ padding: '2rem', border: '2px solid #ddd', borderRadius: '1rem' }}>
                <QRCodeSVG value={selectedProject.qrLink} size={300} level="H" />
              </div>
              <div style={{ fontSize: '1.8rem', color: '#007bff' }}>{selectedProject.qrLink}</div>
            </>
          )}
        </ModalContent>
      </ModalOverlay>
    </Container>
  )
}

export default ProjectPage