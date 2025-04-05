import { Component, Input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
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

  tooltipLabel: string | null = null;

  constructor(public labelService: LabelService) {}

  onMouseEnter(event: MouseEvent, labelName: string, tooltip: MatTooltip) {
    const element = event.target as HTMLElement;
    const span = element.querySelector('.label-text') as HTMLElement;
    if (span.scrollWidth > span.clientWidth) {
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
