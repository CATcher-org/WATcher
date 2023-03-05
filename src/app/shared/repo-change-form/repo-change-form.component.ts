import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-repo-change-form',
  templateUrl: './repo-change-form.component.html',
  styleUrls: ['./repo-change-form.component.css']
})
export class RepoChangeFormComponent {
  repoName: String;

  constructor(public dialogRef: MatDialogRef<RepoChangeFormComponent>, @Inject(MAT_DIALOG_DATA) public data) {
    this.repoName = data.repoName;
  }

  onYesClick(): void {
    this.dialogRef.close(this.repoName);
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
