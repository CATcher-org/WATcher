import { IssueFilters, IssueState, IssueStateReason } from '../../../../../graphql/graphql-types';

export type RestGithubIssueState = 'open' | 'close' | 'all';
export type RestGithubIssueStateReason = 'completed' | 'notPlanned' | 'reopened';
export type RestGithubSortBy = 'created' | 'updated' | 'comments';
export type RestGithubSortDir = 'asc' | 'desc';

export interface RestGithubIssueFilterData {
  state?: RestGithubIssueState;
  stateReason?: RestGithubIssueStateReason;
  labels?: Array<string>;
  sort?: RestGithubSortBy;
  direction?: RestGithubSortDir;
  since?: string; // ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ
  milestone?: number | '*' | 'none';
  assignee?: string;
  creator?: string;
  mentioned?: string;
}
/**
 * A filter to filter out the issues to retrieve from github.
 * Ref: https://developer.github.com/v3/issues/#parameters-3
 * */
export default class RestGithubIssueFilter implements RestGithubIssueFilterData {
  state?: RestGithubIssueState;
  stateReason?: RestGithubIssueStateReason;
  labels?: Array<string>;
  sort?: RestGithubSortBy;
  direction?: RestGithubSortDir;
  since?: string;
  milestone?: number | '*' | 'none';
  assignee?: string;
  creator?: string;
  mentioned?: string;

  constructor(data: RestGithubIssueFilterData) {
    Object.assign(this, data);
  }

  convertToGraphqlFilter(): IssueFilters {
    if (this.state === undefined || this.state === 'all') {
      return <IssueFilters>{
        assignee: this.assignee,
        createdBy: this.creator,
        labels: this.labels,
        mentioned: this.mentioned,
        milestone: this.milestone,
        since: this.since
      };
    }

    return <IssueFilters>{
      assignee: this.assignee,
      createdBy: this.creator,
      labels: this.labels,
      mentioned: this.mentioned,
      milestone: this.milestone,
      since: this.since,
      states: [this.state === 'close' ? IssueState.Closed : IssueState.Open],
      stateReason: [this.stateReason === 'completed'
      ? IssueStateReason.Completed
        : this.stateReason === 'notPlanned'
        ? IssueStateReason.NotPlanned
        : IssueStateReason.Reopened]
    };
  }
}
