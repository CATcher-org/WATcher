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
import { Observable, Subscription } from 'rxjs';
import { Group } from '../../core/models/github/group.interface';
import { Issue } from '../../core/models/issue.model';
import { AssigneeService } from '../../core/services/assignee.service';
import { FiltersService } from '../../core/services/filters.service';
import { GroupBy, GroupingContextService } from '../../core/services/grouping/grouping-context.service';
import { IssueService } from '../../core/services/issue.service';
import { LoggingService } from '../../core/services/logging.service';
import { MilestoneService } from '../../core/services/milestone.service';
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
  @ViewChild('milestoneHeader') milestoneHeaderTemplate: TemplateRef<any>;

  issues: IssuesDataTable;
  issues$: Observable<Issue[]>;

  private timeoutId: NodeJS.Timeout | null = null;
  private issuesLengthSubscription: Subscription;
  private issuesLoadingStateSubscription: Subscription;
  private filterSubscription: Subscription;

  isLoading = true;
  issueLength = 0;

  pageSize = 20;

  @Output() issueLengthChange: EventEmitter<Number> = new EventEmitter<Number>();

  constructor(
    public element: ElementRef,
    public issueService: IssueService,
    public groupingContextService: GroupingContextService,
    private filtersService: FiltersService,
    private milestoneService: MilestoneService,
    private assigneeService: AssigneeService,
    private logger: LoggingService
  ) {}

  ngOnInit() {
    this.issues = new IssuesDataTable(
      this.issueService,
      this.groupingContextService,
      this.filtersService,
      this.assigneeService,
      this.milestoneService,
      this.paginator,
      this.headers,
      this.group,
      this.filters
    );

    this.filterSubscription = this.filtersService.filter$.subscribe((filter: any) => {
      this.pageSize = filter.itemsPerPage;
      this.paginator._changePageSize(this.pageSize);
    });
  }

  ngAfterViewInit(): void {
    this.timeoutId = setTimeout(() => {
      this.issues.loadIssues();
      this.issues$ = this.issues.connect();
      this.logger.debug('CardViewComponent: Issues loaded', this.issues$);

      // Emit event when issues change
      this.issuesLengthSubscription = this.issues$.subscribe(() => {
        this.issueLength = this.issues.count;
        this.issueLengthChange.emit(this.issueLength);
      });

      // Emit event when loading state changes
      this.issuesLoadingStateSubscription = this.issues.isLoading$.subscribe((isLoadingUpdate) => {
        this.isLoading = isLoadingUpdate;
      });
    });
  }

  getHeaderTemplate(): TemplateRef<any> {
    switch (this.groupingContextService.currGroupBy) {
      case GroupBy.Assignee:
        return this.assigneeHeaderTemplate;
      case GroupBy.Milestone:
        return this.milestoneHeaderTemplate;
      default:
        return this.defaultHeaderTemplate;
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    if (this.issues) {
      this.issues.disconnect();
    }

    if (this.issuesLengthSubscription) {
      this.issuesLengthSubscription.unsubscribe();
    }

    if (this.issuesLoadingStateSubscription) {
      this.issuesLoadingStateSubscription.unsubscribe();
    }
  }

  retrieveFilterable(): FilterableSource {
    return this.issues;
  }

  getIssueTooltip(): string {
    return this.issues.issueCount + ' Issues';
  }

  getPrTooltip(): string {
    return this.issues.prCount + ' Pull Requests';
  }

  getAssigneeTooltip(assignee: any): string {
    return assignee.login;
  }

  goToGithubProfile(username: string): void {
    if (username && username !== 'Unassigned') {
      const url = `https://github.com/${username}`;
      window.open(url, '_blank'); // Opens in new tab
    }
  }
}
