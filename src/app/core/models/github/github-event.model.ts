import * as moment from 'moment';
import { IssueState } from '../../../../../graphql/graphql-types';
import { GithubUser } from '../github-user.model';

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

  constructor(githubEvent: {}) {
    Object.assign(this, githubEvent);
    this.title = GithubEvent.generateTitle(githubEvent);
    this.date = moment(githubEvent['created_at']).format('lll');
  }

  static generateTitle(githubEvent: {}): string {
    const actor = githubEvent['actor']['login'];
    switch (githubEvent['type']) {
      case 'IssuesEvent': {
        // TODO enum
        const action = githubEvent['payload']['action'];
        return actor + ' ' + action + ' issue';
      }
      case 'PullRequestEvent': {
        const action = githubEvent['payload']['action'];
        return actor + ' ' + action + ' pull request';
      }
      case 'IssueCommentEvent':
      case 'PullRequestReviewEvent':
      case 'PullRequestReviewCommentEvent': {
        const action = githubEvent['payload']['action'];
        return actor + ' ' + action + ' comment';
      }
      default: {
        return actor + ' did ' + githubEvent['type'];
      }
    }
  }
}
