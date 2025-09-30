import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components'
import { theme } from './theme'
import Board from './components/Board'
import Login from './components/Login'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider, useAuth } from './contexts/AuthContext'

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
    background-color: ${theme.color.bg};
    color: ${theme.color.text.primary};
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
          </Routes>
        </Router>
      </ErrorBoundary>
    </AppContainer>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App

