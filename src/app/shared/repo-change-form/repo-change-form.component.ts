import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-repo-change-form',
  templateUrl: './repo-change-form.component.html',
  styleUrls: ['./repo-change-form.component.css']
})
export class RepoChangeFormComponent implements OnInit {
  public repoName: String;
  suggestions: string[];
  filteredSuggestions: Observable<string[]>;
  repoChangeForm = new FormControl();

  constructor(public dialogRef: MatDialogRef<RepoChangeFormComponent>, @Inject(MAT_DIALOG_DATA) public data) {
    this.repoName = data.repoName;
  }

  ngOnInit() {
    this.initRepoChangeForm();
  }

  private initRepoChangeForm() {
    this.suggestions = JSON.parse(window.localStorage.getItem('suggestions')) || [];
    // Ref: https://v10.material.angular.io/components/autocomplete/overview
    this.filteredSuggestions = this.repoChangeForm.valueChanges.pipe(
      startWith(''),
      map((value) => this.suggestions.filter((suggestion) => suggestion.toLowerCase().includes(value.toLowerCase())))
    );
  }
  onYesClick(): void {
    this.dialogRef.close(this.repoName);
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
