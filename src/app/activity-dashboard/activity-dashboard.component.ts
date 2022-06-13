import { Component, OnInit } from '@angular/core';
import { GithubService } from '../core/services/github.service';
import { Observable } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { GithubEventService } from '../core/services/githubevent.service';

@Component({
  selector: 'app-activity-dashboard',
  templateUrl: './activity-dashboard.component.html',
  styleUrls: ['./activity-dashboard.component.css']
})
export class ActivityDashboardComponent implements OnInit {
  log: any;
  count: any = 0;
  actor: string = 'gycgabriel'; // TODO get from assignees
  issueCount: number = 0;
  prCount: number = 0;
  commentCount: number = 0;

  constructor(private githubService: GithubService, private githubEventService: GithubEventService) {}

  ngOnInit() {
    this.print();
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
