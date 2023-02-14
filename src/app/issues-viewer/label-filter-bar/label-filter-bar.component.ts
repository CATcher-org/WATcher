import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { LabelService } from '../../core/services/label.service';
import { LoggingService } from '../../core/services/logging.service';
import { MatListOption, MatSelectionList, MatSelectionListChange } from '@angular/material';

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
  loaded: boolean = false;

  constructor(private labelService: LabelService, private logger: LoggingService) {}

  ngOnInit() {
    this.loaded = false;
    this.load();
  }

  hide(label: string): void {
    if (this.hiddenLabelNames.has(label)) {
      return;
    }

    // unhides labels that are originally selected
    const index = this.selectedLabelNames.indexOf(label);
    console.log(this.selectedLabelNames);
    if (index != -1) {
      this.selectedLabelNames.splice(index, 1);
      this.selectedLabels.next(this.selectedLabelNames);
    }

    this.hiddenLabelNames.add(label);
    this.hiddenLabels.next(this.hiddenLabelNames);
  }

  show(label: string): void {
    if (!this.hiddenLabelNames.has(label)) {
      return;
    }
    this.hiddenLabelNames.delete(label);
    this.hiddenLabels.next(this.hiddenLabelNames);
  }

  simulateClick(el: MatListOption): void {
    if (el.disabled) {
      return;
    }
    el.toggle();
    this.selectedLabels.next(this.selectedLabelNames);
  }

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
    this.labelIndex = this.labelService.labels.map((label, index) => index);
    this.allLabels = this.labelService.labels.map((label) => {
      return {
        name: label.getFormattedName(),
        color: label.color
      };
    });
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
