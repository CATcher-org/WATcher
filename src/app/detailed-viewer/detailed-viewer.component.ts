import { Component, OnInit } from '@angular/core';
import { GithubService } from '../core/services/github.service';
import { LoggingService } from '../core/services/logging.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GithubUser } from '../core/models/github-user.model';
import { IssueService } from '../core/services/issue.service';
import { IssuesDataTable } from '../shared/issue-tables/IssuesDataTable';

@Component({
  selector: 'app-detailed-viewer',
  templateUrl: './detailed-viewer.component.html',
  styleUrls: ['./detailed-viewer.component.css']
})
export class DetailedViewerComponent implements OnInit {
  public user: GithubUser = undefined;
  issues: IssuesDataTable;
  public username: string;

  constructor(
    public githubService: GithubService,
    private route: ActivatedRoute,
    private issueService: IssueService,
    private router: Router,
    private logger: LoggingService
  ) {}

  ngOnInit() {
    if (this.route.snapshot.paramMap.get('name') === undefined) {
      this.logger.info('detailed-viewer: Missing username');
      this.router.navigate[''];
    }
    this.initialize();
  }

  private initialize() {
    this.username = this.route.snapshot.paramMap.get('name');
    // this.user = this.issueService
  }
}
