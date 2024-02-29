import { Component, Input } from '@angular/core';
import { GithubUser } from '../../core/models/github-user.model';

@Component({
  selector: 'app-hidden-users',
  templateUrl: './hidden-users.component.html',
  styleUrls: ['./hidden-users.component.css']
})
export class HiddenUsersComponent {
  @Input() users: GithubUser[] = [];
}
