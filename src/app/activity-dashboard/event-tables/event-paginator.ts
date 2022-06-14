import { MatPaginator } from '@angular/material';
import { GithubEvent } from '../../core/models/github/github-event.model';

export function paginateData(paginator: MatPaginator, data: GithubEvent[]): GithubEvent[] {
  paginator.length = data.length;
  let result = getDataForPage(paginator.pageIndex, paginator.pageSize, data);
  if (result.length === 0) {
    paginator.pageIndex -= 1;
    result = getDataForPage(paginator.pageIndex, paginator.pageSize, data);
  }
  return result;
}

function getDataForPage(pageIndex: number, pageSize: number, data: GithubEvent[]): GithubEvent[] {
  const startIndex = pageIndex * pageSize;
  return data.splice(startIndex, pageSize);
}
