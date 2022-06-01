import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { D3Service, ForceDirectedGraph } from '../../d3';

@Component({
  selector: 'app-d3-graph',
  template: `
    <svg #svg [attr.width]="_options.width" [attr.height]="_options.height">
      <g>
        <g [linkVisual]="link" *ngFor="let link of links"></g>
        <g [nodeVisual]="node" *ngFor="let node of nodes"></g>
      </g>
    </svg>
  `,
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, AfterViewInit {
  @Input() nodes;
  @Input() links;

  graph: ForceDirectedGraph;

  private _options: { width; height } = { width: 800, height: 600 };

  constructor(private d3Service: D3Service) {}

  ngOnInit() {
    /** Receiving an initialized simulated graph from our custom d3 service */
    this.graph = this.d3Service.getForceDirectedGraph(this.nodes, this.links, this.options);
  }

  ngAfterViewInit() {
    this.graph.initSimulation(this.options);
  }

  get options() {
    return (this._options = {
      width: window.innerWidth,
      height: window.innerHeight
    });
  }
}
