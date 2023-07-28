import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { RepoUrlCacheService } from '../../core/services/repo-url-cache.service';

@Component({
  selector: 'app-repo-change-form',
  templateUrl: './repo-change-form.component.html',
  styleUrls: ['./repo-change-form.component.css']
})
export class RepoChangeFormComponent implements OnInit {
  public repoName: String;
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
    this.dialogRef.close(this.repoName);
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
