import { BehaviorSubject, merge, Observable } from 'rxjs';
import { Issue } from '../../core/models/issue.model';
import { DataSource } from '@angular/cdk/collections';
import { searchFilter } from './search-filter';
import { TABLE_COLUMNS } from './issue-tables-columns';
import { DEFAULT_DROPDOWN_FILTER, DropdownFilter, applyDropdownFilter } from './dropdownfilter';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { map } from 'rxjs/operators';

/**
 * Class similar to IssueDataTable but instead of listening to issueService,
 * it will listen to an observable instead
 */
export class IssueList extends DataSource<Issue> {
  readonly DISPLAYEDCOLUMN = [TABLE_COLUMNS.ID, TABLE_COLUMNS.TITLE, TABLE_COLUMNS.ASSIGNEE, TABLE_COLUMNS.LABEL];
  private issues: Issue[];
  private observableIssues = new BehaviorSubject<Issue[]>([]);
  private _dropdownFilter = new BehaviorSubject<DropdownFilter>(DEFAULT_DROPDOWN_FILTER);
  private _searchFilter = new BehaviorSubject<string>('');
  public count = 0;

  constructor(private issues$: BehaviorSubject<Issue[]>, private sort: MatSort, private paginator: MatPaginator) {
    super();
  }

  loadIssue() {
    this.issues$.subscribe((items) => {
      this.issues = items;
      this.count = items.length;
    });
  }

  connect(): Observable<Issue[] | readonly Issue[]> {
    return this.observableIssues.asObservable();
  }
  disconnect(): void {
    this.observableIssues.complete();
  }

  get dropdownFilter(): DropdownFilter {
    return this._dropdownFilter.value;
  }

  set dropdownFilter(newFilter: DropdownFilter) {
    this._dropdownFilter.next(newFilter);
  }

  get searchFilter(): string {
    return this._searchFilter.value;
  }

  set searchFilter(newFilter: string) {
    this._searchFilter.next(newFilter);
  }

  initialize(): void {
    const displayDataChanges = [this.issues$, this.paginator?.page, this.sort?.sortChange, this._dropdownFilter, this._searchFilter].filter(
      (x) => x !== undefined
    );

    merge(...displayDataChanges).subscribe(() => {
      let data = this.issues$.getValue();
      data = data.filter(searchFilter(this.searchFilter, this.DISPLAYEDCOLUMN)).filter(applyDropdownFilter(this.dropdownFilter));
    });
  }
}
