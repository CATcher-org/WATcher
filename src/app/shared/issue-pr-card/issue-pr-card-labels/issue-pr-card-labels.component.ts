import { Component, Input } from '@angular/core';
import { Label } from '../../../core/models/label.model';
import { LabelService } from '../../../core/services/label.service';

@Component({
  selector: 'app-issue-pr-card-labels',
  templateUrl: './issue-pr-card-labels.component.html',
  styleUrls: ['./issue-pr-card-labels.component.css']
})
export class IssuePrCardLabelsComponent {
  @Input() labels: Label[];
  @Input() labelSet: Set<Label>;
  constructor(public labelService: LabelService) { }
}
