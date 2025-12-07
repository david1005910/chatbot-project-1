import { cn, formatKRW, formatNumber, formatDate, formatPercent, generateId, debounce } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn (classnames)', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', { active: true, disabled: false });
      expect(result).toContain('base');
      expect(result).toContain('active');
      expect(result).not.toContain('disabled');
    });

    it('should handle undefined values', () => {
      const result = cn('base', undefined, null, 'end');
      expect(result).toBe('base end');
    });
  });

  describe('formatKRW', () => {
    it('should format numbers as Korean Won', () => {
      const result = formatKRW(10000);
      expect(result).toContain('10,000');
      expect(result).toContain('원');
    });

    it('should handle zero', () => {
      const result = formatKRW(0);
      expect(result).toContain('0');
    });

    it('should handle negative numbers', () => {
      const result = formatKRW(-5000);
      expect(result).toContain('-');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with thousand separators', () => {
      const result = formatNumber(1000000);
      expect(result).toBe('1,000,000');
    });

    it('should handle decimals', () => {
      const result = formatNumber(1234.56);
      expect(result).toContain('1,234');
    });
  });

  describe('formatDate', () => {
    it('should format date strings', () => {
      const result = formatDate('2024-01-15');
      expect(result).toMatch(/2024/);
    });

    it('should format Date objects', () => {
      const date = new Date('2024-06-15');
      const result = formatDate(date);
      expect(result).toMatch(/2024/);
    });
  });

  describe('formatPercent', () => {
    it('should format numbers as percentages', () => {
      const result = formatPercent(0.1234);
      expect(result).toContain('%');
    });

    it('should handle whole numbers', () => {
      const result = formatPercent(25);
      expect(result).toContain('25');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with prefix', () => {
      const id = generateId('test');
      expect(id).toMatch(/^test-/);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
