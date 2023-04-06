import { Subscription } from 'rxjs';
import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GithubUser } from '../../core/models/github-user.model';
import { GithubCommit } from '../../core/models/github/github-commit.model';
import { GithubService } from '../../core/services/github.service';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() user: GithubUser;

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
    if (this.commitSubscription) {
      this.commitSubscription.unsubscribe();
    }
    this.commitSubscription = this.githubService.fetchCommitGraphqlByUser(this.user.node_id).subscribe((x) => {
      this.queryDate = new Date();
      this.commits = x;
    });
  }
}
