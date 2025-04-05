import { Component, Input } from '@angular/core';
import { GithubLabel } from '../../../core/models/github/github-label.model';
import { LabelService } from '../../../core/services/label.service';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-issue-pr-card-labels',
  templateUrl: './issue-pr-card-labels.component.html',
  styleUrls: ['./issue-pr-card-labels.component.css']
})
export class IssuePrCardLabelsComponent {
  @Input() labels: GithubLabel[];
  @Input() labelSet: Set<string>;

  tooltipLabel: string | null = null;

  constructor(public labelService: LabelService) {}

  onMouseEnter(event: MouseEvent, labelName: string, tooltip: MatTooltip) {
    const element = event.target as HTMLElement;
    if (element.scrollWidth > element.clientWidth) {
      this.tooltipLabel = labelName;

      setTimeout(() => {
        tooltip.show();
      });
    } else {
      this.tooltipLabel = null;
    }
  }

  onMouseLeave() {
    this.tooltipLabel = null;
  }
}
