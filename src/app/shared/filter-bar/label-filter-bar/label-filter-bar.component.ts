import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { SimpleLabel } from '../../../core/models/label.model';
import { LabelService } from '../../../core/services/label.service';
import { LoggingService } from '../../../core/services/logging.service';
import { FiltersStore } from '../../issue-tables/FiltersStore';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-label-filter-bar',
  templateUrl: './label-filter-bar.component.html',
  styleUrls: ['./label-filter-bar.component.css']
})
export class LabelFilterBarComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() selectedLabels: BehaviorSubject<string[]>;
  @Input() hiddenLabels: BehaviorSubject<Set<string>>;
  @ViewChild(MatSelectionList) matSelectionList;

  labels$: Observable<SimpleLabel[]>;
  allLabels: SimpleLabel[];
  selectedLabelNames: string[] = [];
  hiddenLabelNames: Set<string> = new Set();
  loaded = false;

  labelSubscription: Subscription;

  constructor(private labelService: LabelService, private logger: LoggingService) {}

  ngOnInit() {
    this.loaded = false;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.load();
      this.labels$ = this.labelService.connect();
      this.labels$.subscribe((labels) => {
        this.allLabels = labels;
      });
    });
  }

  ngOnDestroy(): void {
    this.labelSubscription?.unsubscribe();
  }

  /** Use initial labels from the FiltersStore to populate hidden and selected labels */
  useInitialLabels(): void {
    const { labels: initialSelectedLabels, hiddenLabels: initialHiddenLabels } = FiltersStore.getInitialDropdownFilter();
    const allLabelsSet = new Set(this.allLabels.map((simpleLabel) => simpleLabel.formattedName));

    // Update hidden labels with initial labels from FiltersStore
    initialHiddenLabels.forEach((hiddenLabel) => {
      if (allLabelsSet.has(hiddenLabel)) {
        this.hiddenLabelNames.add(hiddenLabel);
      }
    });
    this.hiddenLabels.next(this.hiddenLabelNames);

    // Update selected labels with initial labels from FiltersStore
    initialSelectedLabels.forEach((selectedLabel) => {
      if (allLabelsSet.has(selectedLabel)) {
        this.selectedLabelNames.push(selectedLabel);
      }
    });
    this.updateSelection();
  }

  hide(label: string): void {
    if (this.hiddenLabelNames.has(label)) {
      return;
    }

    this.hiddenLabelNames.add(label);
    this.hiddenLabels.next(this.hiddenLabelNames);
  }

  /** Show labels that were hidden */
  show(label: string): void {
    if (!this.hiddenLabelNames.has(label)) {
      return;
    }
    this.hiddenLabelNames.delete(label);
    this.hiddenLabels.next(this.hiddenLabelNames);
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
    this.selectedLabels.next(this.selectedLabelNames);
  }

  /** loads in the labels in the repository */
  public load() {
    this.labelService.startPollLabels();
    this.labelSubscription = this.labelService.fetchLabels().subscribe(
      (response) => {
        this.logger.debug('LabelFilterBarComponent: Fetched labels from Github');
        // Set timeout is used to prevent ExpressionChangedAfterItHasBeenChecked Error
        setTimeout(() => this.useInitialLabels());
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
    return this.allLabels.some((label) => !this.filter(filter, label.formattedName));
  }

  updateSelection(): void {
    this.selectedLabels.next(this.selectedLabelNames);
  }

  removeAllSelection(): void {
    this.matSelectionList.deselectAll();
    this.updateSelection();
  }
}
