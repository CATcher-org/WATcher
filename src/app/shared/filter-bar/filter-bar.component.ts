import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DEFAULT_DROPDOWN_FILTER, DropdownFilter } from '../issue-tables/dropdownfilter';
import { BehaviorSubject } from 'rxjs';
import { Subscription } from 'apollo-angular';
import { MatSort } from '@angular/material/sort';
import { MatSelect } from '@angular/material/select';
import { LabelFilterBarComponent } from './label-filter-bar/label-filter-bar.component';
import { CardViewComponent } from 'src/app/issues-viewer/card-view/card-view.component';

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.css']
})
export class FilterBarComponent implements OnInit {
  @Input() views: Iterable<CardViewComponent>
  /** Selected dropdown filter value */
  dropdownFilter: DropdownFilter = DEFAULT_DROPDOWN_FILTER;

  /** Selected label filters, instance passed into LabelChipBar to populate */
  labelFilter$ = new BehaviorSubject<string[]>([]);
  labelFilterSubscription: Subscription;

  /** Selected label to hide */
  hiddenLabels$ = new BehaviorSubject<Set<string>>(new Set());
  hiddenLabelSubscription: Subscription;

  /** One MatSort controls all IssueDataTables */
  @ViewChild(MatSort, { static: true }) matSort: MatSort;

  @ViewChild(LabelFilterBarComponent, { static: true }) labelFilterBar: LabelFilterBarComponent;

  @ViewChild('milestoneSelectorRef', { static: false }) milestoneSelectorRef: MatSelect;

  constructor() { }

  ngOnInit(): void {
  }

}
