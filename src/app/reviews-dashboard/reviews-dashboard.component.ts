import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { View } from '../core/models/view.model';
import { ViewService } from '../core/services/view.service';

@Component({
  selector: 'app-reviews-dashboard',
  templateUrl: './reviews-dashboard.component.html',
  styleUrls: ['./reviews-dashboard.component.css']
})
export class ReviewsDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(public viewService: ViewService) {}

  ngOnInit(): void {
    this.initialize();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  private initialize(): void {
    // Initialization logic here
    console.log('Reviews Dashboard Initialized');
  }
}
