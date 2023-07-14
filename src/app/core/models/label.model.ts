/**
 * Represents a label and its attributes.
 */
export class Label {
  readonly category: string;
  readonly name: string;
  color: string;
  definition?: string;

  constructor(label: { name: string; color: string; definition?: string }) {
    const containsDotRegex = /\.\b/g; // contains dot in middle of name
    [this.category, this.name] = containsDotRegex.test(label.name) ? label.name.split('.') : [undefined, label.name];
    this.color = label.color;
    this.definition = label.definition;
  }

  /**
   * Returns the name of the label with the format of
   * 'category'.'name' (e.g. severity.Low) if a category exists or
   * 'name' if the category does not exist.
   */
  public getFormattedName(): string {
    return this.category === undefined || this.category === '' ? this.name : this.category.concat('.', this.name);
  }

  public equals(label: Label) {
    return this.name === label.name && this.category === label.category;
  }
}

export type SimplifiedLabel = {
  name: string;
  color: string;
};
