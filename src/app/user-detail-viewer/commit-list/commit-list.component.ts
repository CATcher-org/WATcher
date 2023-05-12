import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Moment } from 'moment';
import { GithubCommit } from '../../core/models/github/github-commit.model';
import { DAY_IN_MILISECOND, toMaxTime, toMinTime } from '../datetimehelper';

/**
 * Takes in a sorted list of commits and visually display each commit using a expansion panel.
 * This component will also allow the user to select the range of commits to view by letting them select the start and end date.
 * A DiffStat component is used to summary the cumulative addition as well as deletion of commits in the current view
 */
export interface DateRange {
  minDate: Moment;
  maxDate: Moment;
}

@Component({
  selector: 'app-commit-list',
  templateUrl: './commit-list.component.html',
  styleUrls: ['./commit-list.component.css']
})
export class CommitListComponent implements OnInit {
  @Input() commitList: GithubCommit[];
  @Input() listTitle: string;
  @Input() updateTime: Moment;
  @Output() refresh = new EventEmitter<any>();

  // this will be displayed
  commits: GithubCommit[];

  dateRange: DateRange = { maxDate: undefined, minDate: undefined };

  step = -1;
  latestToLast = true;
  startIndex = 1;
  endIndex: number;

  private firstTime: Moment;

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    this.createPrefixSum();
    this.updateList(this.commitList[0]?.committedDate, this.commitList[this.commitList.length - 1]?.committedDate);
  }

  toggleOrder() {
    this.latestToLast = !this.latestToLast;
    this.commits.reverse();
    this.step = -1;
  }

  setStep(index: number) {
    this.step = index;
  }

  createPrefixSum() {
    if (this.commitList.length === 0) {
      return;
    }
    this.firstTime = toMinTime(this.commitList[0].committedDate);

    const commitToIndex = (commit: GithubCommit) => this.dateToIndex(commit.committedDate);

    this.endIndex = commitToIndex(this.commitList[this.commitList.length - 1]);
  }

  // Convert date to index of commitList
  dateToIndex(date: Moment): number {
    return Math.floor(date.diff(this.firstTime) / DAY_IN_MILISECOND) + 1;
  }

  updateList(sDate?: Moment, eDate?: Moment): void {
    this.dateRange.minDate = sDate;
    this.dateRange.maxDate = eDate;

    if (!sDate || !eDate) {
      this.commits = [];
      return;
    }
    // close all opened commits
    this.step = -1;
    // ensure start date is at 0000 while end date ends at 2359
    sDate = toMinTime(sDate);
    eDate = toMaxTime(eDate);
    this.commits = [];
    for (const commit of this.commitList) {
      if (sDate <= commit.committedDate && commit.committedDate <= eDate) {
        this.commits.push(commit);
      }
    }
    if (this.latestToLast) {
      this.commits.reverse();
    }
  }
}
