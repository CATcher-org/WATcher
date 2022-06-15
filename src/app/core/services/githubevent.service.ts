import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, of, Subscription, timer } from 'rxjs';
import { catchError, exhaustMap, finalize, flatMap, map } from 'rxjs/operators';
import { GithubEvent } from '../models/github/github-event.model';
import { GithubService } from './github.service';
import { IssueService } from './issue.service';

@Injectable({
  providedIn: 'root'
})
export class GithubEventService {
  public events: Observable<GithubEvent[]>; // observable for events
  public events$: BehaviorSubject<GithubEvent[]>; // exposable for pipe/subscribe for other classes

  private eventsPollSubscription: Subscription;

  /** Whether the GithubEventService is downloading the data from Github */
  public isLoading = new BehaviorSubject<boolean>(false);

  private lastModified: string; // The timestamp when the title or label of an issue is changed
  private lastModifiedComment: string; // The timestamp when the comment of an issue is changed

  constructor(private githubService: GithubService, private issueService: IssueService) {
    this.events$ = new BehaviorSubject(new Array<GithubEvent>());
  }

  /**
   * Calls the Github service api to return the latest github event (e.g renaming an issue's title)
   * of current repository and store the timestamps of the event in this service
   */
  setLatestChangeEvent(): Observable<any> {
    return this.githubService.fetchEventsForRepo().pipe(
      map((response) => {
        if (response.length === 0) {
          return response;
        }
        this.setLastModifiedTime(response[0]['created_at']);
        this.setLastModifiedCommentTime(response[0]['issue']['updated_at']);
        return response;
      })
    );
  }

  /**
   * Returns the result whether the latest github event (e.g renaming an issue's title)
   * of current repository has been retrieved or not.
   * @returns true if the issues were fetched from GitHub.
   */
  reloadPage(): Observable<boolean> {
    return this.githubService.fetchEventsForRepo().pipe(
      flatMap((response: any[]) => {
        if (response.length === 0) {
          return of(false);
        }
        const eventResponse = response[0];
        // Will only allow page to reload if the latest modify time is different
        // from last modified, meaning that some changes to the repo has occured.
        if (eventResponse['created_at'] !== this.lastModified || eventResponse['issue']['updated_at'] !== this.lastModifiedComment) {
          this.setLastModifiedTime(eventResponse['created_at']);
          this.setLastModifiedCommentTime(eventResponse['issue']['updated_at']);
          return this.issueService.reloadAllIssues().pipe(map((response: any[]) => true));
        }
        return of(false);
      })
    );
  }

  private setLastModifiedTime(lastModified: string): void {
    this.lastModified = lastModified;
  }

  private setLastModifiedCommentTime(lastModified: string): void {
    this.lastModifiedComment = lastModified;
  }

  reset() {
    this.setLastModifiedTime(undefined);
    this.setLastModifiedCommentTime(undefined);
  }

  getEvents(): Observable<GithubEvent[]> {
    this.events$ = new BehaviorSubject(new Array<GithubEvent>());
    this.events = this.githubService.fetchAllEventsForRepo().pipe(
      map((eventArray) => eventArray.reduce((accumulator, value) => accumulator.concat(value), [])),
      map((eventArray) => eventArray.map((githubEvent) => new GithubEvent(githubEvent)))
    );
    this.events.subscribe((x) => {
      this.events$.next(x);
    });
    return this.events;
  }

  pollEvents() {
    if (this.eventsPollSubscription === undefined) {
      if (this.events$.getValue().length === 0) {
        this.isLoading.next(true);
      }
    }

    this.eventsPollSubscription = timer(0, IssueService.POLL_INTERVAL)
      .pipe(
        exhaustMap(() => {
          return this.getEvents().pipe(
            catchError(() => {
              return EMPTY;
            }),
            finalize(() => this.isLoading.next(false))
          );
        })
      )
      .subscribe();
  }
}
