import { MatPaginator } from '@angular/material';
import { GithubEvent } from '../../core/models/github/github-event.model';
import { EventWeek } from '../event-week.model';

export function paginateData(paginator: MatPaginator, data: EventWeek[]): EventWeek[] {
  paginator.length = data.length;
  let result = getDataForPage(paginator.pageIndex, paginator.pageSize, data);
  if (result.length === 0) {
    paginator.pageIndex -= 1;
    result = getDataForPage(paginator.pageIndex, paginator.pageSize, data);
  }
  return result;
}

function getDataForPage(pageIndex: number, pageSize: number, data: EventWeek[]): EventWeek[] {
  const startIndex = pageIndex * pageSize;
  return data.splice(startIndex, pageSize);
}
