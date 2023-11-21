import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Profile } from '../../core/models/profile.model';
import { Repo } from '../../core/models/repo.model';
import { AuthService } from '../../core/services/auth.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { LoggingService } from '../../core/services/logging.service';
import { RepoSessionStorageService } from '../../core/services/repo-session-storage.service';
import { RepoUrlCacheService } from '../../core/services/repo-url-cache.service';

@Component({
  selector: 'app-session-selection',
  templateUrl: './session-selection.component.html',
  styleUrls: ['./session-selection.component.css', '../auth.component.css']
})
export class SessionSelectionComponent implements OnInit {
  isSettingUpSession: boolean;
  profileForm: FormGroup;
  repoForm: FormGroup;
  filteredSuggestions: Observable<string[]>;

  @Input() urlEncodedSessionName: string;
  @Input() urlEncodedRepo: string;

  @Output() sessionEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private formBuilder: FormBuilder,
    private logger: LoggingService,
    private authService: AuthService,
    private repoUrlCacheService: RepoUrlCacheService,
    private errorHandlingService: ErrorHandlingService,
    private repoSessionStorageService: RepoSessionStorageService
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
    const repoFormValue: string = this.repoForm.get('repo').value;

    const newRepo = Repo.of(repoFormValue);

    /**
     * Persist repo information in local browser storage
     * To retrieve after authentication redirects back to WATcher
     *
     * Since localStorage::setItem with an undefined value can result in
     * the subsequent value being stored as a string being 'undefined', check
     * if undefined before storing it. Let's reset the items before setting them.
     */

    window.localStorage.removeItem('WATcher:org');
    window.localStorage.removeItem('WATcher:dataRepo');

    if (newRepo) {
      window.localStorage.setItem('WATcher:org', newRepo.owner);
      window.localStorage.setItem('WATcher:dataRepo', newRepo.name);

      this.repoUrlCacheService.cache(newRepo.toString());
    }

    this.logger.info(`SessionSelectionComponent: Selected Repository: ${newRepo.toString()}`);

    this.authService.setRepo().subscribe((res) => {
      this.isSettingUpSession = false;
    });
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

    this.filteredSuggestions = this.repoUrlCacheService.getFilteredSuggestions(this.repoForm.get('repo'));
  }

  private autofillRepo() {
    const repoLocation = this.repoSessionStorageService.repoLocation || this.urlEncodedRepo;
    this.repoForm.get('repo').setValue(repoLocation);

    if (this.repoSessionStorageService.hasRepoLocation()) {
      this.setupSession();
    }
  }
}
