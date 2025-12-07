import { describe, it, expect } from 'vitest'
import { formatPrice } from '../priceFormatter'

describe('priceFormatter', () => {
  describe('formatPrice', () => {
    it('should return €0 for empty input', () => {
      expect(formatPrice('')).toBe('€0')
      expect(formatPrice(null)).toBe('€0')
      expect(formatPrice(undefined)).toBe('€0')
    })

    it('should return "Безплатно" for free events', () => {
      expect(formatPrice('Безплатно')).toBe('Безплатно')
      expect(formatPrice('безплатно')).toBe('Безплатно')
      expect(formatPrice('Безплатн')).toBe('Безплатно')
    })

    it('should convert BGN to EUR', () => {
      expect(formatPrice('100 лв')).toBe('51.02 €')
      expect(formatPrice('196 BGN')).toBe('100.00 €')
      expect(formatPrice('98 лева')).toBe('50.00 €')
    })

    it('should handle numeric values without currency', () => {
      expect(formatPrice('50')).toBe('50.00 €')
      expect(formatPrice('100.5')).toBe('100.50 €')
    })

    it('should handle EUR values', () => {
      expect(formatPrice('50 €')).toBe('50 €')
      expect(formatPrice('€50')).toBe('50 €')
      expect(formatPrice('50 EUR')).toBe('50 EUR')
    })

    it('should add euro symbol to price without currency', () => {
      expect(formatPrice('25')).toBe('25.00 €')
    })

    it('should handle decimal values', () => {
      expect(formatPrice('25.50')).toBe('25.50 €')
      expect(formatPrice('25,50')).toBe('25.50 €')
    })

    it('should handle prices with text', () => {
      expect(formatPrice('Price: 50')).toBe('50.00 €')
    })
  })
})

