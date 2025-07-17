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
import { AssigneeService } from '../../core/services/assignee.service';
import { FiltersService } from '../../core/services/filters.service';
import { GroupBy, GroupingContextService } from '../../core/services/grouping/grouping-context.service';
import { RepoItemService } from '../../core/services/issue.service';
import { LoggingService } from '../../core/services/logging.service';
import { MilestoneService } from '../../core/services/milestone.service';
import { FilterableComponent, FilterableSource } from '../../shared/issue-tables/filterableTypes';
import { IssuesDataTable } from '../../shared/issue-tables/IssuesDataTable';
import { RepoItem } from '../../core/models/repo-item.model';

@Component({
  selector: 'app-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.css']
})

/**
 * Displays repo items as Cards.
 */
export class CardViewComponent implements OnInit, AfterViewInit, OnDestroy, FilterableComponent {
  @Input() headers: string[];
  @Input() group?: Group = undefined;
  @Input() filters?: any = undefined;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('defaultHeader') defaultHeaderTemplate: TemplateRef<any>;
  @ViewChild('assigneeHeader') assigneeHeaderTemplate: TemplateRef<any>;
  @ViewChild('milestoneHeader') milestoneHeaderTemplate: TemplateRef<any>;

  repoItems: IssuesDataTable;
  repoItems$: Observable<RepoItem[]>;

  private timeoutId: NodeJS.Timeout | null = null;
  private repoItemsLengthSubscription: Subscription;
  private repoItemsLoadingStateSubscription: Subscription;
  private filterSubscription: Subscription;

  isLoading = true;
  repoItemLength = 0;

  pageSize = 20;

  @Output() repoItemLengthChange: EventEmitter<Number> = new EventEmitter<Number>();

  constructor(
    public element: ElementRef,
    public repoItemService: RepoItemService,
    public groupingContextService: GroupingContextService,
    private filtersService: FiltersService,
    private milestoneService: MilestoneService,
    private assigneeService: AssigneeService,
    private logger: LoggingService
  ) {}

  ngOnInit() {
    this.repoItems = new IssuesDataTable(
      this.repoItemService,
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
      this.repoItems.loadRepoItems();
      this.repoItems$ = this.repoItems.connect();
      this.logger.debug('CardViewComponent: Issues loaded', this.repoItems$);

      // Emit event when repo items change
      this.repoItemsLengthSubscription = this.repoItems$.subscribe(() => {
        this.repoItemLength = this.repoItems.count;
        this.repoItemLengthChange.emit(this.repoItemLength);
      });

      // Emit event when loading state changes
      this.repoItemsLoadingStateSubscription = this.repoItems.isLoading$.subscribe((isLoadingUpdate) => {
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

    if (this.repoItems) {
      this.repoItems.disconnect();
    }

    if (this.repoItemsLengthSubscription) {
      this.repoItemsLengthSubscription.unsubscribe();
    }

    if (this.repoItemsLoadingStateSubscription) {
      this.repoItemsLoadingStateSubscription.unsubscribe();
    }
  }

  retrieveFilterable(): FilterableSource {
    return this.repoItems;
  }

  getIssueTooltip(): string {
    return this.repoItems.issueCount + ' Issues';
  }

  getPrTooltip(): string {
    return this.repoItems.prCount + ' Pull Requests';
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
