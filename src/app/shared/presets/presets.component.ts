import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EitherOrPreset, Preset } from '../../core/models/preset.model';
import { GroupingContextService } from '../../core/services/grouping/grouping-context.service';
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
export class PresetsComponent implements OnDestroy {
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

  onSaveButtonClicked() {
    this.promptSave();
  }

  onDeleteButtonClicked(event: MouseEvent, preset: EitherOrPreset) {
    event.preventDefault();
    event.stopPropagation();
    this.presetsService.deletePreset(preset);
  }

  promptSave() {
    const dialogRef = this.dialog.open(PresetsSavePromptComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'confirm') {
        // save the filter
        // get the URL
        // set in localstorage using filters-save.services.ts

        const groupBy = this.groupingContextService.currGroupBy;
        const preset = this.presetsService.savePreset(this.viewService.currentRepo, groupBy, result.data);
        this.presetsService.changeToPreset(preset);
      }
    });
  }

  // on select
  onOptionSelected(event: MatSelectChange) {
    const preset = event.value;
    if (preset) {
      this.logger.info(`PresetComponent: Changing to preset`, preset);
      this.presetsService.changeToPreset(preset);
    } else {
      this.logger.warn(`PresetComponent: Preset not found`);
    }
  }

  onSelectOpened(event: boolean) {
    this.isMenuOpen = event;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
