import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('should handle undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('should merge Tailwind classes correctly', () => {
    expect(cn('text-red-500', 'text-blue-500')).toContain('text-blue-500')
  })

  it('should handle empty strings', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar')
  })
})

