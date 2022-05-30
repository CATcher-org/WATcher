import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import * as d3Timelines from 'd3-timelines';
import { TimelineItem } from '../../core/models/timeline-item.model';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit, OnChanges {
  @Input() data?: TimelineItem[];
  // beginTime?: string;
  // endTime?: string;
  // axisTick?: boolean;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.data) {
      this.display();
    }
  }

  ngOnInit() {
    if (this.data) {
      this.display();
    }
  }

  public update(data: TimelineItem[]) {
    this.data = data;
  }

  /**
   * Returns reference to svg component that is appended to first html component
   * that matches given tag.
   */
  public display() {
    // Remove previous timeline
    d3.select('svg').remove();

    const chart = d3Timelines
      .timelines()
      // .beginning(1355752800000) // we can optionally add beginning and ending times to speed up rendering a little
      // .ending(1355774400000)
      // .showTimeAxisTick() // toggles tick marks
      .stack() // toggles graph stacking
      .margin({ left: 70, right: 30, top: 0, bottom: 0 });

    return d3
      .select('#timeline')
      .append('svg') // should I use pipe here?
      .datum(this.data)
      .call(chart);
  }
}
