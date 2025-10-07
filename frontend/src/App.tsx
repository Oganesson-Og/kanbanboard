import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import styled, { createGlobalStyle } from 'styled-components'
import Board from './components/Board'
import WorkloadPage from './components/workload/WorkloadPage'
import Login from './components/Login'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.color.bg};
    color: ${({ theme }) => theme.color.text.primary};
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
  }

  input, textarea {
    outline: none;
  }

  :focus-visible {
    outline: none;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
`

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

function AppContent() {
  const { user, isLoading } = useAuth()

  console.log('AppContent render:', { user: !!user, isLoading })

  if (isLoading) {
    return (
      <AppContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', fontSize: '1.2rem' }}>
          Loading...
        </div>
      </AppContainer>
    )
  }

  if (!user) {
    console.log('No user, showing login')
    return (
      <AppContainer>
        <Login onLogin={() => {}} />
      </AppContainer>
    )
  }

  console.log('User authenticated, showing board')
  return (
    <AppContainer>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<Board />} />
            <Route path="/workload" element={<WorkloadPage />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </AppContainer>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <GlobalStyle />
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App

