import { Component, OnInit } from '@angular/core';
import { GithubService } from '../core/services/github.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-activity-dashboard',
  templateUrl: './activity-dashboard.component.html',
  styleUrls: ['./activity-dashboard.component.css']
})
export class ActivityDashboardComponent implements OnInit {
  log: any;

  constructor(private githubService: GithubService) {}

  ngOnInit() {
    this.print();
  }

  print() {
    console.log('Print triggered');
    this.githubService.fetchEventsForRepo().subscribe((x) => {
      this.log = x;
    });
  }

  printE() {
    console.log('PrintE triggered');
    this.githubService.fetchAllEventsForRepo().subscribe((x) => {
      this.log = x;
    });
  }
}
