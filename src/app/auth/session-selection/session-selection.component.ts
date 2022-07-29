import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Profile } from '../../core/models/profile.model';
import { AuthService, AuthState } from '../../core/services/auth.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { GithubService } from '../../core/services/github.service';
import { LoggingService } from '../../core/services/logging.service';

@Component({
  selector: 'app-session-selection',
  templateUrl: './session-selection.component.html',
  styleUrls: ['./session-selection.component.css', '../auth.component.css']
})
export class SessionSelectionComponent implements OnInit {
  // isSettingUpSession is used to indicate whether WATcher is in the midst of setting up the session.
  isSettingUpSession: boolean;
  profileForm: FormGroup;
  repoForm: FormGroup;

  @Input() urlEncodedSessionName: string;
  @Input() urlEncodedRepo: string;

  @Output() sessionEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private formBuilder: FormBuilder,
    private logger: LoggingService,
    private githubService: GithubService,
    private authService: AuthService,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit() {
    this.isSettingUpSession = false;
    this.initProfileForm();
    this.initRepoForm();
    this.autofillRepo();
  }

  /**
   * Fills the login form with data from the given Profile.
   * @param profile - Profile selected by the user.
   */
  onProfileSelect(profile: Profile): void {
    this.profileForm.get('session').setValue(profile.repoName);
    this.sessionEmitter.emit(profile.repoName);
  }

  setupSession() {
    if (this.repoForm.invalid) {
      return;
    }
    this.isSettingUpSession = true;
    const repoInformation: string = this.repoForm.get('repo').value;
    const repoOrg: string = this.getOrgDetails(repoInformation);
    const repoName: string = this.getDataRepoDetails(repoInformation);

    // Persist repo information in local browser storage
    // To retrieve after authentication redirects back to WATcher
    window.localStorage.setItem('org', repoOrg);
    window.localStorage.setItem('dataRepo', repoName);

    this.logger.info(`Selected Repository: ${repoInformation}`);

    try {
      this.authService.startOAuthProcess();
    } catch (error) {
      this.errorHandlingService.handleError(error);
      this.authService.changeAuthState(AuthState.NotAuthenticated);
      this.isSettingUpSession = false;
    }
  }

  /**
   * Extracts the Organization Details from the input sessionInformation.
   * @param sessionInformation - string in the format of 'orgName/dataRepo'
   */
  private getOrgDetails(sessionInformation: string) {
    return sessionInformation.split('/')[0];
  }

  /**
   * Extracts the Data Repository Details from the input sessionInformation.
   * @param sessionInformation - string in the format of 'orgName/dataRepo'
   */
  private getDataRepoDetails(sessionInformation: string) {
    return sessionInformation.split('/')[1];
  }

  private initProfileForm() {
    this.profileForm = this.formBuilder.group({
      session: ['', Validators.required]
    });
  }

  private initRepoForm() {
    this.repoForm = this.formBuilder.group({
      repo: ['', Validators.required]
    });
  }

  private autofillRepo() {
    this.repoForm.get('repo').setValue(this.urlEncodedRepo);
  }
}
