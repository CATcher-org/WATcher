import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { RepoUrlCacheService } from '../../core/services/repo-url-cache.service';
import { RepoChangeResponse } from '../../core/models/repo-change-response.model';

@Component({
  selector: 'app-repo-change-form',
  templateUrl: './repo-change-form.component.html',
  styleUrls: ['./repo-change-form.component.css']
})
export class RepoChangeFormComponent implements OnInit {
  public repoName: string;
  public keepFilters: boolean;
  filteredSuggestions: Observable<string[]>;
  repoChangeForm = new FormControl();

  constructor(
    public dialogRef: MatDialogRef<RepoChangeFormComponent>,
    private repoUrlCacheService: RepoUrlCacheService,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    this.repoName = data.repoName;
  }

  ngOnInit() {
    this.initRepoChangeForm();
  }

  private initRepoChangeForm() {
    this.filteredSuggestions = this.repoUrlCacheService.getFilteredSuggestions(this.repoChangeForm);
  }

  onYesClick(): void {
    const response: RepoChangeResponse = {
      repo: this.repoName,
      keepFilters: this.keepFilters,
      changeRepo: true
    };
    this.dialogRef.close(response);
  }

  onNoClick(): void {
    const response: RepoChangeResponse = {
      repo: this.repoName,
      keepFilters: this.keepFilters,
      changeRepo: false
    };
    this.dialogRef.close(response);
  }
}
