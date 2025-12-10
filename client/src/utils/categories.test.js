import { describe, it, expect } from 'vitest';
import { getCategoryEmoji, getCategoryLabel, getCategoryDisplay, formatEventPrice } from './categories';

describe('categories utilities', () => {
  describe('getCategoryEmoji', () => {
    it('returns correct emoji for valid category', () => {
      expect(getCategoryEmoji('Спорт')).toBe('⚽');
      expect(getCategoryEmoji('Култура')).toBe('🎭');
      expect(getCategoryEmoji('Работилници')).toBe('🎨');
    });

    it('returns default emoji for invalid category', () => {
      expect(getCategoryEmoji('invalid')).toBe('❓');
    });
  });

  describe('getCategoryLabel', () => {
    it('returns correct label for valid category', () => {
      expect(getCategoryLabel('Спорт')).toBe('Спорт ⚽');
      expect(getCategoryLabel('Култура')).toBe('Култура 🎭');
      expect(getCategoryLabel('Работилници')).toBe('Работилници 🎨');
    });

    it('returns default label for invalid category', () => {
      expect(getCategoryLabel('invalid')).toBe('❓ Други');
    });
  });

  describe('getCategoryDisplay', () => {
    it('returns emoji and label for valid category', () => {
      expect(getCategoryDisplay('Спорт')).toBe('⚽ Спорт');
      expect(getCategoryDisplay('Култура')).toBe('🎭 Култура');
    });

    it('returns default display for invalid category', () => {
      expect(getCategoryDisplay('invalid')).toBe('❓ Други');
    });
  });

  describe('formatEventPrice', () => {
    it('formats price correctly', () => {
      expect(formatEventPrice(0)).toBe('Безплатно');
      expect(formatEventPrice(50)).toBe('50 лв.');
      expect(formatEventPrice(100)).toBe('100 лв.');
    });

    it('handles decimal prices', () => {
      expect(formatEventPrice(25.5)).toBe('25.5 лв.');
    });

    it('handles null and undefined', () => {
      expect(formatEventPrice(null)).toBe('Безплатно');
      expect(formatEventPrice(undefined)).toBe('Безплатно');
    });
  });
});

