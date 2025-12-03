// @ts-ignore
import React from 'react'
// @ts-ignore
import ReactDOM from 'react-dom/client'
import App from './App'
import { GlobalStyle } from './styles/GlobalStyle'
import { ThemeProvider, styled } from 'styled-components'

const theme = {
    colors: {
        primary: '#007bff',
        background: '#ffffff',
        text: '#000000',
    },
}

const KioskWrapper = styled.div`
    /* --- ★ 1. 1440x2560 사이즈로 크기 고정 --- */
    width: 1440px;
    height: 2560px;

    /* --- ★ 2. 뷰포트(브라우저 창)에 맞게 스케일링 --- */
    --scale-x: calc(100vw / 1440);
    --scale-y: calc(100vh / 2560);
    --scale: min(var(--scale-x), var(--scale-y));

    transform: scale(var(--scale));

    /* ★ 3. transform-origin 제거 (기본값 center center 사용) ★ */
    /* transform-origin: top left; */

    /* --- 기존 스타일 --- */
    overflow: hidden;
    background-color: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.text};
`

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <GlobalStyle />
            <KioskWrapper>
                <App />
            </KioskWrapper>
        </ThemeProvider>
    </React.StrictMode>,
)