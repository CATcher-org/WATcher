import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../presets.component';

@Component({
  selector: 'app-presets-save-prompt',
  templateUrl: './presets-save-prompt.component.html',
  styleUrls: ['./presets-save-prompt.component.css']
})
export class PresetsSavePromptComponent implements OnInit {
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PresetsSavePromptComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      label: ['', Validators.required],
      isGlobal: [false]
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();

    if (this.form.valid) {
      console.log(this.form.value);
      this.dialogRef.close({ action: 'confirm', data: this.form.value });
    }
    // this.dialogRef.close({ action: 'confirm' });
  }
}
