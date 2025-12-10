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
    width: 1440px;
    height: 2560px;

    --scale-x: calc(100vw / 1440);
    --scale-y: calc(100vh / 2560);
    --scale: min(var(--scale-x), var(--scale-y));

    transform: scale(var(--scale));

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