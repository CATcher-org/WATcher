import { Component, Input } from '@angular/core';
import { GithubUser } from '../../core/models/github-user.model';

@Component({
  selector: 'app-hidden-users',
  templateUrl: './hidden-users.component.html'
})
export class HiddenUsersComponent {
  @Input() users: GithubUser[] = [];
}
