import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { GithubUserWithHasIssues } from '../../core/models/github-user.model';
import { IssueService } from '../../core/services/issue.service';
import { paginateData } from '../../shared/issue-tables/issue-paginator';

@Component({
  selector: 'app-card-view-other-users',
  templateUrl: './card-view-other-users.component.html',
  styleUrls: ['./card-view-other-users.component.css']
})
export class CardViewOtherUsersComponent implements OnInit {
  @Input() users?: GithubUserWithHasIssues[] = [];

  usersToShow: GithubUserWithHasIssues[];

  public isLoading$ = this.issueService.isLoading.asObservable();

  constructor(private issueService: IssueService) {}

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  ngOnInit(): void {
    this.initialize();
  }

  /**
   * Initializes the component.
   */
  private initialize() {
    this.usersToShow = [];

    this.isLoading$.subscribe((isLoading) => {
      if (isLoading) {
        return;
      }
      this.handlePagination();
    });

    this.paginator.page.subscribe(() => {
      this.handlePagination();
    });
  }

  /**
   * Handles initializing and updating the pagination.
   */
  private handlePagination() {
    const users = this.users.filter((user) => !user.hasIssues);
    this.usersToShow = paginateData(this.paginator, users);
  }
}
