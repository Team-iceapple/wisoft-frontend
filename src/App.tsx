import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ProjectPage from './pages/ProjectPage'
import PaperPage from './pages/PaperPage'
import AwardsPage from './pages/AwardsPage'
import SeminarPage from './pages/SeminarPage'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="project" element={<ProjectPage />} />
                    <Route path="paper" element={<PaperPage />} />
                    <Route path="awards" element={<AwardsPage />} />
                    <Route path="seminar" element={<SeminarPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App