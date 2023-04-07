import { AfterViewInit, Component, Input, OnInit } from '@angular/core';

/**
 * Visually displays the number of additions of lines
 * and deletions of lines along with it's corresponding ratio
 */
@Component({
  selector: 'app-diffstat',
  templateUrl: './diffstat.component.html',
  styleUrls: ['./diffstat.component.css']
})
export class DiffstatComponent implements OnInit {
  @Input() additions: number;
  @Input() deletions: number;
  @Input() boxCount = 6;
  changeDelta: number;
  constructor() {}

  ngOnInit(): void {
    if (this.additions + this.deletions === 0) {
      this.changeDelta = this.boxCount * 0.5;
    } else {
      this.changeDelta = (this.additions / (this.additions + this.deletions)) * this.boxCount;
    }
  }

  isAdd(i: number): boolean {
    return i + 1 <= this.changeDelta;
  }
}
