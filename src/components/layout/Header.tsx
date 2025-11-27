import { useLocation, Link } from 'react-router-dom'
import styled from 'styled-components'

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
    font-size: 5rem;
    padding: 1.5rem;
    border-radius: 1rem; /* 10px -> 1rem */

    &:active {
        background-color: #f0f0f0;
    }
`

const getTitle = (pathname: string): string => {
    if (pathname === '/') return 'WiSoft'
    if (pathname.startsWith('/project')) return 'Project'
    if (pathname.startsWith('/paper')) return 'Paper'
    if (pathname.startsWith('/awards')) return 'Awards'
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
                {/* 아이콘으로 교체 필요 */}
                <NavIcon to="/">Home</NavIcon>
                <NavIcon to="/project">Project</NavIcon>
                <NavIcon to="/paper">Paper</NavIcon>
                <NavIcon to="/awards">Awards</NavIcon>
                <NavIcon to="/seminar">Seminar</NavIcon>
            </Nav>
        </HeaderContainer>
    )
}

export default Header