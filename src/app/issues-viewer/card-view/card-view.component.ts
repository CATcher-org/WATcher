import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { GithubUser } from '../../core/models/github-user.model';
import { Issue } from '../../core/models/issue.model';
import { IssueService } from '../../core/services/issue.service';
import { IssuesDataTable } from '../../shared/issue-tables/IssuesDataTable';
import { Router } from '@angular/router';
import { LoggingService } from 'src/app/core/services/logging.service';

@Component({
  selector: 'app-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.css']
})

/**
 * Displays issues as Cards.
 */
export class CardViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() headers: string[];
  @Input() assignee?: GithubUser = undefined;
  @Input() filters?: any = undefined;
  @Input() sort?: MatSort = undefined;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  issues: IssuesDataTable;
  issues$: Observable<Issue[]>;

  constructor(public issueService: IssueService, private logger: LoggingService, private router: Router) {}

  ngOnInit() {
    this.issues = new IssuesDataTable(this.issueService, this.sort, this.paginator, this.headers, this.assignee, this.filters);
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
  viewUserInBrowser() {
    console.log(this.assignee);
    this.logger.info(`CardViewComponent: Open user ${this.assignee.login} in browser`);

    this.router.navigate(['/user', this.assignee.login]);
  }
}
