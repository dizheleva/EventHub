import { describe, it, expect } from 'vitest'
import { getUserDisplayName, getUserNameFromId } from '../userHelpers'

describe('userHelpers', () => {
  describe('getUserDisplayName', () => {
    it('should return username if available', () => {
      const user = { username: 'testuser', name: 'Test Name', email: 'test@example.com' }
      expect(getUserDisplayName(user)).toBe('testuser')
    })

    it('should return name if username is not available', () => {
      const user = { name: 'Test Name', email: 'test@example.com' }
      expect(getUserDisplayName(user)).toBe('Test Name')
    })

    it('should return email prefix if only email is available', () => {
      const user = { email: 'test@example.com' }
      expect(getUserDisplayName(user)).toBe('test')
    })

    it('should return fallback if user is null', () => {
      expect(getUserDisplayName(null)).toBe('Неизвестен')
    })

    it('should return fallback if user is undefined', () => {
      expect(getUserDisplayName(undefined)).toBe('Неизвестен')
    })

    it('should return custom fallback if provided', () => {
      expect(getUserDisplayName(null, 'Custom Fallback')).toBe('Custom Fallback')
    })

    it('should return fallback if user has no identifying fields', () => {
      const user = {}
      expect(getUserDisplayName(user)).toBe('Неизвестен')
    })
  })

  describe('getUserNameFromId', () => {
    const users = [
      { id: 1, username: 'user1', email: 'user1@example.com' },
      { id: 2, name: 'User Two', email: 'user2@example.com' },
      { id: 3, email: 'user3@example.com' },
    ]

    it('should return username when user is found', () => {
      expect(getUserNameFromId(1, users)).toBe('user1')
    })

    it('should return name when username is not available', () => {
      expect(getUserNameFromId(2, users)).toBe('User Two')
    })

    it('should return email prefix when only email is available', () => {
      expect(getUserNameFromId(3, users)).toBe('user3')
    })

    it('should return fallback when user is not found', () => {
      expect(getUserNameFromId(999, users)).toBe('Анонимен')
    })

    it('should return custom fallback when user is not found', () => {
      expect(getUserNameFromId(999, users, 'Not Found')).toBe('Not Found')
    })

    it('should handle string user IDs', () => {
      expect(getUserNameFromId('1', users)).toBe('user1')
    })

    it('should handle empty users array', () => {
      expect(getUserNameFromId(1, [])).toBe('Анонимен')
    })

    it('should handle undefined users array', () => {
      expect(getUserNameFromId(1, undefined)).toBe('Анонимен')
    })
  })
})

