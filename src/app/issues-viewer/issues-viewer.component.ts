import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSort } from '@angular/material';
import { BehaviorSubject, Subscription } from 'rxjs';
import { GithubUser } from '../core/models/github-user.model';
import { Repo } from '../core/models/repo.model';
import { GithubService } from '../core/services/github.service';
import { IssueService } from '../core/services/issue.service';
import { LoggingService } from '../core/services/logging.service';
import { MilestoneService } from '../core/services/milestone.service';
import { PhaseService } from '../core/services/phase.service';
import { TABLE_COLUMNS } from '../shared/issue-tables/issue-tables-columns';
import { DEFAULT_DROPDOWN_FILTER, DropdownFilter } from '../shared/issue-tables/IssuesDataTable';
import { CardViewComponent } from './card-view/card-view.component';
import { LabelChipBarComponent } from './label-chip-bar/label-chip-bar.component';

@Component({
  selector: 'app-issues-viewer',
  templateUrl: './issues-viewer.component.html',
  styleUrls: ['./issues-viewer.component.css']
})
export class IssuesViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly displayedColumns = [TABLE_COLUMNS.ID, TABLE_COLUMNS.TITLE, TABLE_COLUMNS.ASSIGNEE, TABLE_COLUMNS.LABEL];

  assignees: GithubUser[];
  dropdownFilter: DropdownFilter = DEFAULT_DROPDOWN_FILTER;
  labelFilter$ = new BehaviorSubject<string[]>([]);
  labelFilterSubscription: Subscription;

  @ViewChildren(CardViewComponent) cardViews: QueryList<CardViewComponent>;
  @ViewChild(MatSort, { static: true }) matSort: MatSort;
  @ViewChild(LabelChipBarComponent, { static: true }) labelChipBar: LabelChipBarComponent;

  repoForm = new FormGroup({
    repoInput: new FormControl(['', Validators.required])
  });

  constructor(
    public phaseService: PhaseService,
    public githubService: GithubService,
    public issueService: IssueService,
    private milestoneService: MilestoneService,
    private logger: LoggingService
  ) {}

  ngOnInit() {
    this.initialize();
  }

  ngAfterViewInit(): void {
    this.labelFilterSubscription = this.labelFilter$.subscribe((labels) => {
      this.dropdownFilter.labels = labels;
      this.applyDropdownFilter();
    });
  }

  ngOnDestroy(): void {
    this.labelFilterSubscription.unsubscribe();
  }

  applyFilter(filterValue: string) {
    this.cardViews.forEach((v) => (v.issues.filter = filterValue));
  }

  applyDropdownFilter() {
    this.cardViews.forEach((v) => (v.issues.dropdownFilter = this.dropdownFilter));
  }

  switchRepo() {
    this.phaseService.setCurrentRepository(Repo.of(this.repoForm.controls['repoInput'].value));
    this.initialize();
  }

  private initialize() {
    this.assignees = [];
    this.repoForm.setValue({ repoInput: this.phaseService.currentRepo.toString() });
    this.githubService.getUsersAssignable().subscribe((x) => (this.assignees = x));
    this.issueService.reloadAllIssues();
    this.labelChipBar.load();
    this.milestoneService.fetchMilestones().subscribe(
      (response) => {
        this.logger.debug('Fetched milestones from Github');
      },
      (err) => {},
      () => {}
    );
  }
}
