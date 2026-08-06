import { slugify, withUniqueSuffix } from '../../../src/common/utils/slug.util';

describe('slug.util', () => {
  describe('slugify', () => {
    it('should lowercase uppercase letters', () => {
      expect(slugify('TEST')).toBe('test');
    });

    it('should replace spaces and special characters', () => {
      expect(slugify('Rose Gold Saree!!')).toBe('rose-gold-saree');
    });

    it('should remove multiple dashes and leading/trailing dashes', () => {
      expect(slugify('---test---slug---')).toBe('test-slug');
    });

    it('should handle complex names', () => {
      expect(slugify('Royal Kanchipuram Silk Saree (Red)')).toBe('royal-kanchipuram-silk-saree-red');
    });
  });

  describe('withUniqueSuffix', () => {
    it('should append a 6-character suffix', () => {
      const slug = 'test-product';
      const result = withUniqueSuffix(slug);
      expect(result.startsWith('test-product-')).toBe(true);
      expect(result.length).toBe(slug.length + 1 + 6);
    });

    it('should generate different suffixes', () => {
      const slug = 'test';
      const result1 = withUniqueSuffix(slug);
      const result2 = withUniqueSuffix(slug);
      expect(result1).not.toBe(result2);
    });
  });
});
