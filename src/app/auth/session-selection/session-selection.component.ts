import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Profile } from '../../core/models/profile.model';
import { AuthService, AuthState } from '../../core/services/auth.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
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
  suggestions: string[];
  filteredSuggestions: Observable<string[]>;

  @Input() urlEncodedSessionName: string;
  @Input() urlEncodedRepo: string;

  @Output() sessionEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private formBuilder: FormBuilder,
    private logger: LoggingService,
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

    /**
     * Persist repo information in local browser storage
     * To retrieve after authentication redirects back to WATcher
     *
     * Since localStorage::setItem with an undefined value can result in
     * the subsequent value being stored as a string being 'undefined', check
     * if undefined before storing it. Let's reset the items before setting them.
     */

    window.localStorage.removeItem('org');
    window.localStorage.removeItem('dataRepo');

    if (repoOrg && repoName) {
      window.localStorage.setItem('org', repoOrg);
      window.localStorage.setItem('dataRepo', repoName);

      // Update autofill repository URL suggestions in localStorage
      if (!this.suggestions.includes(repoInformation)) {
        this.suggestions.push(repoInformation);
        window.localStorage.setItem('suggestions', JSON.stringify(this.suggestions));
      }
    }

    this.logger.info(`SessionSelectionComponent: Selected Repository: ${repoInformation}`);

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
    this.suggestions = JSON.parse(window.localStorage.getItem('suggestions')) || [];
    // Ref: https://v10.material.angular.io/components/autocomplete/overview
    this.filteredSuggestions = this.repoForm.get('repo').valueChanges
      .pipe(
        startWith(''),
        map(value => this.suggestions.filter(suggestion => suggestion.toLowerCase().includes(value.toLowerCase())))
      );
  }

  private autofillRepo() {
    this.repoForm.get('repo').setValue(this.urlEncodedRepo);
  }
}
