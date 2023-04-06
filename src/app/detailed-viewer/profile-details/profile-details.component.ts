import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { GithubUser } from '../../core/models/github-user.model';
import { GithubService } from '../../core/services/github.service';
import { GithubCommit } from '../../core/models/github/github-commit.model';
import { Accumulator } from '../../core/models/datastructure/rsq.model';

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
  prefixArr: PrefixSum<CumulativeStats>;

  constructor(private githubService: GithubService) {}
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.githubService.fetchCommitGraphqlByUser(this.user.node_id).subscribe((x) => {
      this.commits = x;
      this.commits.reverse(); // convert to earliest to latest
      this.createPrefixSum();
    });
  }

  createPrefixSum() {
    this.firstCommitDay = ProfileDetailsComponent.toDay(this.commits[0].committedDate);
    this.lastCommitDay = ProfileDetailsComponent.toDay(this.commits[this.commits.length - 1].committedDate);
    const commitToIndex = (c) => ProfileDetailsComponent.toDay(c.committedDate) - this.firstCommitDay + 1;
    const arr = new Array<CumulativeStats>(this.lastCommitDay - this.firstCommitDay + 2);
    arr.fill(new CumulativeStats());
    for (const commit of this.commits) {
      console.log(commitToIndex(commit));
      arr[commitToIndex(commit)].add(new CumulativeStats(commit));
    }

    for (let i = 1; i < arr.length; i++) {
      arr[i].add(arr[i - 1]);
    }

    this.prefixArr = new PrefixSum(arr, () => new CumulativeStats());
  }

  /**
   * returns the number of days since Jan 1, 1970
   */
  static toDay(date: Date): number {
    // less overhead compared to Math.floor
    return ~~(date.getTime() / DAYINMILISECOND);
  }
}
