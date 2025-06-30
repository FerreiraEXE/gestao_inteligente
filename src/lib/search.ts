import { SearchParams, PaginatedResponse } from '@/types';

/**
 * Generic search utility for filtering, sorting and paginating in-memory arrays.
 * @param items Array of items to search
 * @param params Search parameters (page, limit, sort, order, etc.)
 * @param filterFn Function that receives an item and returns true if it should be kept
 * @param sortableFields List of fields allowed for sorting (supports nested fields via dot notation)
 */
export function searchArray<T>(
  items: T[],
  params: SearchParams,
  filterFn: (item: T) => boolean,
  sortableFields: string[]
): PaginatedResponse<T> {
  const {
    page = 1,
    limit = 10,
    sort = sortableFields[0] ?? '',
    order = 'asc',
  } = params;

  // Filter items using provided callback
  let results = items.filter(filterFn);

  const getValue = (obj: any, path: string) =>
    path.split('.').reduce((o, key) => (o ? o[key] : undefined), obj);

  // Sort if field is allowed
  if (sort && sortableFields.includes(sort)) {
    results.sort((a, b) => {
      let valueA: any = getValue(a, sort);
      let valueB: any = getValue(b, sort);

      // Handle date strings
      if (typeof valueA === 'string' && !isNaN(Date.parse(valueA))) {
        valueA = new Date(valueA).getTime();
      }
      if (typeof valueB === 'string' && !isNaN(Date.parse(valueB))) {
        valueB = new Date(valueB).getTime();
      }

      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();

      if (valueA > valueB) {
        return order === 'asc' ? 1 : -1;
      }
      if (valueA < valueB) {
        return order === 'asc' ? -1 : 1;
      }
      return 0;
    });
  }

  // Pagination
  const totalItems = results.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const paginated = results.slice(startIndex, startIndex + limit);

  return {
    data: paginated,
    total: totalItems,
    page,
    limit,
    totalPages,
  };
}

export default searchArray;
