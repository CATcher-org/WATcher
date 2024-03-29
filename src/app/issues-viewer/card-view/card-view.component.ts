import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { Group } from '../../core/models/github/group.interface';
import { Issue } from '../../core/models/issue.model';
import { GroupBy, GroupingContextService } from '../../core/services/grouping/grouping-context.service';
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
  @Input() group?: Group = undefined;
  @Input() filters?: any = undefined;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('defaultHeader') defaultHeaderTemplate: TemplateRef<any>;
  @ViewChild('assigneeHeader') assigneeHeaderTemplate: TemplateRef<any>;

  issues: IssuesDataTable;
  issues$: Observable<Issue[]>;

  isLoading = true;
  issueLength = 0;

  pageSize = 20;

  @Output() issueLengthChange: EventEmitter<Number> = new EventEmitter<Number>();

  constructor(public element: ElementRef, public issueService: IssueService, public groupingContextService: GroupingContextService) {}

  ngOnInit() {
    this.issues = new IssuesDataTable(
      this.issueService,
      this.groupingContextService,
      this.paginator,
      this.headers,
      this.group,
      this.filters
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.issues.loadIssues();
      this.issues$ = this.issues.connect();

      // Emit event when issues change
      this.issues$.subscribe(() => {
        this.issueLength = this.issues.count;
        this.issueLengthChange.emit(this.issueLength);
      });

      // Emit event when loading state changes
      this.issues.isLoading$.subscribe((isLoadingUpdate) => {
        this.isLoading = isLoadingUpdate;
      });
    });
  }

  getHeaderTemplate(): TemplateRef<any> {
    switch (this.groupingContextService.currGroupBy) {
      case GroupBy.Assignee:
        return this.assigneeHeaderTemplate;
      default:
        return this.defaultHeaderTemplate;
    }
  }

  ngOnDestroy(): void {
    setTimeout(() => {
      this.issues.disconnect();
    });
  }

  retrieveFilterable(): FilterableSource {
    return this.issues;
  }

  updatePageSize(newPageSize: number) {
    this.pageSize = newPageSize;
  }
}
