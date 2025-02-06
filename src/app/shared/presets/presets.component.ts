import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Preset } from '../../core/models/preset.model';
import { LoggingService } from '../../core/services/logging.service';
import { PresetsService } from '../../core/services/presets.services';
import { ViewService } from '../../core/services/view.service';
import { PresetsSavePromptComponent } from './presets-save-prompt/presets-save-prompt.component';

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
export class PresetsComponent implements OnInit, OnDestroy {
  constructor(
    private logger: LoggingService,
    public dialog: MatDialog,
    private presetsService: PresetsService,
    private viewService: ViewService
  ) {}

  selected = '';

  isChecked = false;

  label = '';

  availablePresets: Preset[] = [];

  selectedPresetId = '';
  private unsubscribe$ = new Subject<void>();
  /**
   * Ask the user to save
   */
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

  // on select
  onOptionSelected(event: MatSelectChange) {
    const changeToPresetId = event.value;
    // todo: handle case where deselect
    const preset = this.availablePresets.find((p) => p.id === changeToPresetId);

    if (preset) {
      this.presetsService.changeToPreset(preset);
    } else {
      this.logger.warn(`PresetComponent: Preset with id ${changeToPresetId} not found`);
    }
  }

  ngOnInit(): void {
    // this.availablePresets = this.presetsService.getSavedPresetsForCurrentRepo(this.viewService.currentRepo);
    this.presetsService.availablePresets$.pipe(takeUntil(this.unsubscribe$)).subscribe((availablePresets) => {
      // Optionally filter them by the current repo

      this.availablePresets = availablePresets;
    });

    // For an initial fetch (in case you have data from the start)
    this.availablePresets = this.presetsService.getSavedPresetsForCurrentRepo(this.viewService.currentRepo);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
