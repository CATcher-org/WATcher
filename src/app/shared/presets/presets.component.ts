import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Preset } from '../../core/models/preset.model';
import { LoggingService } from '../../core/services/logging.service';
import { PresetsService } from '../../core/services/presets.services';
import { ViewService } from '../../core/services/view.service';
import { PresetsSavePromptComponent } from './presets-save-prompt/presets-save-prompt.component';
import { GroupingContextService } from '../../core/services/grouping/grouping-context.service';

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
    public presetsService: PresetsService,
    public groupingContextService: GroupingContextService,
    private viewService: ViewService
  ) {}

  selected = '';
  // public isChecked = false;
  private unsubscribe$ = new Subject<void>();
  private isMenuOpen = false;

  // selectedPresetId: string;
  /**
   * Ask the user to save
   */
  // onSaveToggleClicked(event: MatSlideToggleChange) {
  //   if (!event.checked) {
  //     this.presetsService.deleteCurrentPreset();
  //     // this.isChecked = false;
  //   } else {
  //     this.promptSave();
  //   }
  // }

  onSaveButtonClicked() {
    // if (this.presetsService.currentPreset) {
    //   this.presetsService.deleteCurrentPreset();
    //   // this.isChecked = false;
    // } else {
    //   this.promptSave();
    // }

    // allow them to save duplicates (OR NOT?)
    this.promptSave();
  }

  onDeleteButtonClicked(event: MouseEvent, preset: Preset) {
    console.log({ event, preset });
    event.preventDefault();
    event.stopPropagation();
    this.presetsService.deletePreset(preset);
  }

  promptSave() {
    const dialogRef = this.dialog.open(PresetsSavePromptComponent, {
      width: '400px'
      // height: '500px'
      // minHeight: "400px"
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'confirm') {
        // save the filter
        // get the URL
        // set in localstorage using filters-save.services.ts

        const groupBy = this.groupingContextService.currGroupBy;
        const preset = this.presetsService.savePreset(this.viewService.currentRepo, groupBy, result.data);
        this.presetsService.changeToPreset(preset);
        // update the dropdown to autoselect the new preset
        // this.selectedPresetId = preset.id
      } else {
        // reset the label
        // this.isChecked = false;
      }
    });
  }

  // on select
  onOptionSelected(event: MatSelectChange) {
    const preset = event.value;
    if (preset) {
      this.logger.info(`PresetComponent: Changing to preset`, preset);
      this.presetsService.changeToPreset(preset);
      // this.isChecked = true; // NOTE: changeToPreset() calls updateFilters() which will
      // then set isChecked to false.
      // we override this here to keep the checkbox checked.
    } else {
      this.logger.warn(`PresetComponent: Preset not found`);
    }
    // const changeToPresetId = event.value;
    // // todo: handle case where deselect
    // const preset = this.presetsService.availablePresets$.value.find((p) => p.id === changeToPresetId);

    // if (preset) {
    //   this.presetsService.changeToPreset(preset);
    //   this.isChecked = true; // NOTE: changeToPreset() calls updateFilters() which will
    //   // then set isChecked to false.
    //   // we override this here to keep the checkbox checked.
    // } else {
    //   this.logger.warn(`PresetComponent: Preset with id ${changeToPresetId} not found`);
    // }
  }

  onSelectOpened(event: boolean) {
    console.log({ event });
    this.isMenuOpen = event;
  }

  ngOnInit(): void {
    // this.availablePresets = this.presetsService.getSavedPresetsForCurrentRepo(this.viewService.currentRepo);
    // this.presetsService.availablePresets$.pipe(takeUntil(this.unsubscribe$)).subscribe((availablePresets) => {
    //   // Optionally filter them by the current repo
    //   this.availablePresets = availablePresets;
    // });
    // // For an initial fetch (in case you have data from the start)
    // this.availablePresets = this.presetsService.getSavedPresetsForCurrentRepo(this.viewService.currentRepo);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // on any modifications, reset the selected preset
  onFilterChange() {
    // this.isChecked = false;
  }
}
