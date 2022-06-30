import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { MatSort } from '@angular/material';
import { BehaviorSubject, Subscription } from 'rxjs';
import { GithubUser } from '../core/models/github-user.model';
import { GithubService } from '../core/services/github.service';
import { PermissionService } from '../core/services/permission.service';
import { UserService } from '../core/services/user.service';
import { TABLE_COLUMNS } from '../shared/issue-tables/issue-tables-columns';
import { ACTION_BUTTONS, IssueTablesComponent } from '../shared/issue-tables/issue-tables.component';
import { DEFAULT_DROPDOWN_FILTER, DropdownFilter } from '../shared/issue-tables/IssuesDataTable';
import { CardViewComponent } from './card-view/card-view.component';
import { CircleGraphComponent } from './circle-graph/circle-graph.component';

export enum ViewMode {
  Table,
  Cards
}

@Component({
  selector: 'app-issues-viewer',
  templateUrl: './issues-viewer.component.html',
  styleUrls: ['./issues-viewer.component.css']
})
export class IssuesViewerComponent implements OnInit, AfterContentInit, AfterContentChecked, OnDestroy {
  readonly Views = ViewMode; // for use in html
  readonly displayedColumns = [TABLE_COLUMNS.ID, TABLE_COLUMNS.TITLE, TABLE_COLUMNS.ASSIGNEE, TABLE_COLUMNS.LABEL];
  readonly actionButtons: ACTION_BUTTONS[] = [ACTION_BUTTONS.DELETE_ISSUE, ACTION_BUTTONS.FIX_ISSUE];

  // For circles
  readonly colors = ['blue', 'red', 'yellow', 'green', 'purple', 'black'];

  assignees: GithubUser[];
  currentView: ViewMode = ViewMode.Cards;
  dropdownFilter: DropdownFilter = DEFAULT_DROPDOWN_FILTER;
  labelFilter$ = new BehaviorSubject<string[]>([]);
  labelFilterSubscription: Subscription;

  @ViewChildren(IssueTablesComponent) tables: QueryList<IssueTablesComponent>;
  @ViewChildren(CircleGraphComponent) circleGraph: QueryList<CircleGraphComponent>;
  @ViewChildren(CardViewComponent) cardViews: QueryList<CardViewComponent>;
  @ViewChild(MatSort, { static: true }) matSort: MatSort;

  constructor(public permissions: PermissionService, public userService: UserService, public githubService: GithubService) {}

  ngOnInit() {
    this.githubService.getUsersAssignable().subscribe((x) => (this.assignees = x));
  }

  ngAfterContentInit(): void {
    console.log(this.labelFilter$);
    this.labelFilter$.subscribe((labels) => {
      console.log('this doesnt work');
      this.dropdownFilter.labels = labels;
      this.applyDropdownFilter();
    });
    this.labelFilterSubscription = this.labelFilter$.subscribe((labels) => {
      console.log('this works');
    });
  }

  ngAfterContentChecked(): void {
    console.log(this.labelFilter$);
  }

  ngOnDestroy(): void {
    this.labelFilterSubscription.unsubscribe();
  }

  applyFilter(filterValue: string) {
    this.tables.forEach((t) => (t.issues.filter = filterValue));
    this.circleGraph.forEach((g) => (g.issues.filter = filterValue));
    this.cardViews.forEach((v) => (v.issues.filter = filterValue));
  }

  applyDropdownFilter() {
    this.tables.forEach((t) => (t.issues.dropdownFilter = this.dropdownFilter));
    this.circleGraph.forEach((g) => (g.issues.dropdownFilter = this.dropdownFilter));
    this.cardViews.forEach((v) => (v.issues.dropdownFilter = this.dropdownFilter));
  }
}
