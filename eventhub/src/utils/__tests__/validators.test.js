import { describe, it, expect } from 'vitest'
import { validators } from '../validators'

describe('validators', () => {
  describe('title', () => {
    it('should return error if title is empty', () => {
      expect(validators.title('')).toBe('Заглавието е задължително')
      expect(validators.title('   ')).toBe('Заглавието е задължително')
    })

    it('should return error if title is too short', () => {
      expect(validators.title('ab')).toBe('Заглавието трябва да е поне 3 символа')
    })

    it('should return null if title is valid', () => {
      expect(validators.title('Valid Title')).toBeNull()
      expect(validators.title('ABC')).toBeNull()
    })
  })

  describe('date', () => {
    it('should return error if date is empty', () => {
      expect(validators.date('')).toBe('Датата е задължителна')
      expect(validators.date(null)).toBe('Датата е задължителна')
    })

    it('should return error if date is in the past', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(validators.date(yesterday.toISOString().split('T')[0])).toBe('Датата трябва да е днес или в бъдеще')
    })

    it('should return null if date is today', () => {
      // Create date string for today in local timezone
      const today = new Date()
      today.setHours(12, 0, 0, 0) // Set to noon to avoid timezone issues
      const todayStr = today.toISOString().split('T')[0]
      expect(validators.date(todayStr)).toBeNull()
    })

    it('should return null if date is in the future', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(validators.date(tomorrow.toISOString().split('T')[0])).toBeNull()
    })
  })

  describe('email', () => {
    it('should return error if email is empty', () => {
      expect(validators.email('')).toBe('Имейлът е задължителен')
    })

    it('should return error if email is invalid', () => {
      expect(validators.email('invalid')).toBe('Моля, въведете валиден имейл адрес')
      expect(validators.email('invalid@')).toBe('Моля, въведете валиден имейл адрес')
      expect(validators.email('@example.com')).toBe('Моля, въведете валиден имейл адрес')
    })

    it('should return null if email is valid', () => {
      expect(validators.email('test@example.com')).toBeNull()
      expect(validators.email('user.name@domain.co.uk')).toBeNull()
    })
  })

  describe('password', () => {
    it('should return error if password is empty', () => {
      expect(validators.password('')).toBe('Паролата е задължителна')
    })

    it('should return error if password is too short', () => {
      expect(validators.password('12345')).toBe('Паролата трябва да е поне 6 символа')
    })

    it('should return null if password is valid', () => {
      expect(validators.password('123456')).toBeNull()
      expect(validators.password('password123')).toBeNull()
    })
  })

  describe('confirmPassword', () => {
    it('should return error if confirmPassword is empty', () => {
      expect(validators.confirmPassword('password123', '')).toBe('Моля, потвърдете паролата')
    })

    it('should return error if passwords do not match', () => {
      expect(validators.confirmPassword('password123', 'password456')).toBe('Паролите не съвпадат')
    })

    it('should return null if passwords match', () => {
      expect(validators.confirmPassword('password123', 'password123')).toBeNull()
    })
  })

  describe('imageUrl', () => {
    it('should return null if URL is empty (optional field)', () => {
      expect(validators.imageUrl('')).toBeNull()
    })

    it('should return error if URL is invalid', () => {
      expect(validators.imageUrl('not-a-url')).toBe('Моля, въведете валиден URL адрес')
    })

    it('should return null if URL is valid', () => {
      expect(validators.imageUrl('https://example.com/image.jpg')).toBeNull()
      expect(validators.imageUrl('http://example.com/image.png')).toBeNull()
    })
  })

  describe('location', () => {
    it('should return error if location is empty', () => {
      expect(validators.location('')).toBe('Локацията е задължителна')
    })

    it('should return null if location is provided', () => {
      expect(validators.location('Sofia')).toBeNull()
      expect(validators.location('Plovdiv, Center')).toBeNull()
    })
  })

  describe('description', () => {
    it('should return error if description is empty', () => {
      expect(validators.description('')).toBe('Описанието е задължително')
    })

    it('should return error if description is too short', () => {
      expect(validators.description('short')).toBe('Описанието трябва да е поне 10 символа')
    })

    it('should return null if description is valid', () => {
      expect(validators.description('This is a valid description')).toBeNull()
    })
  })

  describe('city', () => {
    it('should return error if city is empty', () => {
      expect(validators.city('')).toBe('Градът е задължителен')
    })

    it('should return error if city is too short', () => {
      expect(validators.city('A')).toBe('Градът трябва да е поне 2 символа')
    })

    it('should return null if city is valid', () => {
      expect(validators.city('Sofia')).toBeNull()
    })
  })

  describe('category', () => {
    it('should return error if category is empty', () => {
      expect(validators.category('')).toBe('Категорията е задължителна')
    })

    it('should return null if category is provided', () => {
      expect(validators.category('music')).toBeNull()
    })
  })
})

