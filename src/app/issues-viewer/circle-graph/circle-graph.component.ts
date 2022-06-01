import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { GithubUser } from '../../core/models/github-user.model';
import { Issue } from '../../core/models/issue.model';
import { TimelineItem } from '../../core/models/timeline-item.model';
import { IssueService } from '../../core/services/issue.service';
import { IssuesDataTable } from '../../shared/issue-tables/IssuesDataTable';

@Component({
  selector: 'app-circle-graph',
  templateUrl: './circle-graph.component.html',
  styleUrls: ['./circle-graph.component.css']
})
export class CircleGraphComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() assignee?: GithubUser = undefined;
  @Input() headers: string[];
  @Input() filters?: any = undefined;
  @Input() color?: string;

  issues: IssuesDataTable;
  issues$: Observable<Issue[]>;

  timelineData: TimelineItem[];
  timelineSubscription: Subscription;

  constructor(public issueService: IssueService) {}

  ngOnInit() {
    this.issues = new IssuesDataTable(this.issueService, undefined, undefined, this.headers, this.assignee, this.filters);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.issues.loadIssues();
      this.issues$ = this.issues.connect();
      this.updateTimeline();
    });
  }

  ngOnDestroy(): void {
    setTimeout(() => {
      this.issues.disconnect();
    });
  }

  updateTimeline() {
    // Create new observable of timeline data from issue observable
    this.timelineSubscription = this.issues$
      .pipe(
        map((issues) => {
          return issues.map(
            (issue) =>
              <TimelineItem>{
                times: [
                  { starting_time: Number(moment(issue.created_at).format('x')), ending_time: Number(moment(issue.updated_at).format('x')) }
                ],
                label: issue.title
              }
          );
        })
      )
      // Subscribe to changes of new observable
      .subscribe((data) => (this.timelineData = data));
  }

  disconnectTimeline() {
    this.timelineSubscription.unsubscribe();
  }
}
