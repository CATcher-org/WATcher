import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Moment } from 'moment';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { GithubUser } from '../../core/models/github-user.model';
import { GithubCommit } from '../../core/models/github/github-commit.model';
import { GithubService } from '../../core/services/github.service';

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
    if (this.commitSubscription) {
      this.commitSubscription.unsubscribe();
    }
    this.commitSubscription = this.githubService.fetchCommitGraphqlByUser(this.user.node_id).subscribe((x) => {
      this.queryDate = moment();
      x.reverse();
      this.commits = x;
    });
  }
}
