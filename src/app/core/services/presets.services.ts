import { Injectable } from '@angular/core';
import { Preset } from '../models/preset.model';
import { Repo } from '../models/repo.model';
import { FiltersService } from './filters.service';
import { LoggingService } from './logging.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PresetsService {
  static readonly KEY_NAME = 'savedPresets';

  savedPresets = new Map<string, Preset[]>();
  currentPreset = Preset;

  public availablePresets$ = new BehaviorSubject<Preset[]>([]);

  constructor(private logger: LoggingService, private filter: FiltersService) {
    // this.suggestions = JSON.parse(window.localStorage.getItem(FiltersSaveService.KEY_NAME)) || [];

    // if savedFilters doesn't exist, initialize it to an empty object
    // if (!window.localStorage.getItem(PresetsService.KEY_NAME)) {
    //   window.localStorage.setItem(PresetsService.KEY_NAME, JSON.stringify([]));
    // }

    const rawData = window.localStorage.getItem(PresetsService.KEY_NAME);
    if (rawData) {
      const mapArray = JSON.parse(rawData);
      const unTypedMap = new Map<string, any[]>(mapArray); // from JSON.parse(...)
      const typedMap = new Map<string, Preset[]>();

      unTypedMap.forEach((arrayOfObjs, key) => {
        // Convert each object in the array into a Preset
        const presetArr = arrayOfObjs.map((obj) => Preset.fromObject(obj));
        typedMap.set(key, presetArr);
      });

      this.savedPresets = typedMap;
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

    this.availablePresets$.next(this.getSavedPresetsForCurrentRepo(repo));

    this.logger.info(`PresetsService: Loaded ${this.availablePresets$.value.length} presets for ${repoKey}`);
  }

  getSavedPresetsForCurrentRepo(repo: Repo): Preset[] {
    return this.savedPresets.get(repo.toString()) || [];
  }

  /**
   *
   * @param repo The repo this preset is for. TODO: Do we want to just reference the repo object?
   * @param preset The preset to save. TODO: Do we want to just reference the filter object?
   */
  public savePreset(repo: Repo, label: string) {
    const repoKey = repo.toString();
    const presets = this.savedPresets.get(repoKey) || [];
    const filter = this.filter.filter$.value;

    console.log('Saved filter', { filter });
    const preset = new Preset(repo, filter, label);
    presets.push(preset);
    this.savedPresets.set(repoKey, presets); // update the existing presets

    this.logger.info(`PresetsService: Saved preset for ${repoKey}`);

    this.writeSavedPresets();
  }

  private writeSavedPresets() {
    this.logger.info(`PresetsService: Saved to local storage`, this.savedPresets);
    window.localStorage.setItem(PresetsService.KEY_NAME, JSON.stringify(Array.from(this.savedPresets.entries())));
  }

  public getPresetById(repo: Repo, id: string): Preset | undefined {
    const presets = this.savedPresets.get(repo.toString()) || [];
    return presets.find((p) => p.id === id);
  }

  public changeToPreset(preset: Preset) {
    // TODO: move PresetViews to this service
    this.filter.updatePresetView('custom');

    console.log({ f: preset.filter });

    this.filter.updateFilters(preset.filter);
  }
}
