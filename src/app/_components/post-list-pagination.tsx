type Props = {
  curPage: number;
  totalPages: number;
  baseHref: string;
};

export function PostListPagination({ curPage, totalPages, baseHref }: Props) {
  if (totalPages <= 1) return null;

  const href = (n: number) => (n === 1 ? baseHref : `${baseHref}?page=${n}`);

  return (
    <div className="pager">
      {curPage > 1 && (
        <a className="page-btn" href={href(curPage - 1)}>
          上一页
        </a>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <a
          key={n}
          className={`page-btn${n === curPage ? " active" : ""}`}
          href={href(n)}
        >
          {n}
        </a>
      ))}
      {curPage < totalPages && (
        <a className="page-btn" href={href(curPage + 1)}>
          下一页
        </a>
      )}
    </div>
  );
}
