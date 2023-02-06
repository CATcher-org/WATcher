import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { Observable } from 'rxjs';
import { GithubUser } from '../../core/models/github-user.model';
import { Issue } from '../../core/models/issue.model';
import { GithubService } from '../../core/services/github.service';
import { IssueService } from '../../core/services/issue.service';
import { LoggingService } from '../../core/services/logging.service';
import { IssuesDataTable } from '../../shared/issue-tables/IssuesDataTable';
import { LabelService } from '../../core/services/label.service';

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

  constructor(
    private githubService: GithubService,
    public issueService: IssueService,
    public labelService: LabelService,
    private logger: LoggingService
  ) {}

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

  /**
   * Formats the title text to account for those that contain long words.
   * @param title - Title of Issue that is to be displayed in the Table Row.
   */
  fitTitleText(title: string): string {
    // Arbitrary Length of Characters beyond which an overflow occurs.
    const MAX_WORD_LENGTH = 43;
    const SPLITTER_TEXT = ' ';
    const ELLIPSES = '...';

    return title
      .split(SPLITTER_TEXT)
      .map((word) => {
        if (word.length > MAX_WORD_LENGTH) {
          return word.substring(0, MAX_WORD_LENGTH - 5).concat(ELLIPSES);
        }
        return word;
      })
      .join(SPLITTER_TEXT);
  }

  /** Opens issue in new window */
  viewIssueInBrowser(id: number, event: Event) {
    this.logger.info(`CardViewComponent: Opening Issue ${id} on Github`);
    this.githubService.viewIssueInBrowser(id, event);
  }

  /** Returns status color for issue */
  getIssueOpenOrCloseColor(issue: Issue) {
    return issue.state === 'OPEN' ? 'green' : 'purple';
  }

  /** Returns CSS class for border color */
  getIssueOpenOrCloseColorCSSClass(issue: Issue) {
    return issue.state === 'OPEN' ? 'border-green' : 'border-purple';
  }

  /**
   * Returns corresponding Github icon identifier for issue to display.
   * @param issue Issue to display
   * @returns string to create icon
   */
  getOcticon(issue: Issue) {
    const type = issue.issueOrPr;
    const state = issue.state;

    switch (true) {
      case type === 'Issue' && state === 'OPEN': {
        return 'issue-opened';
      }
      case type === 'Issue' && state === 'CLOSED': {
        return 'issue-closed';
      }
      case type === 'PullRequest' && state === 'OPEN': {
        return 'git-pull-request';
      }
      case type === 'PullRequest': {
        return 'git-merge';
      }
      default: {
        return 'circle'; // unknown type and state
      }
    }
  }

  /**
   * Truncates description to fit in card content.
   * @param description - Description of Issue that is to be displayed.
   */
  fitDescriptionText(description: string): string {
    // Arbitrary Length of Characters beyond which an overflow occurs.
    const MAX_CHARACTER_LENGTH = 72;
    const ELLIPSES = '...';

    return description.slice(0, MAX_CHARACTER_LENGTH) + ELLIPSES;
  }
}
