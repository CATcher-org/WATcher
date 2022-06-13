import { DataSource } from '@angular/cdk/table';
import { MatPaginator, MatSort } from '@angular/material';
import { BehaviorSubject, merge, Observable, Subscription } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { GithubUser } from '../core/models/github-user.model';
import { GithubEvent } from '../core/models/github/github-event.model';
import { GithubEventService } from '../core/services/githubevent.service';

export class GithubEventDataTable extends DataSource<GithubEvent> {
  private eventsSubject = new BehaviorSubject<GithubEvent[]>([]);
  private eventSubscription: Subscription;

  constructor(
    private githubEventService: GithubEventService,
    private sort: MatSort,
    private paginator: MatPaginator,
    private displayedColumn: string[],
    private actor?: GithubUser,
    private defaultFilter?: (event: GithubEvent) => boolean
  ) {
    super();
  }

  connect(): Observable<GithubEvent[]> {
    return this.eventsSubject.asObservable();
  }

  disconnect() {
    this.eventsSubject.complete();
    this.eventSubscription.unsubscribe();
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
              return data;
            })
          );
        })
      )
      .subscribe((githubEvents) => {
        this.eventsSubject.next(githubEvents);
      });
  }
}
