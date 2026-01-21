import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { RoomPage } from './pages/RoomPage'
import { GamePage } from './pages/GamePage'
import { ResultPage } from './pages/ResultPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomCode" element={<RoomPage />} />
        <Route path="/game/:roomCode" element={<GamePage />} />
        <Route path="/result/:roomCode" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
