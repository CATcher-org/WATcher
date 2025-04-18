import { MatPaginator } from '@angular/material/paginator';

export function paginateData<T>(paginator: MatPaginator, data: T[]): T[] {
  paginator.length = data.length;
  let result = getDataForPage(paginator.pageIndex, paginator.pageSize, data);
  if (result.length === 0) {
    paginator.pageIndex -= 1;
    result = getDataForPage(paginator.pageIndex, paginator.pageSize, data);
  }
  return result;
}

function getDataForPage<T>(pageIndex: number, pageSize: number, data: T[]): T[] {
  const startIndex = pageIndex * pageSize;
  return data.splice(startIndex, pageSize);
}
