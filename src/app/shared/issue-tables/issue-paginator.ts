import { MatPaginator } from '@angular/material/paginator';
import { RepoItem } from '../../core/models/repo-item.model';

export function paginateData(paginator: MatPaginator, data: RepoItem[]): RepoItem[] {
  paginator.length = data.length;
  let result = getDataForPage(paginator.pageIndex, paginator.pageSize, data);
  if (result.length === 0) {
    paginator.pageIndex -= 1;
    result = getDataForPage(paginator.pageIndex, paginator.pageSize, data);
  }
  return result;
}

function getDataForPage(pageIndex: number, pageSize: number, data: RepoItem[]): RepoItem[] {
  const startIndex = pageIndex * pageSize;
  return data.splice(startIndex, pageSize);
}
