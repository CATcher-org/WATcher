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
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { GithubUser } from '../../core/models/github-user.model';
import { Milestone } from '../../core/models/milestone.model';

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
      this.issuesLoadingStateSubscription = this.issues.isLoading.subscribe((isLoadingUpdate) => {
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

  drop(event: CdkDragDrop<Group>) {
    // Enforce that the item being dragged is an issue
    if (!(event.item.data instanceof Issue)) {
      return;
    }
    const issue: Issue = event.item.data;

    // If the item is being dropped in the same container, do nothing
    if (event.previousContainer === event.container) {
      return;
    }

    this.isLoading = true;

    if (event.container.data instanceof GithubUser && event.previousContainer.data instanceof GithubUser) {
      const assigneeToRemove = event.previousContainer.data;
      const assigneeToAdd = event.container.data;
      const assignees = this.assigneeService.assignees.filter((assignee) => issue.assignees.includes(assignee.login));

      if (assigneeToRemove !== GithubUser.NO_ASSIGNEE) {
        const index = assignees.findIndex((assignee) => assignee.login === assigneeToRemove.login);
        if (index !== -1) {
          assignees.splice(index, 1);
        }
      }
      if (assigneeToAdd !== GithubUser.NO_ASSIGNEE) {
        assignees.push(assigneeToAdd);
      }

      this.issueService.updateIssue(issue, assignees, issue.milestone).subscribe();
    } else if (event.container.data instanceof Milestone) {
      // assigneeIds is a mandatory field for the updateIssue mutation
      const assignees = this.assigneeService.assignees.filter((assignee) => issue.assignees.includes(assignee.login));

      const milestoneToAdd = event.container.data;

      this.issueService.updateIssue(issue, assignees, milestoneToAdd).subscribe();
    }
  }
}
