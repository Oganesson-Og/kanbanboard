import React, { Component, ErrorInfo, ReactNode } from 'react'
import styled from 'styled-components'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  color: white;
  text-align: center;
`

const ErrorBox = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: #333;
`

const ErrorTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #e74c3c;
`

const ErrorMessage = styled.p`
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: #666;
`

const ErrorDetails = styled.details`
  text-align: left;
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
`

const ErrorSummary = styled.summary`
  cursor: pointer;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`

const ErrorStack = styled.pre`
  font-size: 0.8rem;
  color: #666;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
`

const ReloadButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
`

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorBox>
            <ErrorTitle>Oops! Something went wrong</ErrorTitle>
            <ErrorMessage>
              The application encountered an unexpected error. This is likely a temporary issue.
            </ErrorMessage>
            
            <ReloadButton onClick={this.handleReload}>
              Reload Application
            </ReloadButton>

            {this.state.error && (
              <ErrorDetails>
                <ErrorSummary>Technical Details</ErrorSummary>
                <div>
                  <strong>Error:</strong> {this.state.error.name}: {this.state.error.message}
                </div>
                {this.state.errorInfo && (
                  <div>
                    <strong>Component Stack:</strong>
                    <ErrorStack>{this.state.errorInfo.componentStack}</ErrorStack>
                  </div>
                )}
                <div>
                  <strong>Stack Trace:</strong>
                  <ErrorStack>{this.state.error.stack}</ErrorStack>
                </div>
              </ErrorDetails>
            )}
          </ErrorBox>
        </ErrorContainer>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
