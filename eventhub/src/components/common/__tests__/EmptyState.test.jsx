import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '../EmptyState'

describe('EmptyState', () => {
  it('should render with title and message', () => {
    render(
      <EmptyState
        title="Няма данни"
        message="Няма налични данни за показване"
      />
    )
    expect(screen.getByText('Няма данни')).toBeInTheDocument()
    expect(screen.getByText('Няма налични данни за показване')).toBeInTheDocument()
  })

  it('should render with emoji icon', () => {
    render(
      <EmptyState
        title="Няма събития"
        message="Няма намерени събития"
        icon="📅"
      />
    )
    expect(screen.getByRole('img', { name: '📅' })).toBeInTheDocument()
  })

  it('should render with default Calendar icon when no icon provided', () => {
    const { container } = render(
      <EmptyState
        title="Няма данни"
        message="Няма налични данни"
      />
    )
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })
})

