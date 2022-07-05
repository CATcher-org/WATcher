import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Label } from '../../core/models/label.model';
import { LabelService } from '../../core/services/label.service';
import { LoggingService } from '../../core/services/logging.service';

@Component({
  selector: 'app-label-chip-bar',
  templateUrl: './label-chip-bar.component.html',
  styleUrls: ['./label-chip-bar.component.css']
})

/**
 * Angular Material Chips Autocomplete Example
 * ref: https://material.angular.io/components/chips/examples#chips-autocomplete
 */
export class LabelChipBarComponent implements OnInit {
  labels: Label[];
  @Input() selectedLabels: BehaviorSubject<string[]>; // array of label strings

  separatorKeysCodes: number[] = [ENTER, COMMA];
  labelCtrl = new FormControl('');
  filteredLabels: Observable<string[]>; // filtered by text in search bar
  selectedLabelNames: string[] = [];
  allLabelNames: string[];

  @ViewChild('labelInput', { static: true }) labelInput: ElementRef<HTMLInputElement>;

  constructor(private labelService: LabelService, private logger: LoggingService) {}

  ngOnInit(): void {
    this.labelService.fetchLabels().subscribe(
      (response) => {
        this.logger.debug('Fetched labels from Github: ' + response);
      },
      (err) => {},
      () => {
        this.initialize();
      }
    );
  }

  private initialize() {
    this.labels = this.labelService.labels;
    this.allLabelNames = this.labels.map((label) => label.getFormattedName());

    this.filteredLabels = this.labelCtrl.valueChanges.pipe(
      map((label: string | null) => (label ? this._filter(label) : this.allLabelNames.slice()))
    );
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (!value || !this.allLabelNames.includes(value) || this.selectedLabelNames.includes(value)) {
      return;
    }

    this.selectedLabelNames.push(value);
    this.selectedLabels.next(this.selectedLabelNames);

    if (event.input) {
      event.input.value = ''; // Clear the input value
    }

    this.labelCtrl.setValue(null);
  }

  remove(label: string): void {
    const index = this.selectedLabelNames.indexOf(label);

    if (index >= 0) {
      this.selectedLabelNames.splice(index, 1);
    }

    this.selectedLabels.next(this.selectedLabelNames);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    if (this.selectedLabelNames.includes(value)) {
      // no duplicates
      return;
    }

    this.selectedLabelNames.push(value); // selected from dropdown
    this.selectedLabels.next(this.selectedLabelNames);
    this.labelInput.nativeElement.value = '';
    this.labelCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allLabelNames.filter((label) => label.toLowerCase().includes(filterValue) && !this.selectedLabelNames.includes(label));
  }
}
