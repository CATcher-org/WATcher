import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { GithubUser } from '../core/models/github-user.model';
import { Issues } from '../core/models/issue.model';
import { GithubService } from '../core/services/github.service';
import { LoggingService } from '../core/services/logging.service';
import { MilestoneService } from '../core/services/milestone.service';
import { PhaseService } from '../core/services/phase.service';
import { CardViewComponent } from '../issues-viewer/card-view/card-view.component';
import { DEFAULT_DROPDOWN_FILTER, DropdownFilter } from '../shared/issue-tables/dropdownfilter';
import { IssuesDataTable } from '../shared/issue-tables/IssuesDataTable';

@Component({
  selector: 'app-detailed-viewer',
  templateUrl: './detailed-viewer.component.html',
  styleUrls: ['./detailed-viewer.component.css']
})
export class DetailedViewerComponent implements OnInit {
  public user: GithubUser = undefined;
  issues: IssuesDataTable;
  public userAssignedIssues: Issues[];
  public userCreatedIssues: Issues[];
  public userAssignedPRs: Issues[];
  public userCreatedPRs: Issues[];

  constructor(
    private phaseService: PhaseService,
    public githubService: GithubService,
    public milestoneService: MilestoneService,
    private route: ActivatedRoute,
    private router: Router,
    private logger: LoggingService
  ) {
    this.repoChangeSubscription = this.phaseService.repoChanged$.subscribe((newRepo) => this.initialize());
  }

  /** Observes for any change in repo*/
  repoChangeSubscription: Subscription;

  /** Selected dropdown filter value */
  dropdownFilter: DropdownFilter = DEFAULT_DROPDOWN_FILTER;

  /** Selected label filters, instance passed into LabelChipBar to populate */
  labelFilter$ = new BehaviorSubject<string[]>([]);
  labelFilterSubscription: Subscription;

  /** Selected label to hide */
  hiddenLabels$ = new BehaviorSubject<Set<string>>(new Set());
  hiddenLabelSubscription: Subscription;

  @ViewChildren(CardViewComponent) cardViews: QueryList<CardViewComponent>;

  /** One MatSort controls all IssueDataTables */
  @ViewChild(MatSort, { static: true }) matSort: MatSort;

  // @ViewChild(LabelFilterBarComponent, { static: true }) labelFilterBar: LabelFilterBarComponent;

  @ViewChild('milestoneSelectorRef', { static: false }) milestoneSelectorRef: MatSelect;

  ngOnInit() {
    if (this.route.snapshot.paramMap.get('name') === undefined) {
      this.logger.info('detailed-viewer: Missing username');
      this.router.navigate(['']);
    }
    this.initialize();
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.labelFilterSubscription.unsubscribe();
    this.hiddenLabelSubscription.unsubscribe();
    this.repoChangeSubscription.unsubscribe();
  }

  initialize(): void {

  }
}
