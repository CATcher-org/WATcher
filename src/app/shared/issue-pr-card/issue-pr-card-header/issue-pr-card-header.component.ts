import { Component, Input } from '@angular/core';
import { Issue } from '../../../core/models/issue.model';

@Component({
  selector: 'app-issue-pr-card-header',
  templateUrl: './issue-pr-card-header.component.html',
  styleUrls: ['./issue-pr-card-header.component.css']
})
export class IssuePrCardHeaderComponent {

  @Input() issue: Issue;

  constructor() { }

  /**
   * Returns corresponding Github icon identifier for issue to display.
   * @returns string to create icon
   */
  getOcticon() {
    const type =this.issue.issueOrPr;
    const state = this.issue.state;

    switch (true) {
      case type === 'Issue' && state === 'OPEN': {
        return 'issue-opened';
      }
      case type === 'Issue' && state === 'CLOSED': {
        return 'issue-closed';
      }
      case type === 'PullRequest' && state === 'OPEN': {
        return 'git-pull-request';
      }
      case type === 'PullRequest' && state === 'CLOSED': {
        return 'git-pull-request-closed';
      }
      case type === 'PullRequest' && state === 'MERGED': {
        return 'git-merge';
      }
      default: {
        return 'circle'; // unknown type and state
      }
    }
  }

  /** Returns status color for issue */
  getIssueOpenOrCloseColor() {
    if (this.issue.state === 'OPEN') {
      return 'green';
    } else if (this.issue.issueOrPr === 'PullRequest' && this.issue.state === 'CLOSED') {
      return 'red';
    } else {
      return 'purple';
    }
  }
  

  /**
   * Formats the title text to account for those that contain long words.
   * @param title - Title of Issue that is to be displayed in the Table Row.
   */
  fitTitleText(): string {
    // Arbitrary Length of Characters beyond which an overflow occurs.
    const MAX_WORD_LENGTH = 43;
    const SPLITTER_TEXT = ' ';
    const ELLIPSES = '...';

    return this.issue.title
      .split(SPLITTER_TEXT)
      .map((word) => {
        if (word.length > MAX_WORD_LENGTH) {
          return word.substring(0, MAX_WORD_LENGTH - 5).concat(ELLIPSES);
        }
        return word;
      })
      .join(SPLITTER_TEXT);
  }

}
