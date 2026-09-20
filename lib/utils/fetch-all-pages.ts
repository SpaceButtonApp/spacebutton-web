// Loads EVERY page of a paginated list endpoint. The list endpoints cap each
// request (the support ticket endpoint allows at most 100 per page), so a
// single request can never return everything — callers that asked for "page 1
// of 50" silently dropped every older item.

const CONCURRENT_PAGES = 4

export async function fetchAllPages<T extends { id: string }>(
  fetchPage: (page: number) => Promise<{ items: T[]; total: number }>,
  pageSize: number,
): Promise<{ items: T[]; total: number }> {
  const first = await fetchPage(1)
  const pageCount = Math.ceil(first.total / pageSize)

  const pages: T[][] = [first.items]
  // Remaining pages in small concurrent batches: faster than one-by-one,
  // without firing hundreds of requests at once for a very large list.
  for (let start = 2; start <= pageCount; start += CONCURRENT_PAGES) {
    const count = Math.min(CONCURRENT_PAGES, pageCount - start + 1)
    const batch = await Promise.all(Array.from({ length: count }, (_, i) => fetchPage(start + i)))
    for (const page of batch) pages.push(page.items)
  }

  // Items can shift between pages while the requests are in flight, so the
  // same one may appear twice — keep the first occurrence, preserving order.
  const seen = new Set<string>()
  const items: T[] = []
  for (const item of pages.flat()) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    items.push(item)
  }
  return { items, total: first.total }
}
