// Label name constants
export const SEVERITY_VERY_LOW = 'Very Low';
export const SEVERITY_LOW = 'Low';
export const SEVERITY_MEDIUM = 'Medium';
export const SEVERITY_HIGH = 'High';

// Label category constants
export const CATEGORY_SEVERITY = 'severity';

// Label name constants
export const LABEL_NAME_SEVERITY_VERY_LOW = CATEGORY_SEVERITY + '.' + SEVERITY_VERY_LOW;
export const LABEL_NAME_SEVERITY_LOW = CATEGORY_SEVERITY + '.' + SEVERITY_LOW;
export const LABEL_NAME_SEVERITY_MEDIUM = CATEGORY_SEVERITY + '.' + SEVERITY_MEDIUM;
export const LABEL_NAME_SEVERITY_HIGH = CATEGORY_SEVERITY + '.' + SEVERITY_HIGH;

// Label definition constants
export const DEFINITION_SEVERITY_VERY_LOW =
  '<p>A flaw that is <mark>purely cosmetic</mark> and <mark>does not affect usage</mark>. For example, ' +
  '<ul>' +
  '<li>typo issues</li>' +
  '<li>spacing issues</li>' +
  '<li>layout issues</li>' +
  '<li>color issues</li>' +
  '<li>font issues</li>' +
  '</ul>' +
  "in the docs or the UI that doesn't affect usage.</p>";
export const DEFINITION_SEVERITY_LOW =
  '<p>A flaw that is unlikely to affect normal operations of the product. ' +
  'Appears only in very rare situations and causes a minor inconvenience only.</p>';
export const DEFINITION_SEVERITY_MEDIUM =
  '<p>A flaw that causes occasional inconvenience to some users but they can ' + 'continue to use the product.</p>';
export const DEFINITION_SEVERITY_HIGH =
  '<p>A flaw that affects most users and causes major problems for users.' + 'i.e., makes the product almost unusable for most users.</p>';

// Label color constants
export const COLOR_BLACK = '000000';
export const COLOR_WHITE = 'ffffff';
export const COLOR_SEVERITY_VERY_LOW = 'ffe0e0';
export const COLOR_SEVERITY_LOW = 'ffcccc';
export const COLOR_SEVERITY_MEDIUM = 'ff9999';
export const COLOR_SEVERITY_HIGH = 'ff6666';

// CSS style constants
export const DARK_BG_LIGHT_TEXT = {
  'background-color': `#${COLOR_BLACK}`,
  color: `#${COLOR_WHITE}`
};

export const LIGHT_BG_DARK_TEXT = {
  'background-color': `#${COLOR_WHITE}`,
  color: `#${COLOR_BLACK}`
};

// Constant array of labels for team response phase and moderation phase to simulate Github response
export const SEVERITY_LABELS = [
  {
    name: LABEL_NAME_SEVERITY_VERY_LOW,
    color: COLOR_SEVERITY_VERY_LOW,
    definition: DEFINITION_SEVERITY_VERY_LOW
  },
  {
    name: LABEL_NAME_SEVERITY_LOW,
    color: COLOR_SEVERITY_LOW,
    definition: DEFINITION_SEVERITY_LOW
  },
  {
    name: LABEL_NAME_SEVERITY_MEDIUM,
    color: COLOR_SEVERITY_MEDIUM,
    definition: DEFINITION_SEVERITY_MEDIUM
  },
  {
    name: LABEL_NAME_SEVERITY_HIGH,
    color: COLOR_SEVERITY_HIGH,
    definition: DEFINITION_SEVERITY_HIGH
  }
];
