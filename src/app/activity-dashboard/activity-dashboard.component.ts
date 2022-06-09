import { Component, OnInit } from '@angular/core';
import { GithubService } from '../core/services/github.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GithubEventService } from '../core/services/githubevent.service';

@Component({
  selector: 'app-activity-dashboard',
  templateUrl: './activity-dashboard.component.html',
  styleUrls: ['./activity-dashboard.component.css']
})
export class ActivityDashboardComponent implements OnInit {
  log: any;
  count: any;

  constructor(private githubService: GithubService, private githubEventService: GithubEventService) {}

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
    // this.githubService.fetchEventsForRepoCall(1).subscribe((x) => {
    //   this.log = x;
    // });
    this.counter();
  }

  counter() {
    this.count = 0;
    console.log('count triggered');
    this.githubService.fetchAllEventsForRepo().subscribe((x) => {
      const y = x.reduce((accumulator, value) => accumulator.concat(value), []);
      y.forEach((_) => this.count++);
      this.log = y[0];
    });
  }
}
