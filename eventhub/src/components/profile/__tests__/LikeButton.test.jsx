import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LikeButton } from '../LikeButton'

describe('LikeButton', () => {
  it('should render liked state', () => {
    const onToggle = vi.fn()
    render(<LikeButton isLiked={true} onToggle={onToggle} />)
    
    const button = screen.getByRole('button', { name: /премахни харесване/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('should render not liked state', () => {
    const onToggle = vi.fn()
    render(<LikeButton isLiked={false} onToggle={onToggle} />)
    
    const button = screen.getByRole('button', { name: /дай харесване/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('should call onToggle when clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<LikeButton isLiked={false} onToggle={onToggle} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    const onToggle = vi.fn()
    render(<LikeButton isLiked={false} onToggle={onToggle} disabled={true} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should not call onToggle when disabled', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<LikeButton isLiked={false} onToggle={onToggle} disabled={true} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(onToggle).not.toHaveBeenCalled()
  })
})

