import * as moment from 'moment';
import { GithubComment } from './github/github-comment.model';
import { GithubIssue } from './github/github-issue.model';
import { GithubLabel } from './github/github-label.model';
import { HiddenData } from './hidden-data.model';
import { Milestone } from './milestone.model';

export class Issue {
  /** Basic Fields */
  readonly globalId: string;
  readonly id: number;
  readonly created_at: string;
  readonly githubIssue: GithubIssue;
  githubComments: GithubComment[];
  title: string;
  description: string;
  hiddenDataInDescription: HiddenData;
  updated_at: string;
  closed_at: string;
  milestone: Milestone;
  state: string;
  stateReason: string;
  issueOrPr: string;
  author: string;
  isDraft: boolean;

  /** Depending on the phase, assignees attribute can be derived from Github's assignee feature OR from the Github's issue description */
  assignees?: string[];
  labels?: string[];
  githubLabels?: GithubLabel[];

  /**
   * Formats the text to create space at the end of the user input to prevent any issues with
   * the markdown interpretation.
   *
   * Brought over from comment-editor.component.ts
   */
  static formatText(text: string): string {
    if (text === null) {
      return null;
    }

    if (text === undefined) {
      return undefined;
    }

    const newLinesRegex = /[\n\r]/gi;
    const textSplitArray = text.split(newLinesRegex);
    if (textSplitArray.filter((split) => split.trim() !== '').length > 0) {
      return `${text}\n\n`;
    } else {
      return text;
    }
  }

  /**
   * Processes and cleans a raw issue description obtained from user input.
   */
  static updateDescription(description: string): string {
    const defaultString = 'No details provided by bug reporter.';
    return Issue.orDefaultString(Issue.formatText(description), defaultString);
  }

  /**
   * Given two strings, returns the first if it is not an empty string or a false value such as null/undefined.
   * Returns the second string if the first is an empty string.
   */
  private static orDefaultString(stringA: string, def: string): string {
    if (!stringA) {
      return def;
    }
    return stringA.length !== 0 ? stringA : def;
  }

  protected constructor(githubIssue: GithubIssue) {
    /** Basic Fields */
    this.globalId = githubIssue.id;
    this.id = +githubIssue.number;
    this.created_at = moment(githubIssue.created_at).format('lll');
    this.updated_at = moment(githubIssue.updated_at).format('lll');
    this.closed_at = moment(githubIssue.closed_at).format('lll');
    this.title = githubIssue.title;
    this.hiddenDataInDescription = new HiddenData(githubIssue.body);
    this.description = Issue.updateDescription(this.hiddenDataInDescription.originalStringWithoutHiddenData);
    this.state = githubIssue.state;
    this.stateReason = githubIssue.stateReason;
    this.issueOrPr = githubIssue.issueOrPr;
    this.author = githubIssue.user.login;
    // this.githubIssue = githubIssue;
    this.isDraft = githubIssue.isDraft;

    this.assignees = githubIssue.assignees.map((assignee) => assignee.login);
    this.githubLabels = githubIssue.labels;
    this.labels = githubIssue.labels.map((label) => label.name);
    this.milestone = githubIssue.milestone
      ? new Milestone(githubIssue.milestone)
      : this.issueOrPr === 'Issue'
      ? Milestone.IssueWithoutMilestone
      : Milestone.PRWithoutMilestone;
  }

  public static createPhaseBugReportingIssue(githubIssue: GithubIssue): Issue {
    return new Issue(githubIssue);
  }

  createGithubIssueDescription(): string {
    return `${this.description}\n${this.hiddenDataInDescription.toString()}`;
  }
}

export interface Issues {
  [id: number]: Issue;
}

export const IssuesFilter = {
  issuesViewer: {
    Student: 'NO_FILTER',
    Tutor: 'NO_FILTER',
    Admin: 'NO_FILTER'
  }
};
