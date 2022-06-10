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
  created_at: string;

  constructor(githubEvent: {}) {
    Object.assign(this, githubEvent);
  }
}
