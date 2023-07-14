import { Accumulator } from './datastructure/rsq.model';
import { GithubCommit } from './github/github-commit.model';

export class CumulativeStats implements Accumulator<CumulativeStats> {
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

  subtract(o: CumulativeStats): void {
    this.additions -= o.additions;
    this.deletions -= o.deletions;
    this.count -= o.count;
  }
}
