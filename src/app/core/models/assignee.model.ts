import { Group } from './github/group.interface';

/**
 * Represents an assignee and its attributes fetched from Github.
 */
export class Assignee implements Group {
  static WithoutAssignee: Assignee = new Assignee({ login: 'Issues/PRs without an assignee', avatar_url: null });
  login: string;
  avatarUrl: string;

  constructor(assignee: { login: string; avatar_url: string }) {
    this.login = assignee.login;
    this.avatarUrl = assignee.avatar_url;
  }

  public equals(other: any) {
    if (!(other instanceof Assignee)) {
      return false;
    }
    return this.login === other.login;
  }
}
