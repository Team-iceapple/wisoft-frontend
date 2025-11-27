import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { QRCodeSVG } from 'qrcode.react'
// @ts-ignore
import projectImage1 from '../assets/image-project1.jpg'
// @ts-ignore
import projectImage2 from '../assets/image-project2.jpg'

// 연도별 프로젝트 데이터
const projectsByYear: Record<number, Array<{
  image: string
  specialNote?: string
  projectName: string
  participants: string[]
  qrLink?: string
}>> = {
  2025: [
    {
      image: projectImage1,
      specialNote: '포브스 선정 2025 가장 영향력있는 프로젝트',
      projectName: 'Iceapple',
      participants: ['유재영', '문동민', '김나연', '신보연', '이선혜', '이은채', '이혜현', '임예은', '정예환'],
      qrLink: 'https://iceapple.wisoft.io',
    },
    {
      image: projectImage2,
      projectName: '학슐랭',
      participants: ['김나연', '이은채', '이혜현', '정예환'],
      qrLink: 'https://hakchulraeng.wisoft.io',
    },
    {
      image: projectImage1,
      specialNote: '2025년 신규 프로젝트',
      projectName: '프로젝트 알파',
      participants: ['김철수', '이영희', '박민수', '최지영'],
      qrLink: 'https://project-alpha.wisoft.io',
    },
    {
      image: projectImage2,
      projectName: '프로젝트 베타',
      participants: ['정수진', '강동욱', '윤서연'],
      qrLink: 'https://project-beta.wisoft.io',
    },
    {
      image: projectImage1,
      projectName: '프로젝트 감마',
      participants: ['조현우', '임도현', '한소희', '오준혁', '배수진'],
      qrLink: 'https://project-gamma.wisoft.io',
    },
    {
      image: projectImage2,
      specialNote: '2025년 하반기 프로젝트',
      projectName: '프로젝트 델타',
      participants: ['송민준', '김하늘', '이준호'],
      qrLink: 'https://project-delta.wisoft.io',
    },
    {
      image: projectImage1,
      projectName: '프로젝트 엡실론',
      participants: ['장예린', '홍길동', '김미영', '이태호', '박지훈', '최유진'],
      qrLink: 'https://project-epsilon.wisoft.io',
    },
  ],
  2024: [
    {
      image: projectImage1,
      specialNote: '2024년 우수 프로젝트',
      projectName: '프로젝트 A',
      participants: ['참여자1', '참여자2', '참여자3'],
      qrLink: 'https://project-a.wisoft.io',
    },
    {
      image: projectImage2,
      projectName: '프로젝트 B',
      participants: ['참여자4', '참여자5'],
      qrLink: 'https://project-b.wisoft.io',
    },
  ],
  2023: [
    {
      image: projectImage1,
      projectName: '프로젝트 C',
      participants: ['참여자6', '참여자7'],
      qrLink: 'https://project-c.wisoft.io',
    },
  ],
}

const availableYears = Object.keys(projectsByYear)
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
  padding: 4rem;
  gap: 4rem;
  overflow-y: auto;
`

const YearSelector = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
`

const YearButton = styled.button`
  font-size: 6rem;
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
  padding: 1.5rem 3rem;
  font-size: 3rem;
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
  gap: 4rem;
  flex: 1;
`

const ProjectCard = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 2rem;
  overflow: hidden;
  background: #f8f9fa;
`

const SpecialNote = styled.div`
  position: absolute;
  top: 2rem;
  left: 2rem;
  right: 2rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 1.5rem 2rem;
  border-radius: 1rem;
  font-size: 2rem;
  font-weight: bold;
  z-index: 10;
  text-align: center;
`

const ProjectImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 50rem;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 2rem;

  &:hover {
    transform: scale(1.02);
  }
`

const ProjectImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
  border-radius: 2rem;
`

const ProjectInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 4rem 3rem 3rem;
  color: white;
`

const ProjectName = styled.h2`
  font-size: 4.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
`

const Participants = styled.div`
  font-size: 2.4rem;
  line-height: 1.6;
`

const InfoText = styled.div`
  text-align: center;
  font-size: 2.4rem;
  color: #666;
  margin-top: 2rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 1rem;
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
  font-size: 4rem;
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
  font-size: 2.4rem;
  color: #007bff;
  word-break: break-all;
  text-align: center;
`

const ProjectPage = () => {
  const [selectedYear, setSelectedYear] = useState(availableYears[0])
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<{
    projectName: string
    qrLink: string
  } | null>(null)

  const currentProjects = projectsByYear[selectedYear] || []

  const handleYearClick = () => {
    setIsYearDropdownOpen(!isYearDropdownOpen)
  }

  const handleYearSelect = (year: number) => {
    setSelectedYear(year)
    setIsYearDropdownOpen(false)
  }

  const handleProjectClick = (project: typeof currentProjects[0]) => {
    if (project.qrLink) {
      setSelectedProject({
        projectName: project.projectName,
        qrLink: project.qrLink,
      })
    }
  }

  const handleCloseModal = () => {
    setSelectedProject(null)
  }

  const handleModalOverlayClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseModal()
    }
  }

  return (
    <Container>
      <YearSelector>
        <YearButton onClick={handleYearClick}>{selectedYear}</YearButton>
        <YearDropdown $isOpen={isYearDropdownOpen}>
          {availableYears.map((year) => (
            <YearOption key={year} onClick={() => handleYearSelect(year)}>
              {year}
            </YearOption>
          ))}
        </YearDropdown>
      </YearSelector>

      <InfoText>
        배너 사진을 클릭하면 배포 QR을 볼 수 있습니다
      </InfoText>

      <ProjectsGrid>
        {currentProjects.map((project, index) => (
          <ProjectCard key={index}>
            {project.specialNote && <SpecialNote>{project.specialNote}</SpecialNote>}
            <ProjectImageWrapper onClick={() => handleProjectClick(project)}>
              <ProjectImage src={project.image} alt={project.projectName} />
              <ProjectInfo>
                <ProjectName>{project.projectName}</ProjectName>
                <Participants>{project.participants.join(' ')}</Participants>
              </ProjectInfo>
            </ProjectImageWrapper>
          </ProjectCard>
        ))}
      </ProjectsGrid>

      <ModalOverlay 
        $isOpen={!!selectedProject} 
        onClick={handleModalOverlayClick}
        onTouchStart={handleModalOverlayClick}
      >
        <ModalContent onClick={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
          <ModalCloseButton onClick={handleCloseModal} onTouchStart={handleCloseModal}>×</ModalCloseButton>
          <ModalTitle>{selectedProject?.projectName}</ModalTitle>
          <ModalQRCode>
            {selectedProject && (
              <QRCodeSVG
                value={selectedProject.qrLink}
                size={300}
                level="H"
                includeMargin={false}
              />
            )}
          </ModalQRCode>
          {selectedProject && (
            <ModalLink>{selectedProject.qrLink}</ModalLink>
          )}
        </ModalContent>
      </ModalOverlay>
    </Container>
  )
}

export default ProjectPage
