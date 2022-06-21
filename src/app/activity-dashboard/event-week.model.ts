import * as moment from 'moment';
import { GithubEvent } from '../core/models/github/github-event.model';

export class EventWeek {
  date_start: string;
  events: GithubEvent[];
  issue_count: number;
  pr_count: number;
  comment_count: number;

  actor?: {
    id: number;
    login: string;
    url: string; // e.g. https://api.github.com/users/USER_LOGIN
    avatar_url: string; // user avatar image url
  };

  constructor(eventWeek: {}) {
    Object.assign(this, eventWeek);
    this.date_start = moment(eventWeek['date_start']).format('D/M');
  }

  public static of(dateStart: string, githubEvents: GithubEvent[]): EventWeek {
    if (githubEvents.length <= 0) {
      return new EventWeek({
        date_start: dateStart,
        events: githubEvents,
        issue_count: 0,
        pr_count: 0,
        comment_count: 0
      });
    }

    let issueCount = 0;
    let prCount = 0;
    let commentCount = 0;
    githubEvents.forEach((githubEvent) => {
      switch (githubEvent.type) {
        case 'IssuesEvent': {
          // TODO enum
          issueCount++;
          break;
        }
        case 'PullRequestEvent': {
          prCount++;
          break;
        }
        case 'IssueCommentEvent':
        case 'PullRequestReviewEvent':
        case 'PullRequestReviewCommentEvent': {
          commentCount++;
          break;
        }
        default: {
          break;
        }
      }
    });

    return new EventWeek({
      date_start: dateStart,
      events: githubEvents,
      issue_count: issueCount,
      pr_count: prCount,
      comment_count: commentCount
    });
  }
}
