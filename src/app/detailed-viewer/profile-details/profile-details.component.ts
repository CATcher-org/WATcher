import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { GithubService } from '../../core/services/github.service';
import { GithubUser } from '../../core/models/github-user.model';
import { Apollo } from 'apollo-angular';
import { FetchIssue } from '../../../../graphql/graphql-types';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit, AfterViewInit {
  @Input() user: GithubUser;
  anycontent: any;

  constructor(private apollo: Apollo, private githubService: GithubService) {}
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // this.githubService.fetchCommitGraphqlByUser(this.user.node_id).subscribe(x => {
    //   console.log(x);

    //   this.anycontent = x;
    // }, err => {console.log(err)});[]
    this.apollo
      .watchQuery({
        query: FetchIssue,
        variables: {
          owner: 'CATcher-org',
          name: 'CATcher',
          issueId: '12'
        }
      })
      .valueChanges.subscribe((x) => console.log(x));
  }
}
