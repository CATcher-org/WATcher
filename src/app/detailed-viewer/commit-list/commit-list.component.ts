import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Accumulator, PrefixSum } from '../../core/models/datastructure/rsq.model';
import { GithubCommit } from '../../core/models/github/github-commit.model';

const DAYINMILISECOND = 1000 * 60 * 60 * 24;
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
export class CommitListComponent implements OnInit, AfterViewInit {
  @Input() commitList: GithubCommit[];
  @Input() listTitle: string;
  @Input() updateTime: Date;
  @Output() refresh = new EventEmitter<any>();
  step = -1;

  ps: PrefixSum<CumulativeStats>;
  private firstTime: number;

  constructor() {}

  ngOnInit(): void {
    this.createPrefixSum();
  }

  ngAfterViewInit(): void {}

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  createPrefixSum() {
    this.firstTime = new Date(this.commitList[this.commitList.length - 1].committedDate.getDate()).getTime();
    const prefixArr = new Array(this.commitToIndex(this.commitList[0]) + 1);
    prefixArr.fill(new CumulativeStats());
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
}
