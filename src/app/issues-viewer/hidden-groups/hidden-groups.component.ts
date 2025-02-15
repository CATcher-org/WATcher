import { AfterViewInit, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Group } from '../../core/models/github/group.interface';
import { GroupBy, GroupingContextService } from '../../core/services/grouping/grouping-context.service';

@Component({
  selector: 'app-hidden-groups',
  templateUrl: './hidden-groups.component.html',
  styleUrls: ['./hidden-groups.component.css']
})
export class HiddenGroupsComponent implements AfterViewInit {
  @Input() groups: Group[] = [];

  @ViewChild('defaultCard') defaultCardTemplate: TemplateRef<any>;
  @ViewChild('assigneeCard') assigneeCardTemplate: TemplateRef<any>;
  @ViewChild('milestoneCard') milestoneCardTemplate: TemplateRef<any>;

  private currentCardTemplate$ = new BehaviorSubject<TemplateRef<any>>(null);

  constructor(public groupingContextService: GroupingContextService) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.currentCardTemplate$.next(this.getCardTemplate());
    });
  }

  getCardTemplate(): TemplateRef<any> {
    switch (this.groupingContextService.currGroupBy) {
      case GroupBy.Assignee:
        return this.assigneeCardTemplate;
      case GroupBy.Milestone:
        return this.milestoneCardTemplate;
      default:
        return this.defaultCardTemplate;
    }
  }
}
