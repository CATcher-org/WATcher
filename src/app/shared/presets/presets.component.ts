import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PresetsSavePromptComponent } from './presets-save-prompt/presets-save-prompt.component';
import { PresetsService } from '../../core/services/presets.services';
import { Preset } from '../../core/models/preset.model';
import { ViewService } from '../../core/services/view.service';

export interface DialogData {
  label: string;
}

/**
 * This component is abstracted out save-filter controls used by Issues-viewer
 */
@Component({
  selector: 'app-presets',
  templateUrl: './presets.component.html',
  styleUrls: ['./presets.component.css']
})
export class PresetsComponent implements OnInit {
  constructor(public dialog: MatDialog, private presetsService: PresetsService, private viewService: ViewService) {}

  selected = false;

  isChecked = false;

  label = '';

  availablePresets: Preset[] = [];

  promptTitle() {
    const dialogRef = this.dialog.open(PresetsSavePromptComponent, {
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
        this.presetsService.savePreset(this.viewService.currentRepo, result.label); // TODO: figure out why i can't use this.label.
      } else {
        // reset the label
        this.isChecked = false;
      }
    });
  }

  ngOnInit(): void {
    this.availablePresets = this.presetsService.getSavedPresetsForCurrentRepo(this.viewService.currentRepo);
  }
}
