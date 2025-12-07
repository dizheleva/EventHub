import { describe, it, expect } from 'vitest'
import { formatDate, formatDateForInput } from '../dateFormatter'

describe('dateFormatter', () => {
  describe('formatDate', () => {
    it('should return empty string for empty input', () => {
      expect(formatDate('')).toBe('')
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
    })

    it('should format valid date correctly', () => {
      // Test with a known date: 2024-01-15 (Monday)
      const date = new Date('2024-01-15T12:00:00Z')
      const result = formatDate(date.toISOString())
      expect(result).toContain('15.01.2024')
      expect(result).toContain('Понеделник')
    })

    it('should handle date string in ISO format', () => {
      const result = formatDate('2024-12-25T00:00:00Z')
      expect(result).toContain('25.12.2024')
    })

    it('should return formatted string even for invalid date (formatDate behavior)', () => {
      // formatDate tries to parse and format, so invalid dates may produce NaN
      const result = formatDate('invalid-date')
      // The function attempts to format, so we just check it doesn't crash
      expect(typeof result).toBe('string')
    })

    it('should pad day and month with zeros', () => {
      const result = formatDate('2024-01-05T00:00:00Z')
      expect(result).toContain('05.01.2024')
    })
  })

  describe('formatDateForInput', () => {
    it('should return empty string for empty input', () => {
      expect(formatDateForInput('')).toBe('')
      expect(formatDateForInput(null)).toBe('')
      expect(formatDateForInput(undefined)).toBe('')
    })

    it('should return date as is if already in YYYY-MM-DD format', () => {
      expect(formatDateForInput('2024-01-15')).toBe('2024-01-15')
    })

    it('should convert ISO date string to YYYY-MM-DD format', () => {
      const result = formatDateForInput('2024-01-15T12:00:00Z')
      expect(result).toBe('2024-01-15')
    })

    it('should return empty string for invalid date', () => {
      expect(formatDateForInput('invalid-date')).toBe('')
    })

    it('should handle Date object', () => {
      const date = new Date('2024-01-15')
      const result = formatDateForInput(date.toISOString())
      expect(result).toBe('2024-01-15')
    })
  })
})

