'use client'

import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="glass-card p-8 text-center max-w-md mx-auto mt-12">
          <div className="text-4xl mb-4">💥</div>
          <h2 className="text-xl font-bold text-silver mb-2">
            Something Went Wrong
          </h2>
          <p className="text-silver/60 mb-4">
            Something went wrong rendering this section.
          </p>
          {this.state.error && (
            <p className="text-xs text-mana-red/70 font-mono mb-4 break-all">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleRetry}
            className="btn-arcane"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
