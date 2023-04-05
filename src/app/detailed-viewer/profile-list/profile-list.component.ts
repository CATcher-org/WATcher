import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Observable } from 'rxjs';
import { Issue } from '../../core/models/issue.model';
import { FilterableComponent, FilterableSource } from '../../shared/issue-tables/filterableTypes';
import { IssueList } from '../../shared/issue-tables/IssueList';

export type ProfileInput = {
  title: string;
  octicon: string;
  color: string;
  source$: BehaviorSubject<Issue[]>;
  isLoading$?: Observable<boolean>;
};

@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.component.html',
  styleUrls: ['./profile-list.component.css']
})
export class ProfileListComponent implements OnInit, AfterViewInit, OnDestroy, FilterableComponent {
  @Input() filters?: any = undefined;
  @Input() sort?: MatSort = undefined;
  @Input() headerInfo: ProfileInput;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  issues: IssueList;
  issues$: Observable<Issue[]>;

  constructor() {}

  ngOnInit(): void {
    this.issues = new IssueList(this.headerInfo.source$, this.sort, this.paginator);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.issues.loadData();
      this.issues$ = this.issues.connect();
    });
  }

  ngOnDestroy(): void {
    setTimeout(() => {
      this.issues.disconnect();
    });
  }

  retrieveFilterable(): FilterableSource {
    return this.issues;
  }
}
