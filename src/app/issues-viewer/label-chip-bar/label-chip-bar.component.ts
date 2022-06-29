import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { BehaviorSubject, Observable } from 'rxjs';
import { concatMap, exhaustMap, map, startWith } from 'rxjs/operators';
import { Label } from '../../core/models/label.model';
import { LabelService } from '../../core/services/label.service';

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
  @Output() selectedLabels: Label[];

  separatorKeysCodes: number[] = [ENTER, COMMA];
  labelCtrl = new FormControl('');
  filteredLabels: Observable<string[]>; // filtered by text in search bar
  selectedLabelNames: string[] = [];
  allLabelNames: string[];

  @ViewChild('labelInput', { static: true }) labelInput: ElementRef<HTMLInputElement>;

  constructor(private labelService: LabelService) {}

  ngOnInit(): void {
    this.labelService.fetchLabels().subscribe(
      (response) => {
        console.log(response);
      },
      (err) => {},
      () => {
        this.initialize();
      }
    );
  }

  initialize() {
    this.labels = this.labelService.labels;
    this.allLabelNames = this.labels.map((label) => label.getFormattedName());

    this.filteredLabels = this.labelCtrl.valueChanges.pipe(
      startWith(null),
      map((label: string | null) => (label ? this._filter(label) : this.allLabelNames.slice()))
    );
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (!value || !this.allLabelNames.includes(value) || this.selectedLabelNames.includes(value)) {
      return;
    }

    this.selectedLabelNames.push(value);
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
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedLabelNames.push(event.option.viewValue); // selected from dropdown
    this.labelInput.nativeElement.value = '';
    this.labelCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allLabelNames.filter((label) => label.toLowerCase().includes(filterValue));
  }
}
