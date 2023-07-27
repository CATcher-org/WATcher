import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Moment } from 'moment';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { GithubUser } from '../../core/models/github-user.model';
import { GithubCommit } from '../../core/models/github/github-commit.model';
import { GithubService } from '../../core/services/github.service';
import { convertMiliToString, DATETIME, getTimeinMilisecond, timeToDescriptor } from '../datetimehelper';

export type UserStats = {
  averageCommitTime: string;
  firstCommitDate: string;
  lastCommitDate: string;
  totalCommit: number;
  averageGapBetweenCommit: string;
  LongestGapBetweenCommit: string;
};

/**
 * Calls upon the githubService to retrieve all commits made by the user in the specified repository.
 * This component also passes the commit list to the CommitListComponent as well as generate
 * the summary statistics which is to be displayed by the ProfileSummaryComponent
 */

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit, OnDestroy {
  @Input() user: GithubUser;
  @Output() details = new EventEmitter<UserStats>();

  commitSubscription: Subscription;
  commits: GithubCommit[];
  queryDate: Moment;

  constructor(private githubService: GithubService) {}
  ngOnInit(): void {
    this.reloadData();
  }

  ngOnDestroy(): void {
    if (this.commitSubscription) {
      this.commitSubscription.unsubscribe();
    }
  }

  reloadData() {
    this.commits = undefined;
    this.details.emit();
    if (this.commitSubscription) {
      this.commitSubscription.unsubscribe();
    }
    this.commitSubscription = this.githubService.fetchCommitGraphqlByUser(this.user.node_id).subscribe((x) => {
      this.queryDate = moment();
      x.reverse();
      this.commits = x;
      this.getStats();
    });
  }

  getStats(): void {
    const ret: UserStats = {
      averageCommitTime: 'Not enough Commits',
      averageGapBetweenCommit: 'Not enough Commits',
      LongestGapBetweenCommit: 'Not enough Commits',
      totalCommit: this.commits.length,
      firstCommitDate: 'Not enough Commits',
      lastCommitDate: 'Not enough Commits'
    };
    if (this.commits.length >= 2) {
      let largestGap = -Infinity;
      let smallestGap = Infinity;
      let totalGap = 0;
      for (let i = 1; i < this.commits.length; i++) {
        const gap = this.commits[i].committedDate.diff(this.commits[i - 1].committedDate);
        largestGap = Math.max(largestGap, gap);
        smallestGap = Math.min(smallestGap, gap);
        totalGap += gap;
      }
      ret.LongestGapBetweenCommit = convertMiliToString(largestGap);
      ret.averageGapBetweenCommit = convertMiliToString(totalGap / (this.commits.length - 1));
    }

    if (this.commits.length === 0) {
      return this.details.emit(ret);
    }
    ret.firstCommitDate = this.commits[0].committedDate.format(DATETIME);
    ret.lastCommitDate = this.commits[this.commits.length - 1].committedDate.format(DATETIME);
    let cumulative = 0;
    for (const commit of this.commits) {
      cumulative += getTimeinMilisecond(commit.committedDate);
    }
    ret.averageCommitTime = timeToDescriptor(cumulative / this.commits.length);
    this.details.emit(ret);
  }
}
