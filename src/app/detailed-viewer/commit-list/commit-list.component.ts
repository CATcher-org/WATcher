import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Accumulator, PrefixSum } from '../../core/models/datastructure/rsq.model';
import { GithubCommit } from '../../core/models/github/github-commit.model';

const DAYINMILISECOND = 1000 * 60 * 60 * 24;

/**
 * Takes in a sorted list of commits and visually display each commit using a expansion panel.
 * This component will also allow the user to select the range of commits to view by letting them select the start and end date.
 * A DiffStat component is used to summary the cumulative addition as well as deletion of commits in the current view
 */
export interface DateRange {
  minDate: Date;
  maxDate: Date;
}
class CumulativeStats implements Accumulator<CumulativeStats> {
  additions: number;
  deletions: number;
  count: number;

  constructor(commmit?: GithubCommit) {
    this.additions = commmit?.additions ?? 0;
    this.deletions = commmit?.deletions ?? 0;
    this.count = commmit ? 1 : 0;
  }

  add(o: CumulativeStats): void {
    this.additions += o.additions;
    this.deletions += o.deletions;
    this.count += o.count;
  }

  sub(o: CumulativeStats): void {
    this.additions -= o.additions;
    this.deletions -= o.deletions;
    this.count -= o.count;
  }
}

@Component({
  selector: 'app-commit-list',
  templateUrl: './commit-list.component.html',
  styleUrls: ['./commit-list.component.css']
})
export class CommitListComponent implements OnInit {
  @Input() commitList: GithubCommit[];
  @Input() listTitle: string;
  @Input() updateTime: Date;
  @Output() refresh = new EventEmitter<any>();

  // this will be displayed
  commits: GithubCommit[];

  liveStats: CumulativeStats;
  dateRange: DateRange = { maxDate: undefined, minDate: undefined };

  step = -1;
  latestToLast = true;
  startIndex = 1;
  endIndex: number;

  ps: PrefixSum<CumulativeStats>;
  private firstTime: number;

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
      this.ps = new PrefixSum([], () => new CumulativeStats());
      return;
    }
    this.firstTime = new Date(this.commitList[0].committedDate.toDateString()).getTime();
    this.endIndex = this.commitToIndex(this.commitList[this.commitList.length - 1]);
    const prefixArr = new Array(this.endIndex + 1);
    for (let i = 0; i < prefixArr.length; i++) {
      prefixArr[i] = new CumulativeStats();
    }
    for (const commit of this.commitList) {
      prefixArr[this.commitToIndex(commit)].add(new CumulativeStats(commit));
    }

    this.ps = new PrefixSum(prefixArr, () => new CumulativeStats());
  }

  // returns 1 indexed from date
  dateToIndex(date: Date): number {
    return Math.floor((date.getTime() - this.firstTime) / DAYINMILISECOND) + 1;
  }

  commitToIndex(commit: GithubCommit) {
    return this.dateToIndex(commit.committedDate);
  }

  updateList(sDate?: Date, eDate?: Date): void {
    this.dateRange.maxDate = sDate;
    this.dateRange.minDate = eDate;

    if (!sDate || !eDate) {
      this.commits = [];
      this.liveStats = new CumulativeStats();
      return;
    }
    // close all opened commits
    this.step = -1;
    // ensure start date is at 0000 while end date ends at 2359
    sDate = new Date(new Date(sDate).toDateString());
    eDate = new Date(new Date(eDate.toDateString()).getTime() + DAYINMILISECOND - 1);
    this.commits = [];
    for (const commit of this.commitList) {
      if (sDate <= commit.committedDate && commit.committedDate <= eDate) {
        this.commits.push(commit);
      }
    }
    if (this.latestToLast) {
      this.commits.reverse();
    }
    this.liveStats = this.ps.rsq(this.startIndex, this.endIndex);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open<DateRangeDialogComponent, DateRange, DateRange>(DateRangeDialogComponent, {
      data: {
        minDate: this.commitList[0].committedDate,
        maxDate: this.commitList[this.commitList.length - 1].committedDate
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.startIndex = this.dateToIndex(result.minDate);
        this.endIndex = this.dateToIndex(result.maxDate);
        this.updateList(result.minDate, result.maxDate);
      }
    });
  }
}

@Component({
  selector: 'app-queryrange-dialog',
  templateUrl: './queryrange.html'
})
export class DateRangeDialogComponent {
  constructor(public dialogRef: MatDialogRef<DateRangeDialogComponent, DateRange>, @Inject(MAT_DIALOG_DATA) public data: DateRange) {}

  checkValid(d1: string, d2: string): boolean {
    const start = new Date(d1);
    const end = new Date(d2);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return false;
    }
    if (end > this.data.maxDate || start < this.data.minDate) {
      return false;
    }

    return start <= end;
  }

  onSubmitClick(d1: string, d2: string): void {
    this.dialogRef.close({
      minDate: new Date(d1),
      maxDate: new Date(d2)
    });
  }
}
