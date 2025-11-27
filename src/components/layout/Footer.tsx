import styled from 'styled-components'

const FooterContainer = styled.footer`
    height: 329px; /* 4K 기준 푸터 높이 (내용이 많아져서 늘림) */
    padding: 2rem 4rem;
    background-color: #ffffff;
    border-top: 1px solid #eeeeee;

    display: flex;
    align-items: center; /* 세로 중앙 정렬 */
    justify-content: flex-start; /* ★ 1. 왼쪽 정렬로 변경 */
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem; /* 라인 간 간격 */
  
  p {
    line-height: 1.4; /* 줄 간격 */
  }

  /* ★ 2. 이미지에 맞게 텍스트 스타일링 */
  .title {
    font-size: 3rem; /* 국립한밭대학교 */
    font-weight: bold;
    color: #000;
  }
  
  .subtitle {
    font-size: 2.8rem; /* 무선통신소프트웨어연구실 */
    font-weight: bold;
    color: #000;
  }
  
  .address, .contact {
    font-size: 2.3rem; /* 주소 및 연락처 */
    color: #555;
  }
`

const Footer = () => {
    return (
        <FooterContainer>
            <ContentWrapper>
                <p className="title">국립한밭대학교</p>
                <p className="subtitle">무선통신소프트웨어연구실</p>
                <p className="address">
                    대전광역시 유성구 동서대로 125(덕명동) 한밭대학교 유성캠퍼스 N5동 503호
                </p>
                <p className="contact">CONTACT@WISOFT.IO</p>
            </ContentWrapper>
        </FooterContainer>
    )
}

export default Footer