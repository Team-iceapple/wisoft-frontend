import { useLocation, Link } from 'react-router-dom'
import styled from 'styled-components'
import { FaHome, FaLaptop, FaFileAlt, FaTrophy, FaChalkboardTeacher } from 'react-icons/fa'

const HeaderContainer = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3rem 4rem;
    background-color: #ffffff;
    border-bottom: 0.2rem solid #eeeeee; /* 2px -> 0.2rem */
    height: 15rem; /* 150px -> 15rem */
`

const Title = styled.h1`
    font-size: 6rem;
    font-weight: bold;
`

const Nav = styled.nav`
    display: flex;
    gap: 3rem;
`

const NavIcon = styled(Link)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1.5rem;
    border-radius: 1rem; /* 10px -> 1rem */
    text-decoration: none;
    color: #000;
    transition: background-color 0.2s;

    &:active {
        background-color: #f0f0f0;
    }
`

const IconWrapper = styled.div`
    font-size: 6rem;
    display: flex;
    align-items: center;
    justify-content: center;
`

const NavText = styled.span`
    font-size: 2.5rem;
    font-weight: 500;
`

const getTitle = (pathname: string): string => {
    if (pathname === '/') return 'WiSoft'
    if (pathname.startsWith('/project')) return 'Project'
    if (pathname.startsWith('/paper')) return 'Paper'
    if (pathname.startsWith('/awards')) return 'Awards'
    if (pathname.startsWith('/seminar')) return 'Seminar'
    if (pathname.startsWith('/gallery')) return 'Photo'
    return 'WiSoft'
}

const Header = () => {
    const location = useLocation()
    const title = getTitle(location.pathname)

    return (
        <HeaderContainer>
            <Title>{title}</Title>
            <Nav>
                <NavIcon to="/">
                    <IconWrapper>
                        <FaHome />
                    </IconWrapper>
                    <NavText>Home</NavText>
                </NavIcon>
                <NavIcon to="/project">
                    <IconWrapper>
                        <FaLaptop />
                    </IconWrapper>
                    <NavText>Project</NavText>
                </NavIcon>
                <NavIcon to="/paper">
                    <IconWrapper>
                        <FaFileAlt />
                    </IconWrapper>
                    <NavText>Paper</NavText>
                </NavIcon>
                <NavIcon to="/awards">
                    <IconWrapper>
                        <FaTrophy />
                    </IconWrapper>
                    <NavText>Awards</NavText>
                </NavIcon>
                <NavIcon to="/seminar">
                    <IconWrapper>
                        <FaChalkboardTeacher />
                    </IconWrapper>
                    <NavText>Seminar</NavText>
                </NavIcon>
            </Nav>
        </HeaderContainer>
    )
}

export default Header