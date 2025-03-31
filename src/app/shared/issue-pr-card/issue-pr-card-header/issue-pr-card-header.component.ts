import { Component, Input } from '@angular/core';
import { Issue } from '../../../core/models/issue.model';

@Component({
  selector: 'app-issue-pr-card-header',
  templateUrl: './issue-pr-card-header.component.html',
  styleUrls: ['./issue-pr-card-header.component.css']
})
export class IssuePrCardHeaderComponent {
  @Input() issue: Issue;

  constructor() {}

  /**
   * Returns corresponding Github icon identifier for issue to display.
   * @returns string to create icon
   */
  getOcticon() {
    const type = this.issue.issueOrPr;
    const state = this.issue.state;
    const stateReason = this.issue.stateReason;

    if (type === 'Issue') {
      if (state === 'OPEN') {
        return 'issue-opened';
      } else if (state === 'CLOSED') {
        if (stateReason === 'COMPLETED') {
          return 'issue-closed';
        } else if (stateReason === 'NOT_PLANNED') {
          return 'issue-draft';
        }
      }
    } else if (type === 'PullRequest') {
      if (state === 'OPEN') {
        if (this.issue.isDraft) {
          return 'git-pull-request-draft';
        }
        return 'git-pull-request';
      } else if (state === 'CLOSED') {
        return 'git-pull-request-closed';
      } else if (state === 'MERGED') {
        return 'git-merge';
      }
    } else {
      return 'circle'; // unknown type and state
    }
  }

  /** Returns status color for issue */
  getIssueOpenOrCloseColor() {
    if (this.issue.state === 'OPEN') {
      if (this.issue.isDraft) {
        return 'grey';
      } else {
        return 'green';
      }
    } else if (this.issue.issueOrPr === 'PullRequest' && this.issue.state === 'CLOSED') {
      return 'red';
    } else if (this.issue.issueOrPr === 'Issue' && this.issue.stateReason === 'NOT_PLANNED') {
      return 'gray';
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
