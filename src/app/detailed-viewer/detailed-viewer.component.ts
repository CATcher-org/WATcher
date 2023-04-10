import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GithubUser } from '../core/models/github-user.model';
import { Phase } from '../core/models/phase.model';
import { GithubService } from '../core/services/github.service';
import { LoggingService } from '../core/services/logging.service';
import { MilestoneService } from '../core/services/milestone.service';
import { PhaseService } from '../core/services/phase.service';

/**
 * Responsible for structuring the page as well as passing data between components.
 * Also responsible for retrieving Issues and PRs from the repos and classifying them
 * into "Created" and "Assigned" PRs and Issues to be displayed by the 4 ProfileListComponents
 */
@Component({
  selector: 'app-detailed-viewer',
  templateUrl: './detailed-viewer.component.html',
  styleUrls: ['./detailed-viewer.component.css']
})
export class DetailedViewerComponent implements OnInit, OnDestroy, AfterViewInit {
  public user: GithubUser = undefined;

  private userSubscription: Subscription;

  /** Observes for any change in repo*/
  repoChangeSubscription: Subscription;
  issueChangeSubscription: Subscription;

  constructor(
    private phaseService: PhaseService,
    public githubService: GithubService,
    public milestoneService: MilestoneService,
    private route: ActivatedRoute,
    private router: Router,
    private logger: LoggingService
  ) {
    this.repoChangeSubscription = this.phaseService.repoChanged$.subscribe((newRepo) => {
      this.initialize();
    });
  }

  ngOnInit() {
    if (this.route.snapshot.paramMap.get('name') === undefined) {
      this.logger.info('detailed-viewer: Missing username');
      this.router.navigate(['']);
    }
    this.initialize();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.repoChangeSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  initialize(): void {
    const targettedUser = this.route.snapshot.paramMap.get('name');
    this.user = null;
    this.userSubscription = this.githubService.getUsersAssignable().subscribe((users) => {
      for (const user of users) {
        if (user.login === targettedUser) {
          this.user = user;
          return;
        }
      }
      this.logger.info(`DetailedViewerComponent: User ${targettedUser} is not found`);
      this.router.navigate([Phase.issuesViewer]);
    });
  }
}
