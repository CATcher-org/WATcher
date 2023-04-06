import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Accumulator, PrefixSum } from '../../core/models/datastructure/rsq.model';
import { GithubUser } from '../../core/models/github-user.model';
import { GithubCommit } from '../../core/models/github/github-commit.model';
import { GithubService } from '../../core/services/github.service';

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
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit, AfterViewInit {
  @Input() user: GithubUser;

  commits: GithubCommit[];
  firstCommitDay: number;
  lastCommitDay: number;
  ps: PrefixSum<CumulativeStats>;
  private firstTime: number;

  constructor(private githubService: GithubService) {}
  ngOnInit(): void {
    this.githubService.fetchCommitGraphqlByUser(this.user.node_id).subscribe((x) => {
      this.commits = x;
      this.createPrefixSum();
    });
  }

  ngAfterViewInit(): void {}

  createPrefixSum() {
    this.firstTime = new Date(this.commits[this.commits.length - 1].committedDate.getDate()).getTime();
    const prefixArr = new Array(this.commitToIndex(this.commits[0]) + 1);
    prefixArr.fill(new CumulativeStats());
    for (const commit of this.commits) {
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
