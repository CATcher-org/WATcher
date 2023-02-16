import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatListOption } from '@angular/material';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { LabelService } from '../../core/services/label.service';
import { LoggingService } from '../../core/services/logging.service';

type simplifiedLabel = {
  name: string;
  color: string;
};

@Component({
  selector: 'app-label-filter-bar',
  templateUrl: './label-filter-bar.component.html',
  styleUrls: ['./label-filter-bar.component.css']
})
export class LabelFilterBarComponent implements OnInit {
  @Input() selectedLabels: BehaviorSubject<string[]>;
  @Input() hiddenLabels: BehaviorSubject<Set<string>>;

  allLabels: simplifiedLabel[];
  labelIndex: number[];
  filteredLabelIndexes: Observable<number[]>;
  selectedLabelNames: string[] = [];
  hiddenLabelNames: Set<string> = new Set();
  labelCtrl = new FormControl('');
  loaded = false;

  constructor(private labelService: LabelService, private logger: LoggingService) {}

  ngOnInit() {
    this.loaded = false;
    this.load();
  }

  hide(label: string): void {
    if (this.hiddenLabelNames.has(label)) {
      return;
    }

    /** unhides labels that are originally selected */
    const index = this.selectedLabelNames.indexOf(label);
    if (index !== -1) {
      this.selectedLabelNames.splice(index, 1);
      this.selectedLabels.next(this.selectedLabelNames);
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
    this.labelService.fetchLabels().subscribe(
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
    this.labelIndex = [...this.labelService.labels.keys()];
    this.allLabels = this.labelService.labels.map((label) => {
      return {
        name: label.getFormattedName(),
        color: label.color
      };
    });
    /**
     * initializing labelCtrl with initial value of '' allows filteredLabelIndexes
     * to initialize with the labelIndex values instead of starting with an empty list
     * This prevents the menu to display empty list when first opened by the user
     */
    this.filteredLabelIndexes = this.labelCtrl.valueChanges.pipe(
      startWith(''),
      map((label: string | null) => (label ? this._filter(label) : this.labelIndex))
    );
    this.loaded = true;
  }

  private _filter(value: string): number[] {
    const filterValue = value.toLowerCase();

    return this.labelIndex.filter((index) => this.allLabels[index].name.toLowerCase().includes(filterValue));
  }
}
