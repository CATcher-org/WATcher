import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ViewService } from './view.service';
import { Repo } from '../models/repo.model';
import { Preset } from '../models/preset.model';
import { LoggingService } from './logging.service';
import { FiltersService } from './filters.service';

@Injectable({
  providedIn: 'root'
})
export class PresetsService {
  static readonly KEY_NAME = 'savedPresets';

  savedPresets = new Map<string, Preset[]>();
  availablePresets: Preset[] = []; // the presets for this repo
  currentPreset = Preset;

  constructor(private logger: LoggingService, private filter: FiltersService) {
    // this.suggestions = JSON.parse(window.localStorage.getItem(FiltersSaveService.KEY_NAME)) || [];

    // if savedFilters doesn't exist, initialize it to an empty object
    // if (!window.localStorage.getItem(PresetsService.KEY_NAME)) {
    //   window.localStorage.setItem(PresetsService.KEY_NAME, JSON.stringify([]));
    // }

    const rawData = window.localStorage.getItem(PresetsService.KEY_NAME);
    if (rawData) {
      const mapArray = JSON.parse(rawData);
      const map = new Map<string, Preset[]>(mapArray);

      this.savedPresets = map;
    } else {
      this.savedPresets = new Map<string, Preset[]>();
    }

    this.logger.info(`PresetsService: Loaded presets from local storage`, this.savedPresets);
  }

  /**
   * Load any saved filters from the given repository, if the key exists.
   * If the key doesn't exist, do nothing.
   * @param repo
   */
  loadSavedPresets(repo: Repo) {
    const repoKey = repo.toString();

    this.availablePresets = this.getSavedPresetsForCurrentRepo(repo);

    this.logger.info(`PresetsService: Loaded ${this.availablePresets.length} presets for ${repoKey}`);
  }

  getSavedPresetsForCurrentRepo(repo: Repo): Preset[] {
    return this.savedPresets.get(repo.toString()) || [];
  }

  /**
   *
   * @param repo The repo this preset is for. TODO: Do we want to just reference the repo object?
   * @param preset The preset to save. TODO: Do we want to just reference the filter object?
   */
  savePreset(repo: Repo, label: string) {
    const repoKey = repo.toString();
    const presets = this.savedPresets.get(repoKey) || [];
    const filter = this.filter.filter$.value;
    const preset = new Preset(repo, filter, label);
    presets.push(preset);
    this.savedPresets.set(repoKey, presets); // update the existing presets

    this.logger.info(`PresetsService: Saved preset for ${repoKey}`);

    this.writeSavedPresets();
  }

  writeSavedPresets() {
    this.logger.info(`PresetsService: Saved to local storage`, this.savedPresets);
    window.localStorage.setItem(PresetsService.KEY_NAME, JSON.stringify(Array.from(this.savedPresets.entries())));
  }
}
