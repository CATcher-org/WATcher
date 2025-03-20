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
}
