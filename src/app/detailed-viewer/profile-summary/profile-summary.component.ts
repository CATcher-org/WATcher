import { Component, Input, OnInit } from '@angular/core';
import { UserStats } from '../profile-details/profile-details.component';

@Component({
  selector: 'app-profile-summary',
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.css']
})
export class ProfileSummaryComponent implements OnInit {
  @Input() stats: UserStats;

  constructor() {}

  ngOnInit(): void {}
}
