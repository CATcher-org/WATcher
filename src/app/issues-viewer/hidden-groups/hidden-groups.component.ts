import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GithubUser } from '../../core/models/github-user.model';
import { Group } from '../../core/models/github/group.interface';
import { Issue } from '../../core/models/issue.model';
import { Milestone } from '../../core/models/milestone.model';
import { AssigneeService } from '../../core/services/assignee.service';
import { GroupBy, GroupingContextService } from '../../core/services/grouping/grouping-context.service';
import { IssueService } from '../../core/services/issue.service';

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

  constructor(
    public groupingContextService: GroupingContextService,
    public assigneeService: AssigneeService,
    private issueService: IssueService
  ) {}

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

  drop(event: CdkDragDrop<Group>) {
    if (!(event.item.data instanceof Issue)) {
      return;
    }
    const issue: Issue = event.item.data;

    // If the item is being dropped in the same container, do nothing
    if (event.previousContainer === event.container) {
      return;
    }

    if (event.container.data instanceof GithubUser && event.previousContainer.data instanceof GithubUser) {
      const assigneeToRemove = event.previousContainer.data;
      const assigneeToAdd = event.container.data;
      const assignees = this.assigneeService.assignees.filter((assignee) => issue.assignees.includes(assignee.login));

      if (assigneeToRemove !== GithubUser.NO_ASSIGNEE) {
        const index = assignees.findIndex((assignee) => assignee.login === assigneeToRemove.login);
        if (index !== -1) {
          assignees.splice(index, 1);
        }
      }
      if (assigneeToAdd !== GithubUser.NO_ASSIGNEE) {
        assignees.push(assigneeToAdd);
      }

      this.issueService.updateIssue(issue, assignees, issue.milestone).subscribe();
    } else if (event.container.data instanceof Milestone) {
      // assigneeIds is a mandatory field for the updateIssue mutation
      const assignees = this.assigneeService.assignees.filter((assignee) => issue.assignees.includes(assignee.login));

      const milestoneToAdd = event.container.data;

      this.issueService.updateIssue(issue, assignees, milestoneToAdd).subscribe();
    }
  }
}
