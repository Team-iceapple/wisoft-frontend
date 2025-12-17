import { useLocation, Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { FaHome, FaLaptop, FaFileAlt, FaTrophy, FaCertificate, FaChalkboardTeacher, FaUsers } from 'react-icons/fa'

const HeaderContainer = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 3rem;
    background-color: #ffffff;
    border-bottom: 0.2rem solid #eeeeee;
    height: 8rem;
`

const Title = styled.h1`
    font-size: 3.2rem;
    font-weight: bold;
`

const Nav = styled.nav`
    display: flex;
    gap: 0;
`

const NavIcon = styled(Link)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    padding: 1rem 1.5rem;
    border-radius: 0.8rem;
    text-decoration: none;
    color: #000;
    transition: background-color 0.2s;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;

    &:active {
        background-color: #f0f0f0;
    }
`

const DisabledNavIcon = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    padding: 1rem 1.5rem;
    border-radius: 0.8rem;
    color: #000;
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
`

const IconWrapper = styled.div`
    font-size: 2.6rem;
    display: flex;
    align-items: center;
    justify-content: center;
`

const NavText = styled.span`
    font-size: 1.2rem;
    font-weight: 500;
`

const getTitle = (pathname: string): string => {
    if (pathname === '/') return 'WiSoft'
    if (pathname.startsWith('/project')) return 'Project'
    if (pathname.startsWith('/paper')) return 'Paper'
    if (pathname.startsWith('/awards')) return 'Awards'
    if (pathname.startsWith('/patent')) return 'Patent'
    if (pathname.startsWith('/seminar')) return 'Seminar'
    if (pathname.startsWith('/member')) return 'Member'
    if (pathname.startsWith('/gallery')) return 'Photo'
    return 'WiSoft'
}

const Header = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const title = getTitle(location.pathname)

    const handleNavClick = (e: React.MouseEvent | React.TouchEvent, path: string) => {
        e.preventDefault()
        navigate(path)
    }

    return (
        <HeaderContainer>
            <Title>{title}</Title>
            <Nav>
                <NavIcon 
                    to="/"
                    onMouseDown={(e) => handleNavClick(e, '/')}
                    onTouchStart={(e) => handleNavClick(e, '/')}
                >
                    <IconWrapper>
                        <FaHome />
                    </IconWrapper>
                    <NavText>Home</NavText>
                </NavIcon>
                <NavIcon 
                    to="/project"
                    onMouseDown={(e) => handleNavClick(e, '/project')}
                    onTouchStart={(e) => handleNavClick(e, '/project')}
                >
                    <IconWrapper>
                        <FaLaptop />
                    </IconWrapper>
                    <NavText>Project</NavText>
                </NavIcon>
                <NavIcon 
                    to="/paper"
                    onMouseDown={(e) => handleNavClick(e, '/paper')}
                    onTouchStart={(e) => handleNavClick(e, '/paper')}
                >
                    <IconWrapper>
                        <FaFileAlt />
                    </IconWrapper>
                    <NavText>Paper</NavText>
                </NavIcon>
                <NavIcon 
                    to="/awards"
                    onMouseDown={(e) => handleNavClick(e, '/awards')}
                    onTouchStart={(e) => handleNavClick(e, '/awards')}
                >
                    <IconWrapper>
                        <FaTrophy />
                    </IconWrapper>
                    <NavText>Awards</NavText>
                </NavIcon>
                <NavIcon 
                    to="/patent"
                    onMouseDown={(e) => handleNavClick(e, '/patent')}
                    onTouchStart={(e) => handleNavClick(e, '/patent')}
                >
                    <IconWrapper>
                        <FaCertificate />
                    </IconWrapper>
                    <NavText>Patent</NavText>
                </NavIcon>
                <NavIcon 
                    to="/seminar"
                    onMouseDown={(e) => handleNavClick(e, '/seminar')}
                    onTouchStart={(e) => handleNavClick(e, '/seminar')}
                >
                    <IconWrapper>
                        <FaChalkboardTeacher />
                    </IconWrapper>
                    <NavText>Seminar</NavText>
                </NavIcon>
                <DisabledNavIcon>
                    <IconWrapper>
                        <FaUsers />
                    </IconWrapper>
                    <NavText>Member</NavText>
                </DisabledNavIcon>
            </Nav>
        </HeaderContainer>
    )
}

export default Header