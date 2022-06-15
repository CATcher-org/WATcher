import { DataSource } from '@angular/cdk/table';
import { MatPaginator, MatSort } from '@angular/material';
import * as moment from 'moment';
import { BehaviorSubject, merge, Observable, Subscription } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { GithubUser } from '../../core/models/github-user.model';
import { GithubEvent } from '../../core/models/github/github-event.model';
import { GithubEventService } from '../../core/services/githubevent.service';
import { EventWeek } from '../event-week.model';
import { paginateData } from './event-paginator';

export class GithubEventDataTable extends DataSource<EventWeek> {
  private eventsSubject = new BehaviorSubject<EventWeek[]>([]);
  private eventSubscription: Subscription;

  public isLoading$ = this.githubEventService.isLoading.asObservable();

  constructor(
    private githubEventService: GithubEventService,
    private sort: MatSort,
    private paginator: MatPaginator,
    private actor?: GithubUser,
    private defaultFilter?: (event: GithubEvent) => boolean
  ) {
    super();
  }

  connect(): Observable<EventWeek[]> {
    return this.eventsSubject.asObservable();
  }

  disconnect() {
    this.eventsSubject.complete();
    this.eventSubscription.unsubscribe();
  }

  /** Group GithubEvents[] week by week */
  groupByWeeks(githubEvents: GithubEvent[]): EventWeek[] {
    // const endDate = moment();  // now
    const startDate = moment().subtract(1, 'month').startOf('day'); // to pass in as argument?
    let loopDate = moment(startDate).day('Sunday');
    const eventWeeks = [];
    let eventsInAWeek = [];
    let weekNum = 1;

    githubEvents.forEach((githubEvent) => {
      console.log(weekNum);
      weekNum++;
      console.log(loopDate.format('ll'));
      const eventDate = moment(githubEvent.created_at);
      console.log(eventDate.format('ll'));
      if (loopDate.isAfter(eventDate)) {
        // event in earlier week
      } else if (loopDate.clone().add(7, 'days').isAfter(eventDate) && loopDate.isBefore(eventDate)) {
        // event in this week
        eventsInAWeek.push(githubEvent);
      } else {
        // event in later week
        eventWeeks.push(EventWeek.of(loopDate.format('ll'), eventsInAWeek)); // push previous week
        eventsInAWeek = [];
        loopDate = loopDate.add(7, 'days');

        // Empty weeks if any
        while (loopDate.clone().add(7, 'days').isBefore(eventDate)) {
          eventWeeks.push(EventWeek.of(loopDate.format('ll'), []));
          loopDate = loopDate.add(7, 'days');
        }

        console.assert(loopDate.clone().add(7, 'days').isAfter(eventDate) && loopDate.isBefore(eventDate));
        eventsInAWeek.push(githubEvent);
      }
    });

    eventWeeks.push(EventWeek.of(loopDate.format('ll'), eventsInAWeek)); // push final week

    return eventWeeks;
  }

  loadEvents() {
    // If no pagination and sorting
    let sortChange;
    if (this.sort !== undefined) {
      sortChange = this.sort.sortChange;
    }

    let page;
    if (this.paginator !== undefined) {
      page = this.paginator.page;
    }

    const displayDataChanges = [page, sortChange].filter((x) => x !== undefined);

    this.githubEventService.pollEvents();
    console.log('log');
    this.githubEventService.events$.subscribe((x) => console.log(x));
    this.eventSubscription = this.githubEventService.events$
      .pipe(
        flatMap(() => {
          // merge creates an observable from values that changes display
          return merge(...displayDataChanges).pipe(
            // maps each change in display value to new event ordering or filtering
            map(() => {
              let data = <GithubEvent[]>Object.values(this.githubEventService.events$.getValue()).reverse();
              if (this.defaultFilter) {
                data = data.filter(this.defaultFilter);
              }
              // Filter by actor of event
              if (this.actor) {
                data = data.filter((githubEvent) => {
                  if (!githubEvent.actor) {
                    return false;
                  } else {
                    return githubEvent.actor.login === this.actor.login;
                  }
                });
              }

              let weekData = this.groupByWeeks(data);

              if (this.paginator !== undefined) {
                weekData = paginateData(this.paginator, weekData);
              }

              console.log('Pipe Data:');
              console.log(weekData);
              return weekData;
            })
          );
        })
      )
      .subscribe((data) => {
        console.log('Subscribe Data:');
        console.log(data);
        this.eventsSubject.next(data);
      });
  }
}
