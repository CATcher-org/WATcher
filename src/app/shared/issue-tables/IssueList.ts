import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, merge, Observable, Subscription } from 'rxjs';
import { Issue } from '../../core/models/issue.model';
import { applyDropdownFilter, DEFAULT_DROPDOWN_FILTER, DropdownFilter } from './dropdownfilter';
import { FilterableSource } from './filterableTypes';
import { paginateData } from './issue-paginator';
import { getSortedData } from './issue-sorter';
import { TABLE_COLUMNS } from './issue-tables-columns';
import { searchFilter } from './search-filter';

/**
 * IssueList is similar to IssueDataTable but instead of listening to issueService,
 * it will listen to for changes in a list of issues instead.
 * This is useful for when you want to manage a list of issues that could have been filtered from issueService.
 */
export class IssueList extends DataSource<Issue> implements FilterableSource {
  readonly DISPLAYEDCOLUMN = [TABLE_COLUMNS.ID, TABLE_COLUMNS.TITLE, TABLE_COLUMNS.ASSIGNEE, TABLE_COLUMNS.LABEL];
  private observableIssues = new BehaviorSubject<Issue[]>([]);
  private _dropdownFilter = new BehaviorSubject<DropdownFilter>(DEFAULT_DROPDOWN_FILTER);
  private _searchFilter = new BehaviorSubject<string>('');
  private issueSubscription: Subscription;
  public count = 0;

  constructor(private issues$: BehaviorSubject<Issue[]>, private sort: MatSort, private paginator: MatPaginator) {
    super();
  }

  connect(): Observable<Issue[]> {
    return this.observableIssues.asObservable();
  }

  disconnect(): void {
    this._dropdownFilter.complete();
    this._searchFilter.complete();
    this.observableIssues.complete();
    this.issueSubscription.unsubscribe();
  }

  get dropdownFilter(): DropdownFilter {
    return this._dropdownFilter.value;
  }

  set dropdownFilter(newFilter: DropdownFilter) {
    this._dropdownFilter.next(newFilter);
  }

  get filter(): string {
    return this._searchFilter.value;
  }

  set filter(newFilter: string) {
    this._searchFilter.next(newFilter);
  }

  loadData(): void {
    const displayDataChanges = [this.issues$, this.paginator?.page, this.sort?.sortChange, this._dropdownFilter, this._searchFilter].filter(
      (x) => x !== undefined
    );

    this.issueSubscription = merge(...displayDataChanges).subscribe(() => {
      let data = this.issues$.getValue();
      this.count = data.length;
      data = data.filter(searchFilter(this.filter, this.DISPLAYEDCOLUMN));
      data = data.filter(applyDropdownFilter(this.dropdownFilter));
      if (this.sort) {
        data = getSortedData(this.sort, data);
      }
      if (this.paginator) {
        data = paginateData(this.paginator, data);
      }
      this.observableIssues.next(data);
    });
  }
}
