import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('should render loading spinner with default message', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Зареждане...')).toBeInTheDocument()
  })

  it('should render loading spinner with custom message', () => {
    render(<LoadingSpinner message="Зареждане на данни..." />)
    expect(screen.getByText('Зареждане на данни...')).toBeInTheDocument()
  })

  it('should render spinner element', () => {
    const { container } = render(<LoadingSpinner />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})

