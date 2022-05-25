import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GithubUser } from '../../core/models/github-user.model';
import { Issue } from '../../core/models/issue.model';
import { IssueService } from '../../core/services/issue.service';
import { TABLE_COLUMNS } from '../../shared/issue-tables/issue-tables-columns';
import { IssuesDataTable } from '../../shared/issue-tables/IssuesDataTable';

@Component({
  selector: 'app-circle-graph',
  templateUrl: './circle-graph.component.html',
  styleUrls: ['./circle-graph.component.css']
})
export class CircleGraphComponent implements OnInit {
  @Input() assignee?: GithubUser = undefined;
  @Input() headers: string[];
  @Input() filters?: any = undefined;
  @Input() color?: string;

  issues: IssuesDataTable;
  issues$: Observable<Issue[]>;

  constructor(public issueService: IssueService) {}

  ngOnInit() {
    this.issues = new IssuesDataTable(this.issueService, undefined, undefined, this.headers, this.assignee, this.filters);
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
}
