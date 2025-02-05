import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilterBarSavePromptComponent } from './filter-bar-save-prompt/filter-bar-save-prompt.component';

export interface DialogData {
  label: string;
}

/**
 * This component is abstracted out save-filter controls used by Issues-viewer
 */
@Component({
  selector: 'app-filter-save',
  templateUrl: './filter-bar-saved.component.html',
  styleUrls: ['./filter-bar-saved.component.css']
})
export class FilterBarSavedComponent {
  constructor(public dialog: MatDialog) {}

  selected = false;

  isChecked = false;

  label = '';

  promptTitle() {
    const dialogRef = this.dialog.open(FilterBarSavePromptComponent, {
      width: '250px',
      data: {
        label: this.label
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');

      console.log({ result });

      if (result?.action === 'confirm') {
        // save the filter
        // get the URL
        // set in localstorage using filters-save.services.ts
      } else {
        // reset the label
        this.isChecked = false;
      }
    });
  }
}
