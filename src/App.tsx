import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Terminal from './pages/Terminal'
import Projects from './pages/Projects'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import Settings from './pages/Settings'
import Snake from './pages/Snake'
import Pong from './pages/Pong'
import MatrixRain from './pages/MatrixRain'
import Shutdown from './pages/Shutdown'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/terminal" element={<Terminal />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/snake" element={<Snake />} />
        <Route path="/pong" element={<Pong />} />
        <Route path="/matrix" element={<MatrixRain />} />
        <Route path="/shutdown" element={<Shutdown />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
