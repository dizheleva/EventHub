import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useFavorites } from '../useFavorites'
import * as favoritesApi from '@/api/favoritesApi'
import { useAuth } from '@/contexts/AuthContext'

// Mock dependencies
vi.mock('@/api/favoritesApi')
vi.mock('@/contexts/AuthContext')
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}))

describe('useFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1 },
    })
  })

  it('should load favorites on mount', async () => {
    const mockFavorites = [
      { id: 1, userId: 1, eventId: 10 },
      { id: 2, userId: 1, eventId: 20 },
    ]
    
    favoritesApi.getFavoritesByUserId.mockResolvedValue(mockFavorites)

    const { result } = renderHook(() => useFavorites())

    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(2)
    })

    expect(favoritesApi.getFavoritesByUserId).toHaveBeenCalledWith(1)
  })

  it('should check if event is favorite', async () => {
    const mockFavorites = [{ id: 1, userId: 1, eventId: '10' }] // eventId is string in API
    favoritesApi.getFavoritesByUserId.mockResolvedValue(mockFavorites)

    const { result } = renderHook(() => useFavorites())

    await waitFor(() => {
      expect(result.current.favorites.length).toBeGreaterThan(0)
    })

    // isFavorite checks eventId as string
    expect(result.current.isFavorite(10)).toBe(true)
    expect(result.current.isFavorite('10')).toBe(true)
    expect(result.current.isFavorite(20)).toBe(false)
  })

  it('should toggle favorite', async () => {
    const mockFavorites = []
    const updatedFavorites = [{ id: 1, userId: 1, eventId: '10' }]
    
    favoritesApi.getFavoritesByUserId
      .mockResolvedValueOnce(mockFavorites) // Initial load
      .mockResolvedValueOnce(updatedFavorites) // After toggle (when adding)
    
    // Mock addFavorite (used when adding)
    favoritesApi.addFavorite.mockResolvedValue({ id: 1, userId: 1, eventId: '10' })

    const { result } = renderHook(() => useFavorites())

    await waitFor(() => {
      expect(result.current.favorites).toEqual([])
    })

    // Toggle favorite (adds it since it's not in favorites)
    await result.current.toggleFavorite(10)

    // Verify addFavorite was called
    expect(favoritesApi.addFavorite).toHaveBeenCalledWith(1, 10)
    
    // After toggle, favorites should be reloaded
    await waitFor(() => {
      expect(favoritesApi.getFavoritesByUserId).toHaveBeenCalledTimes(2)
    })
  })

  it('should return empty array when not authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    })

    const { result } = renderHook(() => useFavorites())

    expect(result.current.favorites).toEqual([])
    expect(favoritesApi.getFavoritesByUserId).not.toHaveBeenCalled()
  })
})

