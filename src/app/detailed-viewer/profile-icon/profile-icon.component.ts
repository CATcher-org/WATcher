import { Component, Input } from '@angular/core';

/**
 * Displays the username and the github profile icon
 */
@Component({
  selector: 'app-profile-icon',
  templateUrl: './profile-icon.component.html',
  styleUrls: ['./profile-icon.component.css']
})
export class ProfileIconComponent {
  @Input() name: string;
  @Input() avatar_url: string;

  constructor() {}
}
