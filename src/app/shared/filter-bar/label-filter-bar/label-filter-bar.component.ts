import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LabelService } from '../../../core/services/label.service';
import { LoggingService } from '../../../core/services/logging.service';

export type simplifiedLabel = {
  name: string;
  color: string;
};

@Component({
  selector: 'app-label-filter-bar',
  templateUrl: './label-filter-bar.component.html',
  styleUrls: ['./label-filter-bar.component.css']
})
export class LabelFilterBarComponent implements OnInit, OnDestroy {
  @Input() selectedLabels: BehaviorSubject<string[]>;
  @Input() hiddenLabels: BehaviorSubject<Set<string>>;
  @ViewChild(MatSelectionList) matSelectionList;

  allLabels: simplifiedLabel[];
  selectedLabelNames: string[] = [];
  hiddenLabelNames: Set<string> = new Set();
  loaded = false;

  labelSubscription: Subscription;

  constructor(private labelService: LabelService, private logger: LoggingService) {}

  ngOnInit() {
    this.loaded = false;
    this.load();
  }

  ngOnDestroy(): void {
    this.labelSubscription?.unsubscribe();
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
    this.labelSubscription = this.labelService.fetchLabels().subscribe(
      (response) => {
        this.logger.debug('LabelFilterBarComponent: Fetched labels from Github');
      },
      (err) => {},
      () => {
        this.initialize();
      }
    );
  }

  private initialize() {
    this.allLabels = this.labelService.labels.map((label) => {
      return {
        name: label.getFormattedName(),
        color: label.color
      };
    });
    this.loaded = true;
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
    this.selectedLabels.next(this.selectedLabelNames);
  }

  removeAllSelection(): void {
    this.matSelectionList.deselectAll();
    this.updateSelection();
  }
}
