import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    html {
        /* 1440x2560 해상도 기준 기본 폰트 크기 설정 */
        font-size: 20px; /* 1440px 기준으로 적절한 크기 */
    }

    html, body, #root {
        width: 100%;
        height: 100%;
        overflow: hidden; /* ★★★ 1. 브라우저 스크롤바 원천 차단 ★★★ */
    }

    body {
        /* ★★★ 2. 레터박스(남는 영역) 배경색 ★★★ */
        background-color: #000;

        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;

        /* --- 터치 UI 중요 설정 --- */
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
    }

    /* ★★★ 3. #root에서 KioskWrapper를 중앙 정렬 ★★★ */
    #root {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    a {
        text-decoration: none;
        color: inherit;
    }

    button {
        border: none;
        background: none;
        cursor: pointer;
        color: inherit;
        font: inherit;
    }
`