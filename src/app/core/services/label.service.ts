import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, of, Subscription, timer } from 'rxjs';
import { catchError, exhaustMap, finalize, map } from 'rxjs/operators';
import { Label } from '../models/label.model';
import { GithubService } from './github.service';

/* The threshold to decide if color is dark or light.
A higher threshold value will result in more colors determined to be "dark".
W3C recommendation is 0.179, but 0.184 is chosen so that some colors (like bright red)
are considered dark (Github too consider them dark) */
const COLOR_DARKNESS_THRESHOLD = 0.184;

const COLOR_BLACK = '000000'; // Dark color for text with light background
const COLOR_WHITE = 'ffffff'; // Light color for text with dark background

export type simplifiedLabel = {
  name: string;
  color: string;
};

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for retrieval and parsing of label data
 * from the GitHub repository for the WATcher application.
 */
export class LabelService {
  static readonly POLL_INTERVAL = 5000; // 5 seconds

  labels: Label[];
  simplifiedLabels: simplifiedLabel[];

  private labelsPollSubscription: Subscription;
  private labelsSubject = new BehaviorSubject<simplifiedLabel[]>([]);

  constructor(private githubService: GithubService) {}

  startPollLabels() {
    if (this.labelsPollSubscription === undefined) {
      this.labelsPollSubscription = timer(0, LabelService.POLL_INTERVAL)
        .pipe(
          exhaustMap(() => {
            return this.fetchLabels().pipe(
              catchError(() => {
                return EMPTY;
              })
            );
          })
        )
        .subscribe(() => {
          this.labelsSubject.next(this.simplifiedLabels);
        });
    }
  }

  stopPollLabels() {
    if (this.labelsPollSubscription) {
      this.labelsPollSubscription.unsubscribe();
      this.labelsPollSubscription = undefined;
    }
  }

  connect(): Observable<simplifiedLabel[]> {
    return this.labelsSubject.asObservable();
  }

  /**
   * Fetch labels from Github.
   */
  public fetchLabels(): Observable<any> {
    return this.githubService.fetchAllLabels().pipe(
      map((response) => {
        this.labels = this.parseLabelData(response);
        this.simplifiedLabels = this.labels.map((label) => {
          return {
            name: label.getFormattedName(),
            color: label.color
          };
        });
        this.labelsSubject.next(this.simplifiedLabels);
        return response;
      })
    );
  }

  /**
   * Parses label information and returns an array of Label objects.
   * @param labels - Label Information from API.
   */
  parseLabelData(labels: Array<any>): Label[] {
    const labelData: Label[] = [];

    for (const label of labels) {
      labelData.push(new Label(label));
    }
    return labelData;
  }

  /**
   * Returns true if the given color is considered "dark"
   * The color is considered "dark" if its luminance is less than COLOR_DARKNESS_THRESHOLD
   * @param inputColor: the color
   */
  isDarkColor(inputColor: string): boolean {
    const COLOR = inputColor.charAt(0) === '#' ? inputColor.substring(1, 7) : inputColor;
    const R = parseInt(COLOR.substring(0, 2), 16);
    const G = parseInt(COLOR.substring(2, 4), 16);
    const B = parseInt(COLOR.substring(4, 6), 16);
    const RGB = [R / 255, G / 255, B / 255];
    const LINEAR_RGB = RGB.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    // Calculate the luminance of the color
    const LUMINANCE = 0.2126 * LINEAR_RGB[0] + 0.7152 * LINEAR_RGB[1] + 0.0722 * LINEAR_RGB[2];
    // The color is "dark" if the luminance is lower than the threshold
    return LUMINANCE < COLOR_DARKNESS_THRESHOLD;
  }

  /**
   * Returns a css style for the background and text color of the label
   * @param color: the color of the label
   * @return the style with background-color in rgb
   * @throws exception if input is an invalid color code
   */
  setLabelStyle(color: string) {
    let textColor: string;

    textColor = this.isDarkColor(color) ? COLOR_WHITE : COLOR_BLACK;

    const styles = {
      'background-color': `#${color}`,
      color: `#${textColor}`
    };

    return styles;
  }

  reset() {
    this.labels = undefined;
    this.simplifiedLabels = undefined;
    this.stopPollLabels();
  }
}
