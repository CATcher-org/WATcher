import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { GithubUser } from '../../core/models/github-user.model';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { GithubEventService } from '../../core/services/githubevent.service';
import { LoggingService } from '../../core/services/logging.service';
import { EventWeekDetailsComponent } from '../event-week-details/event-week-details.component';
import { EventWeek } from '../event-week.model';
import { GithubEventDataTable } from './GithubEventDataTable';
import { NoEventsError } from './no-events-error.model';

export enum ACTION_BUTTONS {
  VIEW_IN_WEB,
  COLLAPSE
}

@Component({
  selector: 'app-event-tables',
  templateUrl: './event-tables.component.html',
  styleUrls: ['./event-tables.component.css']
})

/**
 * Angular Table Expandable Rows
 * ref: https://material.angular.io/components/table/examples#table-expandable-rows
 */
export class EventTablesComponent implements OnInit, AfterViewInit {
  @Input() columnsToDisplay: string[];
  @Input() expandedColumnsToDisplay: string[];
  @Input() actions: ACTION_BUTTONS[];
  @Input() actor?: GithubUser = undefined;
  @Input() filters?: any = undefined;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  githubEvents: GithubEventDataTable;

  public readonly action_buttons = ACTION_BUTTONS;

  constructor(
    public githubEventService: GithubEventService,
    public dialog: MatDialog,
    private logger: LoggingService,
    private errorHandling: ErrorHandlingService
  ) {}

  ngOnInit() {
    this.githubEvents = new GithubEventDataTable(this.githubEventService, this.logger, this.sort, this.paginator, this.actor, this.filters);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.githubEvents.loadEvents();
    });
  }

  reload() {
    this.githubEvents.loadEvents();
  }

  /**
   * Formats the title text to account for those that contain long words.
   * @param title - Title of Event that is to be displayed in the Table Row.
   */
  fitTitleText(title: string): string {
    // Arbitrary Length of Characters beyond which an overflow occurs.
    const MAX_WORD_LENGTH = 43;
    const SPLITTER_TEXT = ' ';
    const ELLIPSES = '...';

    return title
      .split(SPLITTER_TEXT)
      .map((word) => {
        if (word.length > MAX_WORD_LENGTH) {
          return word.substring(0, MAX_WORD_LENGTH - 5).concat(ELLIPSES);
        }
        return word;
      })
      .join(SPLITTER_TEXT);
  }

  /** Not implemented yet. */
  viewEventInBrowser(id: number, event: Event) {
    this.logger.info(`EventTablesComponent: Opening Event ${id} on Github`);
    // window.open('https://github.com/', '_blank');
  }

  /** Opens dialog to show the event details of the selected week. */
  openDialog(eventWeek: EventWeek) {
    if (eventWeek.events.length <= 0) {
      this.errorHandling.handleError(new NoEventsError());
      return;
    }
    this.dialog.open(EventWeekDetailsComponent, {
      data: {
        eventWeek,
        expandedColumnsToDisplay: this.expandedColumnsToDisplay
      }
    });
  }

  /** Returns color string of cell. Shade darkens with magnitude of number. */
  colorCell(count: number) {
    if (count === 0) {
      return 'white';
    } else if (count > 0 && count <= 5) {
      return 'pale-green';
    } else if (count > 6) {
      return 'green';
    }
  }
}
