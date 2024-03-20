import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
  private static readonly DEFAULT_LABEL_COLOR: string = 'transparent';
  private static readonly DESELECTED_LABEL_COLOR: string = '#b00020';
  private static readonly SELECTED_LABEL_COLOR: string = '#41c300';

  labels$: Observable<SimpleLabel[]>;
  allLabels: SimpleLabel[];
  selectedLabelNames: Set<string> = new Set<string>();
  deselectedLabelNames: Set<string> = new Set<string>();
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
        this.filtersService.sanitizeLabels(this.allLabels);
        this.selectedLabelNames = new Set<string>(this.filtersService.filter$.value.labels);
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
   * Change label to the next state.
   * Label has the following state rotation: default -> selected -> deselected.
   * @param label The label to change state
   */
  changeLabelState(label: SimpleLabel) {
    if (this.selectedLabelNames.has(label.name)) {
      this.selectedLabelNames.delete(label.name);
      this.deselectedLabelNames.add(label.name);
    } else if (this.deselectedLabelNames.has(label.name)) {
      this.deselectedLabelNames.delete(label.name);
    } else {
      this.selectedLabelNames.add(label.name);
    }
    this.updateSelection();
  }

  /**
   * Returns the border color of the label.
   * The border color represents the state of the label.
   */
  getColor(label: SimpleLabel): string {
    if (this.selectedLabelNames.has(label.name)) {
      return LabelFilterBarComponent.SELECTED_LABEL_COLOR;
    } else if (this.deselectedLabelNames.has(label.name)) {
      return LabelFilterBarComponent.DESELECTED_LABEL_COLOR;
    } else {
      return LabelFilterBarComponent.DEFAULT_LABEL_COLOR;
    }
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

  updateSelection(): void {
    this.filtersService.updateFilters({
      labels: Array.from(this.selectedLabelNames),
      deselectedLabels: this.deselectedLabelNames
    });
  }

  removeAllSelection(): void {
    this.selectedLabelNames = new Set<string>();
    this.deselectedLabelNames = new Set<string>();
    this.updateSelection();
  }
}
