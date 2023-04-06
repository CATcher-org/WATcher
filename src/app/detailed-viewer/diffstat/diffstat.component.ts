import { AfterViewInit, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-diffstat',
  templateUrl: './diffstat.component.html',
  styleUrls: ['./diffstat.component.css']
})
export class DiffstatComponent implements OnInit, AfterViewInit {
  @Input() additions: number;
  @Input() deletions: number;
  @Input() boxCount: number = 6;
  changeDelta: number;
  constructor() {}

  ngOnInit(): void {
    if (this.additions + this.deletions === 0) {
      this.changeDelta = this.boxCount * 0.5;
    } else {
      this.changeDelta = (this.additions / (this.additions + this.deletions)) * this.boxCount;
    }
  }

  ngAfterViewInit(): void {}

  isAdd(i: number): boolean {
    return i + 1 <= this.changeDelta;
  }
}
