import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import * as d3Timelines from 'd3-timelines';
import * as d3Time from 'd3-time';
import * as d3TimeFormat from 'd3-time-format';
import { TimelineItem } from '../../core/models/timeline-item.model';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit, OnChanges {
  @Input() data?: TimelineItem[];
  svg: any;
  // beginTime?: string;
  // endTime?: string;

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

  public display() {
    // Remove previous timeline
    if (this.svg) {
      this.svg.remove();
    }

    // const xScale = d3.scaleTime()
    // .domain([new Date("2014-01-01"), new Date("2016-01-01")])
    // .range([0, 500]);

    // const xAxis = d3.axisBottom(xScale)

    const chart = d3Timelines
      .timelines()
      // .beginning(1355752800000) // we can optionally add beginning and ending times to speed up rendering a little
      // .ending(1355774400000)
      // .showTimeAxisTick() // toggles tick marks
      .tickFormat({
        format: d3TimeFormat.timeFormat('%b %Y'),
        tickTime: d3Time.timeMonth,
        tickInterval: 1,
        tickSize: 6
      })
      .showToday()
      .stack() // toggles graph stacking
      .margin({ left: 70, right: 30, top: 0, bottom: 0 });

    this.svg = d3.select('#timeline').append('svg');

    this.svg.datum(this.data).call(chart);
  }
}
