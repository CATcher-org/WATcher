export const PullrequestReviewState = {
  PENDING: 'PENDING',
  COMMENTED: 'COMMENTED',
  APPROVED: 'APPROVED',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
  DISMISSED: 'DISMISSED'
} as const;

export type PullrequestReviewStateType = typeof PullrequestReviewState[keyof typeof PullrequestReviewState];

export class PullrequestReview {
  state: PullrequestReviewStateType;
  reviewer: string;
  avatarUrl: string;

  constructor(prReview: { state: PullrequestReviewStateType; author: { login: string; avatarUrl: string } }) {
    this.state = prReview.state;
    this.reviewer = prReview.author.login;
    this.avatarUrl = prReview.author.avatarUrl;
  }

  public getReviewTooltipMessage(): string {
    switch (this.state) {
      case PullrequestReviewState.APPROVED:
        return `${this.reviewer} approved`;
      case PullrequestReviewState.CHANGES_REQUESTED:
        return `${this.reviewer} requested changes`;
      case PullrequestReviewState.COMMENTED:
        return `${this.reviewer} commented in a review`;
      case PullrequestReviewState.DISMISSED:
        return `${this.reviewer}'s review was dismissed`;
      case PullrequestReviewState.PENDING:
        return `${this.reviewer} has a pending review`;
      default:
        return '';
    }
  }
}
