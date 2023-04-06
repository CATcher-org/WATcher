import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { GithubUser } from '../../core/models/github-user.model';
import { GithubCommit } from '../../core/models/github/github-commit.model';
import { GithubService } from '../../core/services/github.service';

export type UserStats = {
  averageCommitTime: string;
  firstCommitDate: string;
  lastCommitDate: string;
  totalCommit: number;
  averageGapBetweenCommit: string;
  LongestGapBetweenCommit: string;
  ShortestGapBetweenCommit: string;
};

const SEC = 1000;
const MIN = SEC * 60;
const HOUR = MIN * 60;
const DAY = HOUR * 24;

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() user: GithubUser;
  @Output() details = new EventEmitter<UserStats>();

  commitSubscription: Subscription;
  commits: GithubCommit[];
  queryDate: Date;

  constructor(private githubService: GithubService) {}
  ngOnInit(): void {
    this.reloadData();
  }

  ngAfterViewInit(): void {}

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
      this.queryDate = new Date();
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
      ShortestGapBetweenCommit: 'Not enough Commits',
      totalCommit: this.commits.length,
      firstCommitDate: 'Not enough Commits',
      lastCommitDate: 'Not enough Commits'
    };
    if (this.commits.length >= 2) {
      let largestGap = -Infinity;
      let smallestGap = Infinity;
      let totalGap = 0;
      for (let i = 1; i < this.commits.length; i++) {
        const gap = this.commits[i].committedDate.getTime() - this.commits[i - 1].committedDate.getTime();
        largestGap = Math.max(largestGap, gap);
        smallestGap = Math.min(smallestGap, gap);
        totalGap += gap;
      }
      ret.LongestGapBetweenCommit = this.convertMiliToString(largestGap);
      ret.ShortestGapBetweenCommit = this.convertMiliToString(smallestGap);
      ret.averageGapBetweenCommit = this.convertMiliToString(totalGap / (this.commits.length - 1));
    }

    if (this.commits.length === 0) {
      return this.details.emit(ret);
    }
    ret.firstCommitDate = this.commits[0].committedDate.toLocaleString();
    ret.lastCommitDate = this.commits[this.commits.length - 1].committedDate.toLocaleString();
    let cumulative = 0;
    for (const commit of this.commits) {
      cumulative += this.getTime(commit.committedDate);
    }
    cumulative = Math.floor(cumulative / this.commits.length);
    ret.averageCommitTime = this.convertMiliToString(cumulative, true);
    this.details.emit(ret);
  }

  getTime(date: Date): number {
    return date.getTime() - new Date(date.toDateString()).getTime();
  }

  convertMiliToString(time: number, is24hour: boolean = false): string {
    const days = Math.floor(time / DAY);
    time = time % DAY;
    const dt = new Date(time);
    if (is24hour) {
      return dt.toLocaleTimeString();
    }
    return `${days} days, ${dt.getHours()} hours, ${dt.getMinutes()} minutes`;
  }
}
