import { Injectable } from '@angular/core';
import { ForceDirectedGraph, Link, Node } from './models';

@Injectable()
export class D3Service {
  /** This service will provide methods to enable user interaction with elements
   * while maintaining the d3 simulations physics
   * https://medium.com/netscape/visualizing-data-with-angular-and-d3-209dde784aeb
   */

  constructor() {}

  /** A method to bind a pan and zoom behaviour to an svg element */
  applyZoomableBehaviour() {}

  /** A method to bind a draggable behaviour to an svg element */
  applyDraggableBehaviour() {}

  /** The interactable graph we will simulate in this article
   * This method does not interact with the document, purely physical calculations with d3
   */
  getForceDirectedGraph(nodes: Node[], links: Link[], options: { width; height }) {
    return new ForceDirectedGraph(nodes, links, options);
  }
}
