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
 * Represents a GitHub user in WATcher
 */
export class GithubUser implements RawGithubUser {
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

  equals(other: any) {
    if (!(other instanceof GithubUser)) {
      return false;
    }
    return this.login === other.login;
  }
}
