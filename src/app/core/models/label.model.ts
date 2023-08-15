/**
 * Represents a label and its attributes.
 */
export class Label implements SimpleLabel {
  readonly category: string;
  readonly name: string;
  readonly formattedName: string; // 'category'.'name' (e.g. severity.Low) if a category exists or 'name' if the category does not exist.
  color: string;
  definition?: string;

  constructor(label: { name: string; color: string; definition?: string }) {
    const containsDotRegex = /\.\b/g; // contains dot in middle of name
    [this.category, this.name] = containsDotRegex.test(label.name) ? label.name.split('.') : [undefined, label.name];
    this.formattedName = this.category === undefined || this.category === '' ? this.name : this.category.concat('.', this.name);
    this.color = label.color;
    this.definition = label.definition;
  }

  public equals(label: Label) {
    return this.name === label.name && this.category === label.category;
  }
}

/**
 * Represents a simplified label with name and color
 */
export type SimpleLabel = {
  formattedName: string;
  color: string;
};
