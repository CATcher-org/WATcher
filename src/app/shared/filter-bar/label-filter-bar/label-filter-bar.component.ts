import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { Observable, Subscription } from 'rxjs';
import { SimpleLabel } from '../../../core/models/label.model';
import { FiltersService } from '../../../core/services/filters.service';
import { LabelService } from '../../../core/services/label.service';
import { LoggingService } from '../../../core/services/logging.service';

@Component({
  selector: 'app-label-filter-bar',
  templateUrl: './label-filter-bar.component.html',
  styleUrls: ['./label-filter-bar.component.css']
})
export class LabelFilterBarComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSelectionList) matSelectionList;

  labels$: Observable<SimpleLabel[]>;
  allLabels: SimpleLabel[];
  selectedLabelNames: string[] = [];
  hiddenLabelNames: Set<string> = new Set();
  loaded = false;

  labelSubscription: Subscription;

  constructor(private labelService: LabelService, private logger: LoggingService, private filtersService: FiltersService) {}

  ngOnInit() {
    this.loaded = false;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.load();
      this.labels$ = this.labelService.connect();
      this.labels$.subscribe((labels) => {
        this.allLabels = labels;
        this.selectedLabelNames = this.filtersService.filter$.value.labels;
        this.hiddenLabelNames = this.filtersService.filter$.value.hiddenLabels;
      });
    });
  }

  ngOnDestroy(): void {
    this.labelSubscription?.unsubscribe();
  }

  hide(label: string): void {
    if (this.hiddenLabelNames.has(label)) {
      return;
    }

    this.hiddenLabelNames.add(label);
    this.filtersService.updateFilters({ hiddenLabels: this.hiddenLabelNames });
  }

  /** Show labels that were hidden */
  show(label: string): void {
    if (!this.hiddenLabelNames.has(label)) {
      return;
    }
    this.hiddenLabelNames.delete(label);
    this.filtersService.updateFilters({ hiddenLabels: this.hiddenLabelNames });
  }

  /**
   * chip as of the current project version consumes click events
   * this method is used as an workaround the issue.
   * https://github.com/angular/components/issues/19759
   */
  simulateClick(el: MatListOption): void {
    if (el.disabled) {
      return;
    }
    el.toggle();
    this.updateSelection([el]);
  }

  /** loads in the labels in the repository */
  public load() {
    this.labelService.startPollLabels();
    this.labelSubscription = this.labelService.fetchLabels().subscribe(
      (response) => {
        this.logger.debug('LabelFilterBarComponent: Fetched labels from Github');
      },
      (err) => {},
      () => {
        this.loaded = true;
      }
    );
  }

  filter(filter: string, target: string): boolean {
    return !target.toLowerCase().includes(filter.toLowerCase());
  }

  hasLabels(filter: string): boolean {
    if (this.allLabels === undefined || this.allLabels.length === 0) {
      return false;
    }
    return this.allLabels.some((label) => !this.filter(filter, label.name));
  }

  updateSelection(options: MatListOption[]): void {
    options.forEach((option) => {
      if (option.selected && !this.selectedLabelNames.includes(option.value)) {
        this.selectedLabelNames.push(option.value);
      }
      if (!option.selected && this.selectedLabelNames.includes(option.value)) {
        const index = this.selectedLabelNames.indexOf(option.value);
        this.selectedLabelNames.splice(index, 1);
      }
    });
    this.filtersService.updateFilters({ labels: this.selectedLabelNames });
  }

  removeAllSelection(): void {
    this.matSelectionList.deselectAll();
    this.selectedLabelNames = [];
    this.filtersService.updateFilters({ labels: this.selectedLabelNames });
  }
}
