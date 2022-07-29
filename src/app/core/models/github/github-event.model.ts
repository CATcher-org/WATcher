import * as moment from 'moment';

/** Types of GithubEvent */
export enum EventType {
  IssuesEvent = 'IssuesEvent',
  PullRequestEvent = 'PullRequestEvent',
  IssueCommentEvent = 'IssueCommentEvent',
  PullRequestReviewEvent = 'PullRequestReviewEvent',
  PullRequestReviewCommentEvent = 'PullRequestReviewCommentEvent'
}

/**
 * Represents a Github Event fetched from Github.
 * Also known as an activity on Activity Dashboard.
 */
export class GithubEvent {
  id: string; // Github's backend's id
  type: string; // type of event TODO change to enum
  actor: {
    id: number;
    login: string;
    url: string; // e.g. https://api.github.com/users/USER_LOGIN
    avatar_url: string; // user avatar image url
  };
  repo: {
    id: number;
    name: string;
    url: string; // e.g. https://api.github.com/users/USER_LOGIN
  };
  payload: any; // depends on type of GithubEvent
  public: boolean;
  created_at: string; // non-formatted

  // Table display
  title: string;
  date: string; // after formatting

  public constructor(githubEvent: {}) {
    Object.assign(this, githubEvent);
    this.title = GithubEvent.generateTitle(githubEvent);
    this.date = moment(githubEvent['created_at']).format('lll');
  }

  /** Generate simple string representation of Github Event. */
  public static generateTitle(githubEvent: {}): string {
    const actor = githubEvent['actor']['login'];
    switch (githubEvent['type']) {
      case EventType.IssuesEvent: {
        // TODO enum
        const action = githubEvent['payload']['action'];
        return actor + ' ' + action + ' issue';
      }
      case EventType.PullRequestEvent: {
        const action = githubEvent['payload']['action'];
        return actor + ' ' + action + ' pull request';
      }
      case EventType.IssueCommentEvent:
      case EventType.PullRequestReviewEvent:
      case EventType.PullRequestReviewCommentEvent: {
        const action = githubEvent['payload']['action'];
        return actor + ' ' + action + ' comment';
      }
      default: {
        return actor + ' did ' + githubEvent['type'];
      }
    }
  }
}
