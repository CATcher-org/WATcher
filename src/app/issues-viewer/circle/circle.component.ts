import { Component, Input, OnInit } from '@angular/core';
import { Issue } from '../../core/models/issue.model';

@Component({
  selector: 'app-circle',
  templateUrl: './circle.component.html',
  styleUrls: ['./circle.component.css']
})
export class CircleComponent implements OnInit {
  @Input() issue: Issue;
  @Input() color?: string;
  // @Input() size: ;?? or a variable to define what value in issue to adjust size/color by
  // e.g. documentation -> change to blue vs different colors for each assignee
  // e.g. number of comments -> bigger size vs longer time open -> bigger size

  constructor() {}

  ngOnInit() {}
}
