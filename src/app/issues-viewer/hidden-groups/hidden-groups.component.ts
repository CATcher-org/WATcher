import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { Group } from '../../core/models/github/group.interface';
import { GroupBy, GroupingContextService } from '../../core/services/grouping/grouping-context.service';

@Component({
  selector: 'app-hidden-groups',
  templateUrl: './hidden-groups.component.html',
  styleUrls: ['./hidden-groups.component.css']
})
export class HiddenGroupsComponent {
  @Input() groups: Group[] = [];

  @ViewChild('defaultCard') defaultCardTemplate: TemplateRef<any>;
  @ViewChild('assigneeCard') assigneeCardTemplate: TemplateRef<any>;

  constructor(public groupingContextService: GroupingContextService) {}

  getCardTemplate(): TemplateRef<any> {
    switch (this.groupingContextService.currGroupBy) {
      case GroupBy.Assignee:
        return this.assigneeCardTemplate;
      default:
        return this.defaultCardTemplate;
    }
  }
}
