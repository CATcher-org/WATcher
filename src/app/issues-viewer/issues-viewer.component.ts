import { Component, OnInit, ViewChild } from '@angular/core';
import { GithubUser } from '../core/models/github-user.model';
import { GithubService } from '../core/services/github.service';
import { PermissionService } from '../core/services/permission.service';
import { UserService } from '../core/services/user.service';
import { TABLE_COLUMNS } from '../shared/issue-tables/issue-tables-columns';
import { ACTION_BUTTONS, IssueTablesComponent } from '../shared/issue-tables/issue-tables.component';

@Component({
  selector: 'app-issues-viewer',
  templateUrl: './issues-viewer.component.html',
  styleUrls: ['./issues-viewer.component.css']
})
export class IssuesViewerComponent implements OnInit {
  readonly displayedColumns = [TABLE_COLUMNS.TITLE];
  readonly actionButtons: ACTION_BUTTONS[] = [ACTION_BUTTONS.DELETE_ISSUE, ACTION_BUTTONS.FIX_ISSUE];
  assignees: GithubUser[];

  @ViewChild(IssueTablesComponent, { static: true }) table: IssueTablesComponent;

  constructor(public permissions: PermissionService, public userService: UserService, public githubService: GithubService) {}

  ngOnInit() {
    this.githubService.getUsersAssignable().subscribe((x) => (this.assignees = x));
  }

  applyFilter(filterValue: string) {
    this.table.issues.filter = filterValue;
  }
}
