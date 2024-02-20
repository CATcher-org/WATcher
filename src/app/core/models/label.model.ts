/**
 * Represents a label and its attributes.
 */
export class Label implements SimpleLabel {
  readonly name: string;
  color: string;
  definition?: string;

  constructor(label: { name: string; color: string; definition?: string }) {
    this.name = label.name;
    this.color = label.color;
    this.definition = label.definition;
  }
}

/**
 * Represents a simplified label with name and color
 */
export type SimpleLabel = {
  name: string;
  color: string;
};
