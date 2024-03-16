import { Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { GithubUser } from '../core/models/github-user.model';
import { GithubService } from '../core/services/github.service';
import { GithubEventService } from '../core/services/githubevent.service';
import { ViewService } from '../core/services/view.service';
import { EXPANDED_TABLE_COLUMNS, TABLE_COLUMNS } from './event-tables/event-tables-columns';
import { ACTION_BUTTONS, EventTablesComponent } from './event-tables/event-tables.component';

@Component({
  selector: 'app-activity-dashboard',
  templateUrl: './activity-dashboard.component.html',
  styleUrls: ['./activity-dashboard.component.css']
})
export class ActivityDashboardComponent implements OnInit, OnDestroy {
  readonly displayedColumns = [TABLE_COLUMNS.DATE_START, TABLE_COLUMNS.ISSUE_COUNT, TABLE_COLUMNS.PR_COUNT, TABLE_COLUMNS.COMMENT_COUNT];
  readonly expandedColumns = [EXPANDED_TABLE_COLUMNS.TITLE, EXPANDED_TABLE_COLUMNS.DATE];
  readonly actionButtons: ACTION_BUTTONS[] = [ACTION_BUTTONS.VIEW_IN_WEB];

  /** Observes for changes of repo*/
  repoChangeSubscription: Subscription;

  startMinDate: Date;
  startMaxDate = moment().endOf('day').toDate();
  endMinDate: Date;
  endMaxDate = moment().endOf('day').toDate();

  assignees: GithubUser[];

  @ViewChildren(EventTablesComponent) tables: QueryList<EventTablesComponent>;

  constructor(private githubService: GithubService, private githubEventService: GithubEventService, public viewService: ViewService) {
    this.repoChangeSubscription = this.viewService.repoChanged$.subscribe((newRepo) => {
      this.initialize();
    });
  }

  ngOnInit() {
    this.initialize();
  }

  ngOnDestroy(): void {
    this.repoChangeSubscription.unsubscribe();
  }

  private initialize(): void {
    this.githubEventService.getEvents();
    this.assignees = [];
    this.githubService.getUsersAssignable().subscribe((x) => {
      this.assignees = x;
    });
  }

  pickStartDate(event: MatDatepickerInputEvent<Date>) {
    this.endMinDate = event.value;
    this.tables.forEach((t) => (t.githubEvents.start = `${event.value}`));
  }

  pickEndDate(event: MatDatepickerInputEvent<Date>) {
    this.startMaxDate = event.value;
    this.tables.forEach((t) => (t.githubEvents.end = `${event.value}`));
  }
}
