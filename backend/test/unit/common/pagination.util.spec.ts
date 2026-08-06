import { clampPagination } from '../../../src/common/utils/pagination.util';

describe('pagination.util', () => {
  it('should default to page 1 and perPage 10', () => {
    const result = clampPagination();
    expect(result).toEqual({ page: 1, perPage: 10, skip: 0, take: 10 });
  });

  it('should clamp invalid page and perPage values', () => {
    const result = clampPagination(-5, 'abc');
    expect(result).toEqual({ page: 1, perPage: 10, skip: 0, take: 10 });
  });

  it('should calculate skip and take correctly', () => {
    const result = clampPagination(3, 20);
    expect(result).toEqual({ page: 3, perPage: 20, skip: 40, take: 20 });
  });

  it('should cap perPage to 100', () => {
    const result = clampPagination(2, 150);
    expect(result).toEqual({ page: 2, perPage: 100, skip: 100, take: 100 });
  });
});
