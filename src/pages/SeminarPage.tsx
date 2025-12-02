import { useState, useEffect } from 'react'
import styled from 'styled-components'

interface Seminar {
  title: string
  cover: string
  icon: string | null
  link: string
}

const ITEMS_PER_PAGE = 6 

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 2rem 4rem;
  gap: 1.5rem;
  overflow: hidden;
`

const LoadingText = styled.p`
  font-size: 4rem;
  text-align: center;
  color: #666;
  padding: 4rem;
`

const ErrorText = styled.p`
  font-size: 4rem;
  text-align: center;
  color: #dc3545;
  padding: 4rem;
`

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
  width: 100%;
  flex: 1;
  padding: 1rem 0;
  min-height: 0;
  max-width: 90%;
  margin: 0 auto;
`

const SeminarCard = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 2rem;
  overflow: hidden;
  background: #f8f9fa;
  color: inherit;
  transition: transform 0.3s, box-shadow 0.3s;
  aspect-ratio: 1;
  min-height: 0;
  border: 0.2rem solid #e0e0e0;

  &:hover {
    transform: translateY(-0.5rem);
    box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.15);
  }
`

const CardImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 70%;
  overflow: hidden;
  background: #e9ecef;
`

const CardCoverImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const CardIcon = styled.img`
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 8rem;
  height: 8rem;
  border-radius: 1rem;
  background: white;
  padding: 1rem;
  box-sizing: border-box;
  object-fit: contain;
  box-shadow: 0 0.2rem 0.8rem rgba(0, 0, 0, 0.1);
`

const CardContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: white;
  min-height: 0;
`

const CardTitle = styled.h3`
  font-size: 4rem;
  font-weight: bold;
  text-align: center;
  color: #333;
  margin: 0;
  line-height: 1.3;
  word-break: break-word;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  padding: 0.5rem 0;
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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 2rem;
  color: #666;
  font-size: 3.5rem;
`

const SeminarPage = () => {
  const [seminars, setSeminars] = useState<Seminar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    const fetchSeminars = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://home-api.wisoft.io/api'
        const response = await fetch(`${apiBaseUrl}/notion/seminars`)

        if (!response.ok) {
          throw new Error('세미나 데이터를 불러오는 데 실패했습니다.')
        }

        const data = await response.json()
        const formattedData: Seminar[] = data.map((item: any) => ({
          title: item.title || 'Untitled',
          cover: item.cover || '/default-banner.png',
          icon: item.icon || null,
          link: item.link || '#',
        }))

        setSeminars(formattedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchSeminars()
  }, [])

  // 페이지네이션 계산
  const totalPages = Math.ceil(seminars.length / ITEMS_PER_PAGE)
  const startIndex = currentPage * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentSeminars = seminars.slice(startIndex, endIndex)

  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex)
  }

  if (loading) {
    return (
      <Container>
        <LoadingText>로딩 중...</LoadingText>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <ErrorText>오류 발생: {error}</ErrorText>
      </Container>
    )
  }

  if (seminars.length === 0) {
    return (
      <Container>
        <EmptyState>
          <p>표시할 세미나가 없습니다.</p>
        </EmptyState>
      </Container>
    )
  }

  return (
    <Container>
      <GridContainer>
        {currentSeminars.map((seminar, index) => (
          <SeminarCard key={`${startIndex + index}`}>
            <CardImageWrapper>
              <CardCoverImage src={seminar.cover} alt={seminar.title} />
              {seminar.icon && <CardIcon src={seminar.icon} alt="icon" />}
            </CardImageWrapper>
            <CardContent>
              <CardTitle>{seminar.title}</CardTitle>
            </CardContent>
          </SeminarCard>
        ))}
      </GridContainer>

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
    </Container>
  )
}

export default SeminarPage