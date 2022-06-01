import { Component, Input } from '@angular/core';
import { Link } from '../../d3';

@Component({
  selector: 'app-d3-link-visual',
  template: `
    <svg:line [attr.x1]="link.source.x" [attr.y1]="link.source.y" [attr.x2]="link.target.x" [attr.y2]="link.target.y"></svg:line>
  `
})
export class LinkVisualComponent {
  @Input() link: Link;
}
