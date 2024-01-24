import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { GithubUser } from '../../core/models/github-user.model';
import { Issue } from '../../core/models/issue.model';
import { IssueService } from '../../core/services/issue.service';
import { FilterableComponent, FilterableSource } from '../../shared/issue-tables/filterableTypes';
import { FiltersStore } from '../../shared/issue-tables/FiltersStore';
import { IssuesDataTable } from '../../shared/issue-tables/IssuesDataTable';

@Component({
  selector: 'app-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.css']
})

/**
 * Displays issues as Cards.
 */
export class CardViewComponent implements OnInit, AfterViewInit, OnDestroy, FilterableComponent {
  @Input() headers: string[];
  @Input() assignee?: GithubUser = undefined;
  @Input() filters?: any = undefined;
  @Input() sort?: MatSort = undefined;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  issues: IssuesDataTable;
  issues$: Observable<Issue[]>;

  constructor(public issueService: IssueService) {}

  ngOnInit() {
    this.issues = new IssuesDataTable(this.issueService, this.sort, this.paginator, this.headers, this.assignee, this.filters);
    this.issues.dropdownFilter = FiltersStore.getInitialDropdownFilter();
    this.issues.filter = FiltersStore.getInitialSearchFilter();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.issues.loadIssues();
      this.issues$ = this.issues.connect();
    });
  }

  ngOnDestroy(): void {
    setTimeout(() => {
      this.issues.disconnect();
    });
  }

  retrieveFilterable(): FilterableSource {
    return this.issues;
  }
}
