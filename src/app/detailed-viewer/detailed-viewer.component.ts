import { Component, OnInit } from '@angular/core';
import { GithubService } from '../core/services/github.service';
import { LoggingService } from '../core/services/logging.service';

@Component({
  selector: 'app-detailed-viewer',
  templateUrl: './detailed-viewer.component.html',
  styleUrls: ['./detailed-viewer.component.css']
})
export class DetailedViewerComponent implements OnInit {
  constructor(public githubService: GithubService, private logger: LoggingService) {}

  ngOnInit() {
    this.logger.info('I was run here!');
  }
}
