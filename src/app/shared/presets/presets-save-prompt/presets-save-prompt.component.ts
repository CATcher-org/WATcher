import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from '../presets.component';

@Component({
  selector: 'app-presets-save-prompt',
  templateUrl: './presets-save-prompt.component.html',
  styleUrls: ['./presets-save-prompt.component.css']
})
export class PresetsSavePromptComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<PresetsSavePromptComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit(): void {}
}
