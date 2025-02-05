import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ViewService } from './view.service';
import { Repo } from '../models/repo.model';
import { Preset } from '../models/preset.model';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root'
})
export class PresetsService {
  static readonly KEY_NAME = 'savedPresets';

  savedPresets = new Map<string, Preset[]>();
  availablePresets: Preset[] = []; // the presets for this repo
  currentPreset: Preset;

  constructor(private logger: LoggingService) {
    // this.suggestions = JSON.parse(window.localStorage.getItem(FiltersSaveService.KEY_NAME)) || [];

    // if savedFilters doesn't exist, initialize it to an empty object
    if (!window.localStorage.getItem(PresetsService.KEY_NAME)) {
      window.localStorage.setItem(PresetsService.KEY_NAME, JSON.stringify([]));
    }
  }

  /**
   * Load any saved filters from the given repository, if the key exists.
   * If the key doesn't exist, do nothing.
   * @param repo
   */
  loadSavedPresets(repo: Repo) {
    const repoKey = repo.toString();
    this.availablePresets = this.savedPresets.get(repoKey) || [];

    this.logger.info(`PresetsService: Loaded ${this.availablePresets.length} presets for ${repoKey}`);
  }

  savePreset(repo: Repo, preset: Preset) {
    const repoKey = repo.toString();
    const presets = this.savedPresets.get(repoKey) || [];
    presets.push(preset);
    this.savedPresets.set(repoKey, presets);

    this.logger.info(`PresetsService: Saved preset for ${repoKey}`);
  }
}
