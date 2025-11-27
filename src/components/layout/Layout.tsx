import { Outlet } from 'react-router-dom'
import styled from 'styled-components'
import Header from './Header'
import Footer from './Footer'

const MainLayout = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
`

const MainContent = styled.main`
    /* Header와 Footer 높이를 제외한 나머지 공간을 모두 차지 */
    flex: 1;

    /* 스크롤 제거, 컨텐츠가 넘칠 경우 숨김 */
    overflow: hidden;

    padding: 2rem;
`

const Layout = () => {
    return (
        <MainLayout>
            <Header />
            <MainContent>
                <Outlet />
            </MainContent>
            <Footer />
        </MainLayout>
    )
}

export default Layout