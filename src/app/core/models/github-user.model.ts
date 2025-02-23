import { Group } from './github/group.interface';

/**
 * Represents raw data returned from the GitHub API about a user.
 */
export interface RawGithubUser {
  avatar_url: string;
  created_at: string;
  html_url: string;
  login: string;
  name: string;
  node_id: string;
  two_factor_authentication: boolean;
  site_admin: false;
  type: string;
  updated_at: string;
  url: string;
}

/**
 * Represents a GitHub user in WATcher, used for authentication
 * of user as well as representing assignees for issues/PRs.
 */
export class GithubUser implements RawGithubUser, Group {
  static NO_ASSIGNEE: GithubUser = new GithubUser({
    avatar_url: '',
    created_at: '',
    html_url: '',
    login: 'Unassigned',
    name: '',
    node_id: '',
    two_factor_authentication: false,
    site_admin: false,
    type: '',
    updated_at: '',
    url: ''
  });

  avatar_url: string;
  created_at: string;
  html_url: string;
  login: string;
  name: string;
  node_id: string;
  two_factor_authentication: boolean;
  site_admin: false;
  type: string;
  updated_at: string;
  url: string;

  constructor(rawData: RawGithubUser) {
    Object.assign(this, rawData);
  }

  static fromUsername(username: string) {
    return new GithubUser({
      login: username,
      avatar_url: '',
      created_at: '',
      html_url: '',
      name: '',
      node_id: '',
      two_factor_authentication: false,
      site_admin: false,
      type: '',
      updated_at: '',
      url: ''
    });
  }

  equals(other: any) {
    if (!(other instanceof GithubUser)) {
      return false;
    }
    return this.login === other.login;
  }
}
