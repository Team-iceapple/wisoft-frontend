import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { apiGet, API_ENDPOINTS, processImageUrl } from '../utils/api'

const ITEMS_PER_PAGE = 6

// API 응답 타입 정의 (기존 유지 및 확장)
interface Patent {
  id: string
  year: number
  pdf_url: string
  name?: string; // 특허명 (API에 없을 경우를 대비해 선택 사항)
  authors?: string[]; // 참여 인원
  thumbnail?: string; // 썸네일 이미지
}

interface PatentsApiResponse {
  patents: Patent[]
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 2rem 4rem 4rem;
  gap: 2rem;
  overflow: hidden;
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

const PatentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 2.5rem;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

const PatentCard = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 1.5rem;
  overflow: hidden;
  background: #f8f9fa;
  min-height: 0;
`

const PatentImageWrapper = styled.div`
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

const PatentImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
  border-radius: 1.5rem;
  background: #eee; /* 이미지 로딩 전 배경 */
`

const PatentInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 3rem 2rem 2rem;
  color: white;
`

const PatentName = styled.h2`
  font-size: 2.2rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
`

const Authors = styled.div`
  font-size: 1.4rem;
  line-height: 1.4;
`

// 모달 스타일 (ProjectPage 참조)
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
`

const ModalContent = styled.div`
  background: white;
  border-radius: 2rem;
  padding: 4rem;
  max-width: 80rem;
  width: 90%;
  height: 80vh;
  display: flex;
  flex-direction: column;
  position: relative;
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 2rem;
`

const ModalTitle = styled.h2`
  font-size: 2.6rem;
  font-weight: bold;
  margin: 0;
`

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 3.6rem;
  cursor: pointer;
  color: #666;
  line-height: 1;
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
  padding: 0;
`

const PatentPage = () => {
  const [patents, setPatents] = useState<Patent[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatents = async () => {
      try {
        const data: PatentsApiResponse = await apiGet<PatentsApiResponse>(API_ENDPOINTS.PATENT)
        setPatents(data.patents || [])
      } catch (err) {
        console.error('특허 로딩 오류:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPatents()
  }, [])

  const totalPages = Math.ceil(patents.length / ITEMS_PER_PAGE)
  const displayedPatents = patents.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)

  const handlePatentClick = (patent: Patent) => {
    setSelectedPatent(patent)
  }

  if (loading) return <Container><div style={{ textAlign: 'center', fontSize: '2rem' }}>로딩 중...</div></Container>

  return (
    <Container>
      <InfoText>특허를 클릭하면 상세 문서를 확인할 수 있습니다</InfoText>

      <PatentGrid>
        {displayedPatents.length > 0 ? (
          displayedPatents.map((patent) => (
            <PatentCard key={patent.id}>
              <PatentImageWrapper onClick={() => handlePatentClick(patent)}>
                {/* 썸네일이 없을 경우를 대비해 pdf_url이나 기본 이미지 처리 필요 */}
                <PatentImage 
                  src={patent.thumbnail ? processImageUrl(patent.thumbnail) : '/patent_placeholder.png'} 
                  alt={patent.name || '특허 이미지'}
                />
                <PatentInfo>
                  <PatentName>{patent.name || `${patent.name}`}</PatentName>
                  <Authors>{patent.authors?.join(', ') || '연구진 정보 없음'}</Authors>
                </PatentInfo>
              </PatentImageWrapper>
            </PatentCard>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: '2rem', color: '#666' }}>
            등록된 특허가 없습니다
          </div>
        )}
      </PatentGrid>

      {totalPages > 1 && (
        <PaginationContainer>
          {Array.from({ length: totalPages }).map((_, index) => (
            <PaginationIndicator
              key={index}
              $active={index === currentPage}
              onClick={() => setCurrentPage(index)}
            />
          ))}
        </PaginationContainer>
      )}

      {/* 특허 상세 모달 */}
      <ModalOverlay $isOpen={!!selectedPatent}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{selectedPatent?.name || '특허 상세 정보'}</ModalTitle>
            <ModalCloseButton onClick={() => setSelectedPatent(null)}>×</ModalCloseButton>
          </ModalHeader>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', borderRadius: '1rem', fontSize: '2rem', color: '#666' }}>
            {/* 여기에 나중에 iframe이나 PDF 뷰어를 넣으시면 됩니다 */}
            PDF 문서 영역 (준비 중)
          </div>
        </ModalContent>
      </ModalOverlay>
    </Container>
  )
}

export default PatentPage