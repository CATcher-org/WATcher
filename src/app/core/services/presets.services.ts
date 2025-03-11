import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preset } from '../models/preset.model';
import { Repo } from '../models/repo.model';
import { Filter, FiltersService } from './filters.service';
import { LoggingService } from './logging.service';
import { GroupBy, GroupingContextService } from './grouping/grouping-context.service';

@Injectable({
  providedIn: 'root'
})
export class PresetsService {
  static readonly KEY_NAME = 'savedPresets';
  static readonly GLOBAL_NAME = 'globalPresets';

  savedPresets = new Map<string, Preset[]>(); // Complete list of all saved presets, keyed by repo.
  currentPreset: Preset = undefined;

  public availablePresets$ = new BehaviorSubject<Preset[]>([]); // Repository-specific presets available for the current repo
  public globalPresets$ = new BehaviorSubject<Preset[]>([]); // Global presets available for all repos

  constructor(private logger: LoggingService, private filter: FiltersService, private groupingContextService: GroupingContextService) {
    // Load saved presets from local storage
    const rawRepoPresets = window.localStorage.getItem(PresetsService.KEY_NAME);
    const rawGlobalPresets = window.localStorage.getItem(PresetsService.GLOBAL_NAME);

    // convert the raw json into a map of presets
    if (rawRepoPresets) {
      const mapArray = JSON.parse(rawRepoPresets);
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

    // convert the global presets into an array of presets
    if (rawGlobalPresets) {
      const globalPresets = JSON.parse(rawGlobalPresets).map((obj) => Preset.fromObject(obj));
      this.globalPresets$.next(globalPresets);
    } else {
      this.globalPresets$.next([]);
    }

    this.logger.info(`PresetsService: Loaded presets from local storage`, this.savedPresets);

    // Initialize subscription to filters to check if this is a global preset or a local preset
    this.filter.filter$.subscribe((filter) => {
      // check to see if it's a local preset first
      const localPreset = this.availablePresets$.value.find(
        (p) => FiltersService.isPartOfPreset(filter, p) && this.groupingContextService.currGroupBy === p.groupBy
      );
      if (localPreset) {
        this.logger.info(`PresetsService: Found a matching local preset from a change in filters`, localPreset);
        this.currentPreset = localPreset;

        return;
      }

      const globalPreset = this.globalPresets$.value.find(
        (p) => FiltersService.isPartOfPreset(filter, p) && this.groupingContextService.currGroupBy === p.groupBy
      );
      if (globalPreset) {
        this.logger.info(`PresetsService: Found a matching global preset from a change in filters`, globalPreset);
        this.currentPreset = globalPreset;

        return;
      }

      // No matching preset
      this.currentPreset = undefined;
    });

    // Note: I wrote the below code as I thought we need to refresh the currently active preset when the groupBy changes.
    // However, it turns out that changing the group by pushes an update to the filter observable, which triggers the above subscription to run.
    // Hence, the below is actually not needed.

    // this.groupingContextService.currGroupBy$.subscribe((groupBy) => {
    //   // check to see if it's a local preset first
    //   const localPreset = this.availablePresets$.value.find((p) => FiltersService.isPartOfPreset(this.filter.filter$.value, p) && this.groupingContextService.currGroupBy === p.groupBy);
    //   if (localPreset) {
    //     this.logger.info(`PresetsService: Found a matching local preset from a change in groupBy`, localPreset);
    //     this.currentPreset = localPreset;

    //     return;
    //   }

    //   const globalPreset = this.globalPresets$.value.find((p) => FiltersService.isPartOfPreset(this.filter.filter$.value, p) && this.groupingContextService.currGroupBy === p.groupBy);
    //   if (globalPreset) {
    //     this.logger.info(`PresetsService: Found a matching global preset from a change in groupBy`, globalPreset);
    //     this.currentPreset = globalPreset;

    //     return;
    //   }

    //   // No matching preset
    //   this.currentPreset = undefined;
    // })
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
    // concat global presets with repo-specific presets
    const repoPresets = this.savedPresets.get(repo.toString()) || [];
    return repoPresets;
  }

  /**
   *
   * @param repo The repo this preset is for. TODO: Do we want to just reference the repo object?
   * @param preset The preset to save. TODO: Do we want to just reference the filter object?
   */
  public savePreset(
    repo: Repo,
    groupBy: GroupBy,
    data: {
      label: string;
      isGlobal: boolean;
    }
  ): Preset {
    const repoKey = repo.toString();
    const { label, isGlobal } = data;
    const filter: Filter = { ...this.filter.filter$.value };

    // For Global Presets, we save them under the "global" key.
    if (isGlobal) {
      const preset = new Preset({ repo, filter, label, id: Date.now().toString(), isGlobal, groupBy });
      const existingGlobalPresets = this.globalPresets$.value;
      const globalPresets = [...existingGlobalPresets, preset];
      // this.savedPresets.set('global', globalPresets); // update the existing presets

      this.logger.info(`PresetsService: Saved global preset`, { preset });
      this.globalPresets$.next(globalPresets);

      this.writeSavedPresets();

      // this.changeToPreset(preset);
      return preset;
    } else {
      const presets = this.savedPresets.get(repoKey) || [];

      const preset = new Preset({ repo, filter, label, id: Date.now().toString(), isGlobal, groupBy });
      presets.push(preset);
      this.savedPresets.set(repoKey, presets); // update the existing presets

      this.logger.info(`PresetsService: Saved preset for ${repoKey}`);

      this.availablePresets$.next(presets);

      this.writeSavedPresets();

      // this.changeToPreset(preset);
      return preset;
    }
  }

  /**
   * Saves the current presets (held in savedPresets) to localStorage.
   */
  private writeSavedPresets() {
    this.logger.info(`PresetsService: Saved to local storage`, this.savedPresets);

    const stringifiedPresets = JSON.stringify(Array.from(this.savedPresets.entries()), (key, value) =>
      value instanceof Set ? Array.from(value) : value
    );

    window.localStorage.setItem(PresetsService.KEY_NAME, stringifiedPresets);
    window.localStorage.setItem(PresetsService.GLOBAL_NAME, JSON.stringify(this.globalPresets$.value));
  }

  public getPresetById(repo: Repo, id: string): Preset | undefined {
    const presets = this.savedPresets.get(repo.toString()) || [];
    return presets.find((p) => p.id === id);
  }

  public changeToPreset(preset: Preset) {
    // TODO: move PresetViews to this service
    this.filter.updatePresetView('custom');

    // if (preset.isGlobal) {
    //   // delete the repo-specific filters
    //   delete preset.filter.milestones;
    //   delete preset.filter.assignees;
    //   delete preset.filter.labels;
    //   delete preset.filter.hiddenLabels;
    // }

    // copy the filter into a new object so it is not a refernnce
    const newFilter = FiltersService.createDeepCopy(preset.filter);

    this.logger.info(`PresetsService: Changing to preset`, preset);

    this.filter.updateFilters(newFilter);
    this.groupingContextService.setCurrentGroupingType(preset.groupBy);
    this.currentPreset = preset;
  }

  public deleteCurrentPreset() {
    if (this.currentPreset.isGlobal) {
      const globalPresets = this.globalPresets$.value;

      const newPresets = globalPresets.filter((p) => p.id !== this.currentPreset.id);

      this.globalPresets$.next(newPresets);
    } else {
      const repoKey = this.currentPreset.repo.toString();
      const presets = this.savedPresets.get(repoKey) || [];

      const newPresets = presets.filter((p) => p.id !== this.currentPreset.id);
      this.savedPresets.set(repoKey, newPresets);

      this.availablePresets$.next(newPresets);
    }
    this.currentPreset = undefined;

    this.writeSavedPresets();
  }
}
