import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatListOption } from '@angular/material/list';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { SimplifiedLabel } from '../../../core/models/label.model';
import { LabelService } from '../../../core/services/label.service';
import { LoggingService } from '../../../core/services/logging.service';

@Component({
  selector: 'app-label-filter-bar',
  templateUrl: './label-filter-bar.component.html',
  styleUrls: ['./label-filter-bar.component.css']
})
export class LabelFilterBarComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() selectedLabels: BehaviorSubject<string[]>;
  @Input() hiddenLabels: BehaviorSubject<Set<string>>;

  labels$: Observable<SimplifiedLabel[]>;
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
}
