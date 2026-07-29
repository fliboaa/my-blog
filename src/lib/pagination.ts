/**
 * 列表页通用分页工具 —— 解析 searchParams.page、处理非法值（NaN/越界）、切片。
 * 两个列表页（/articles、/categories/[tag]）共用，避免分页逻辑 + NaN 防御重复散落。
 */
export type PaginationResult<T> = {
  items: T[];
  curPage: number;
  totalPages: number;
};

export function paginate<T>(
  items: T[],
  pageParam: string | undefined,
  pageSize: number,
): PaginationResult<T> {
  const parsed = parseInt(pageParam ?? "1", 10);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const curPage = Math.min(
    totalPages,
    Math.max(1, Number.isNaN(parsed) ? 1 : parsed),
  );
  const start = (curPage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    curPage,
    totalPages,
  };
}
