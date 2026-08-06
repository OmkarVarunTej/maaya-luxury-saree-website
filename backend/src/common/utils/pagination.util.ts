export function clampPagination(page?: unknown, perPage?: unknown) {
  const parsedPage = typeof page === 'number' ? page : parseInt(page as string, 10);
  const parsedPerPage = typeof perPage === 'number' ? perPage : parseInt(perPage as string, 10);

  const clampedPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const clampedPerPage =
    isNaN(parsedPerPage) || parsedPerPage < 1
      ? 10
      : clampedPerPageVal(parsedPerPage);

  return {
    page: clampedPage,
    perPage: clampedPerPage,
    skip: (clampedPage - 1) * clampedPerPage,
    take: clampedPerPage,
  };
}

function clampedPerPageVal(val: number): number {
  return val > 100 ? 100 : val;
}
