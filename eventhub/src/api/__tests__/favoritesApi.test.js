import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getFavoritesByUserId,
  addFavorite,
  removeFavorite,
  toggleFavorite,
  isFavorite,
} from '../favoritesApi'
import { API_BASE_URL } from '@/config/api'

// Mock fetch globally
global.fetch = vi.fn()

describe('favoritesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getFavoritesByUserId', () => {
    it('should fetch favorites for a user', async () => {
      const mockFavorites = [
        { id: 1, userId: 1, eventId: 10 },
        { id: 2, userId: 1, eventId: 20 },
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFavorites,
      })

      const result = await getFavoritesByUserId(1)

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/favorites?userId=1`
      )
      expect(result).toEqual(mockFavorites)
    })

    it('should throw error on failed request', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(getFavoritesByUserId(1)).rejects.toThrow()
    })
  })

  describe('addFavorite', () => {
    it('should add a favorite', async () => {
      const mockFavorite = { id: 1, userId: 1, eventId: 10, createdAt: '2024-01-15' }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFavorite,
      })

      const result = await addFavorite(1, 10)

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/favorites`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      // Check that body contains userId and eventId (eventId is converted to string in the actual function)
      const callArgs = fetch.mock.calls[0]
      const body = JSON.parse(callArgs[1].body)
      expect(body.userId).toBe(1)
      expect(body.eventId).toBe('10') // eventId is converted to string
      expect(body.createdAt).toBeDefined()
      expect(result).toEqual(mockFavorite)
    })
  })

  describe('removeFavorite', () => {
    it('should remove a favorite', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
      })

      await removeFavorite(1)

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/favorites/1`,
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  describe('isFavorite', () => {
    it('should return true if event is favorite', async () => {
      const mockFavorites = [
        { id: 1, userId: 1, eventId: 10 },
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFavorites,
      })

      const result = await isFavorite(1, 10)

      expect(result).toBe(true)
    })

    it('should return false if event is not favorite', async () => {
      const mockFavorites = []

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFavorites,
      })

      const result = await isFavorite(1, 10)

      expect(result).toBe(false)
    })
  })

  describe('toggleFavorite', () => {
    it('should add favorite if not exists', async () => {
      const mockFavorites = []
      const mockFavorite = { id: 1, userId: 1, eventId: '10' }

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockFavorites,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockFavorite,
        })

      const result = await toggleFavorite(1, 10)

      // toggleFavorite returns boolean (true if added, false if removed)
      expect(result).toBe(true)
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('should remove favorite if exists', async () => {
      const mockFavorites = [{ id: 1, userId: 1, eventId: '10' }]

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockFavorites,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockFavorites,
        })
        .mockResolvedValueOnce({
          ok: true,
        })

      const result = await toggleFavorite(1, 10)

      // toggleFavorite returns boolean (false if removed)
      expect(result).toBe(false)
      expect(fetch).toHaveBeenCalledTimes(3) // isFavorite, getFavoritesByUserId, removeFavorite
    })
  })
})

