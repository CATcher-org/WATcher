import { Component, OnInit } from '@angular/core';
import { GithubUser } from '../core/models/github-user.model';
import { GithubService } from '../core/services/github.service';
import { GithubEventService } from '../core/services/githubevent.service';
import { TABLE_COLUMNS } from './event-tables/event-tables-columns';
import { ACTION_BUTTONS } from './event-tables/event-tables.component';
import { GithubEventDataTable } from './event-tables/GithubEventDataTable';

@Component({
  selector: 'app-activity-dashboard',
  templateUrl: './activity-dashboard.component.html',
  styleUrls: ['./activity-dashboard.component.css']
})
export class ActivityDashboardComponent implements OnInit {
  readonly displayedColumns = [TABLE_COLUMNS.ID, TABLE_COLUMNS.TITLE, TABLE_COLUMNS.DATE];
  readonly actionButtons: ACTION_BUTTONS[] = [ACTION_BUTTONS.VIEW_IN_WEB];

  assignees: GithubUser[];

  log: any;
  log2: any;
  count = 0;
  actor = 'gycgabriel'; // TODO get from assignees
  issueCount = 0;
  prCount = 0;
  commentCount = 0;

  constructor(private githubService: GithubService, private githubEventService: GithubEventService) {}

  ngOnInit() {
    this.githubEventService.getEvents();
    this.githubService.getUsersAssignable().subscribe((x) => (this.assignees = x));
  }

  print() {
    console.log('Print triggered');
    this.githubService.fetchEventsForRepo().subscribe((x) => {
      this.log = x;
    });
  }

  printE() {
    console.log('PrintE triggered');
    // this.githubService.fetchEventsForRepoCall(1).subscribe((x) => {
    //   this.log = x;
    // });
    this.counter();
  }

  counter() {
    this.issueCount = 0;
    this.prCount = 0;
    this.commentCount = 0;
    console.log('counter triggered');
    this.githubEventService.getEvents();
    this.githubEventService.events$.subscribe((y) => {
      this.log = y;
      y.forEach((event) => {
        if (event.actor.login === this.actor) {
          switch (event.type) {
            case 'IssuesEvent': {
              // TODO enum
              this.issueCount++;
              break;
            }
            case 'PullRequestEvent': {
              this.prCount++;
              break;
            }
            case 'IssueCommentEvent':
            case 'PullRequestReviewEvent':
            case 'PullRequestReviewCommentEvent': {
              this.commentCount++;
              break;
            }
          }
        }
      });
    });
  }
}
