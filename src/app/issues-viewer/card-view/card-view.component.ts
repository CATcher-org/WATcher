import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { GithubUser } from '../../core/models/github-user.model';
import { Issue } from '../../core/models/issue.model';
import { IssueService } from '../../core/services/issue.service';
import { FilterableComponent, FilterableSource } from '../../shared/issue-tables/filterableTypes';
import { IssuesDataTable } from '../../shared/issue-tables/IssuesDataTable';

@Component({
  selector: 'app-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.css']
})

/**
 * Displays issues as Cards.
 */
export class CardViewComponent implements OnInit, AfterViewInit, OnDestroy, FilterableComponent {
  @Input() headers: string[];
  @Input() assignee?: GithubUser = undefined;
  @Input() filters?: any = undefined;
  @Input() sort?: MatSort = undefined;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  issues: IssuesDataTable;
  issues$: Observable<Issue[]>;

  isLoading = true;
  issueLength = 0;

  @Output() issueLengthChange: EventEmitter<Number> = new EventEmitter<Number>();

  constructor(public element: ElementRef, public issueService: IssueService) {}

  ngOnInit() {
    this.issues = new IssuesDataTable(this.issueService, this.sort, this.paginator, this.headers, this.assignee, this.filters);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.issues.loadIssues();
      this.issues$ = this.issues.connect();

      // Emit event when issues change
      this.issues$.subscribe((issues) => {
        this.issueLength = issues.length;
        this.issueLengthChange.emit(this.issueLength);
      });

      // Emit event when loading state changes
      this.issues.isLoading$.subscribe((isLoadingUpdate) => {
        this.isLoading = isLoadingUpdate;
      });
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
