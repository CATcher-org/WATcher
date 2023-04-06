import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { GithubCommit } from '../../core/models/github/github-commit.model';

@Component({
  selector: 'app-commit-list',
  templateUrl: './commit-list.component.html',
  styleUrls: ['./commit-list.component.css']
})
export class CommitListComponent implements OnInit, AfterViewInit {
  @Input() commitList: GithubCommit[];
  @Input() listTitle: string;
  step = -1;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }
}
