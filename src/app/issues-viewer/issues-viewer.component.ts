import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FiltersService } from '../core/services/filters.service';
import { GithubService } from '../core/services/github.service';
import { GroupService } from '../core/services/grouping/group.service';
import { GroupingContextService } from '../core/services/grouping/grouping-context.service';
import { IssueService } from '../core/services/issue.service';
import { LabelService } from '../core/services/label.service';
import { MilestoneService } from '../core/services/milestone.service';
import { ViewService } from '../core/services/view.service';
import { TABLE_COLUMNS } from '../shared/issue-tables/issue-tables-columns';
import { CardViewComponent } from './card-view/card-view.component';

@Component({
  selector: 'app-issues-viewer',
  templateUrl: './issues-viewer.component.html',
  styleUrls: ['./issues-viewer.component.css']
})
export class IssuesViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly displayedColumns = [TABLE_COLUMNS.ID, TABLE_COLUMNS.TITLE, TABLE_COLUMNS.ASSIGNEE, TABLE_COLUMNS.LABEL];

  /** Observes for any change in repo*/
  repoChangeSubscription: Subscription;

  groupByChangeSubscription: Subscription;

  /** Observes for any change in the cardviews */
  viewChange: Subscription;

  popStateEventSubscription: Subscription;

  availableGroupsSubscription: Subscription;

  popStateNavigationId: number;

  @ViewChildren(CardViewComponent) cardViews: QueryList<CardViewComponent>;

  views = new BehaviorSubject<QueryList<CardViewComponent>>(undefined);

  /** Hide or show the filter bar */
  showFilterBar = false;

  constructor(
    public viewService: ViewService,
    public githubService: GithubService,
    public issueService: IssueService,
    public labelService: LabelService,
    public milestoneService: MilestoneService,
    public groupService: GroupService,
    public groupingContextService: GroupingContextService,
    private router: Router,
    private filtersService: FiltersService
  ) {
    this.repoChangeSubscription = this.viewService.repoChanged$.subscribe((newRepo) => {
      this.issueService.reset(false);
      this.labelService.reset();
      this.initialize();
    });

    this.groupByChangeSubscription = this.groupingContextService.currGroupBy$.subscribe((newGroupBy) => {
      this.initialize();
    });

    this.popStateEventSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd || event instanceof NavigationStart))
      .subscribe((event) => {
        if (event instanceof NavigationStart && event.navigationTrigger === 'popstate') {
          this.popStateNavigationId = event.id;
        }

        if (event instanceof NavigationEnd && event.id === this.popStateNavigationId) {
          this.viewService.initializeRepoFromUrlParams();
          this.groupingContextService.initializeFromUrlParams();
          this.filtersService.initializeFromURLParams();
        }
      });
  }

  ngOnInit() {
    this.initialize();
    this.groupingContextService.initializeFromUrlParams();
    this.filtersService.initializeFromURLParams();
  }

  ngAfterViewInit(): void {
    this.viewChange = this.cardViews.changes.subscribe((x) => this.views.next(x));
  }

  ngOnDestroy(): void {
    this.repoChangeSubscription.unsubscribe();
    this.viewChange.unsubscribe();
    this.popStateEventSubscription.unsubscribe();
  }

  /**
   * Fetch and initialize all information from repository to populate Issue Dashboard.
   */
  private initialize() {
    if (this.availableGroupsSubscription) {
      this.availableGroupsSubscription.unsubscribe();
    }
    this.groupService.resetGroups();
    this.availableGroupsSubscription = this.groupingContextService.getGroups().subscribe((x) => (this.groupService.groups = x));
  }

  private toggleSidebar() {
    this.showFilterBar = !this.showFilterBar;
  }
}
