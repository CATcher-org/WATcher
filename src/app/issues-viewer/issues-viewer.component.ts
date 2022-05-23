import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { GithubUser } from '../core/models/github-user.model';
import { GithubService } from '../core/services/github.service';
import { PermissionService } from '../core/services/permission.service';
import { UserService } from '../core/services/user.service';
import { TABLE_COLUMNS } from '../shared/issue-tables/issue-tables-columns';
import { ACTION_BUTTONS, IssueTablesComponent } from '../shared/issue-tables/issue-tables.component';
import { CardViewComponent } from './card-view/card-view.component';

export enum ViewMode {
  Table,
  Cards
}

@Component({
  selector: 'app-issues-viewer',
  templateUrl: './issues-viewer.component.html',
  styleUrls: ['./issues-viewer.component.css']
})
export class IssuesViewerComponent implements OnInit {
  readonly Views = ViewMode; // for use in html
  readonly displayedColumns = [TABLE_COLUMNS.TITLE];
  readonly actionButtons: ACTION_BUTTONS[] = [ACTION_BUTTONS.DELETE_ISSUE, ACTION_BUTTONS.FIX_ISSUE];
  assignees: GithubUser[];
  currentView: ViewMode = ViewMode.Cards;

  @ViewChildren(IssueTablesComponent) tables: QueryList<IssueTablesComponent>;
  @ViewChildren(CardViewComponent) cardViews: QueryList<CardViewComponent>;

  constructor(public permissions: PermissionService, public userService: UserService, public githubService: GithubService) {}

  ngOnInit() {
    this.githubService.getUsersAssignable().subscribe((x) => (this.assignees = x));
  }

  applyFilter(filterValue: string) {
    this.tables.forEach((t) => (t.issues.filter = filterValue));
    this.cardViews.forEach((v) => (v.issues.filter = filterValue));
  }
}
