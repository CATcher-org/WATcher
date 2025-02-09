import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preset } from '../models/preset.model';
import { Repo } from '../models/repo.model';
import { FiltersService } from './filters.service';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root'
})
export class PresetsService implements OnInit {
  static readonly KEY_NAME = 'savedPresets';

  savedPresets = new Map<string, Preset[]>();
  currentPreset: Preset;

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

  ngOnInit(): void {
    // subscribe to the filters.
    // if the filters change AND it's not a preset, then the currentPreset should be undefined
    this.filter.filter$.subscribe((filter) => {
      // if we're already in a preset, don't run
      if (this.currentPreset) {
        return;
      } // prevents infinite loop when preset applies filters --> this runs --> preset is updated again
      const preset = this.availablePresets$.value.find((p) => FiltersService.isEqual(p.filter, filter));

      if (!preset) {
        this.currentPreset = undefined;
      } else {
        console.log('Preset found', { filter });
        this.currentPreset = preset;
      }
    });
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

    this.availablePresets$.next(presets);

    this.writeSavedPresets();

    this.changeToPreset(preset);
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
    this.currentPreset = preset;
  }

  public deleteCurrentPreset() {
    const repoKey = this.currentPreset.repo.toString();
    const presets = this.savedPresets.get(repoKey) || [];

    const newPresets = presets.filter((p) => p.id !== this.currentPreset.id);
    this.savedPresets.set(repoKey, newPresets);

    this.availablePresets$.next(newPresets);

    console.log({ repoKey, presets, newPresets });
    this.currentPreset = undefined;

    this.writeSavedPresets();
  }
}
