import styled from 'styled-components'

const FooterContainer = styled.footer`
    height: 10rem;
    padding: 1.5rem 3rem;
    background-color: #ffffff;
    border-top: 0.1rem solid #eeeeee;

    display: flex;
    align-items: center;
    justify-content: flex-start;
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  p {
    line-height: 1.3;
  }

  .title {
    font-size: 2rem;
    font-weight: bold;
    color: #000;
  }
  
  .subtitle {
    font-size: 1.8rem;
    font-weight: bold;
    color: #000;
  }
  
  .address, .contact {
    font-size: 1.5rem;
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