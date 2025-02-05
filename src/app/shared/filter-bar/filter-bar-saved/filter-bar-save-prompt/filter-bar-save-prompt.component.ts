import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from '../filter-bar-saved.component';

@Component({
  selector: 'app-filter-bar-save-prompt',
  templateUrl: './filter-bar-save-prompt.component.html',
  styleUrls: ['./filter-bar-save-prompt.component.css']
})
export class FilterBarSavePromptComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<FilterBarSavePromptComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit(): void {}
}
