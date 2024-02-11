import { Component, Input } from '@angular/core';
import { GithubLabel } from '../../../core/models/github/github-label.model';
import { LabelService } from '../../../core/services/label.service';

@Component({
  selector: 'app-issue-pr-card-labels',
  templateUrl: './issue-pr-card-labels.component.html',
  styleUrls: ['./issue-pr-card-labels.component.css']
})
export class IssuePrCardLabelsComponent {
  @Input() labels: GithubLabel[];
  @Input() labelSet: Set<string>;
  constructor(public labelService: LabelService) {}
}
