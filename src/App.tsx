import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProcessDetailsPage } from './features/processes/ProcessDetailsPage'
import { ProcessesPage } from './features/processes/ProcessesPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProcessesPage />} />
        <Route path="/processes/:processId" element={<ProcessDetailsPage />} />
        <Route
          path="/processes/:parentProcessId/subprocesses/:subprocessId"
          element={<ProcessDetailsPage />}
        />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
