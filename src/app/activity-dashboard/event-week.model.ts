import * as moment from 'moment';
import { EventType, GithubEvent } from '../core/models/github/github-event.model';

/**
 * Represents one week of GithubEvents. An aggregation of GithubEvents.
 */
export class EventWeek {
  /** Start date of the week, usually a Sunday */
  date_start: string;

  /** GithubEvents that make up this EventWeek */
  events: GithubEvent[];

  // Derived data
  issue_count: number;
  pr_count: number;
  comment_count: number;

  /** Not used, may be used in future to display avatar image. */
  actor?: {
    login: string;
    avatar_url?: string; // user avatar image url
  };

  private constructor(eventWeek: {}) {
    Object.assign(this, eventWeek);
    this.date_start = moment(eventWeek['date_start']).format('D/M');
  }

  /** An empty EventWeek with a custom start date. */
  private static empty(dateStart: string) {
    return new EventWeek({
      date_start: dateStart,
      events: [],
      issue_count: 0,
      pr_count: 0,
      comment_count: 0
    });
  }

  /**
   * Creates an EventWeek instance.
   * @param dateStart First date of week
   * @param githubEvents List of events in that week
   * @returns EventWeek instance
   */
  public static of(dateStart: string, githubEvents: GithubEvent[]): EventWeek {
    if (githubEvents.length <= 0) {
      return EventWeek.empty(dateStart);
    }

    const counts = EventWeek.count(githubEvents);

    return new EventWeek({
      date_start: dateStart,
      events: githubEvents,
      issue_count: counts.issue,
      pr_count: counts.pr,
      comment_count: counts.comment
    });
  }

  /** Counts total number of issues, prs and comments of array of Github events. */
  public static count(githubEvents: GithubEvent[]): { issue: number; pr: number; comment: number } {
    const counts = { issue: 0, pr: 0, comment: 0 };

    githubEvents.forEach((githubEvent) => {
      switch (githubEvent.type) {
        case EventType.IssuesEvent: {
          counts.issue++;
          break;
        }
        case EventType.PullRequestEvent: {
          counts.pr++;
          break;
        }
        case EventType.IssueCommentEvent:
        case EventType.PullRequestReviewEvent:
        case EventType.PullRequestReviewCommentEvent: {
          counts.comment++;
          break;
        }
        default: {
          break;
        }
      }
    });

    return counts;
  }
}
