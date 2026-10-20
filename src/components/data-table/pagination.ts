export function getPaginationState(
  page: number,
  pageSize: number,
  itemCount: number,
) {
  const pageCount = Math.max(1, Math.ceil(itemCount / pageSize));
  const activePage = Math.min(Math.max(1, page), pageCount);
  const startIndex = (activePage - 1) * pageSize;
  const pageNumbers = [
    ...new Set([1, activePage - 1, activePage, activePage + 1, pageCount]),
  ]
    .filter((number) => number >= 1 && number <= pageCount)
    .sort((left, right) => left - right);

  return {
    pageCount,
    activePage,
    startIndex,
    startItem: itemCount ? startIndex + 1 : 0,
    endItem: Math.min(startIndex + pageSize, itemCount),
    pageNumbers,
  };
}
