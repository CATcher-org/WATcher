import { Label } from '../../src/app/core/models/label.model';
import { LabelService } from '../../src/app/core/services/label.service';
import * as LabelConstant from '../constants/label.constants';

let labelService: LabelService;
let labelList: Label[];

describe('LabelService: parseLabelData()', () => {
  beforeAll(() => {
    labelService = new LabelService(null);
    labelList = labelService.parseLabelData(LabelConstant.SEVERITY_LABELS);
  });

  afterAll(() => {
    labelService = null;
  });

  it('should be severity very low label', () => {
    expect(labelList[0].name).toBe(LabelConstant.LABEL_NAME_SEVERITY_VERY_LOW);
    expect(labelList[0].color).toBe(LabelConstant.COLOR_SEVERITY_VERY_LOW);
    expect(labelList[0].definition).toBe(LabelConstant.DEFINITION_SEVERITY_VERY_LOW);
  });

  it('should be severity low label', () => {
    expect(labelList[1].name).toBe(LabelConstant.LABEL_NAME_SEVERITY_LOW);
    expect(labelList[1].color).toBe(LabelConstant.COLOR_SEVERITY_LOW);
    expect(labelList[1].definition).toBe(LabelConstant.DEFINITION_SEVERITY_LOW);
  });

  it('should be severity medium label', () => {
    expect(labelList[2].name).toBe(LabelConstant.LABEL_NAME_SEVERITY_MEDIUM);
    expect(labelList[2].color).toBe(LabelConstant.COLOR_SEVERITY_MEDIUM);
    expect(labelList[2].definition).toBe(LabelConstant.DEFINITION_SEVERITY_MEDIUM);
  });

  it('should be severity high label', () => {
    expect(labelList[3].name).toBe(LabelConstant.LABEL_NAME_SEVERITY_HIGH);
    expect(labelList[3].color).toBe(LabelConstant.COLOR_SEVERITY_HIGH);
    expect(labelList[3].definition).toBe(LabelConstant.DEFINITION_SEVERITY_HIGH);
  });
});

describe('LabelService: isDarkColor()', () => {
  beforeEach(() => {
    labelService = new LabelService(null);
  });

  afterEach(() => {
    labelService = null;
  });

  it('should be true for dark color', () => {
    expect(labelService.isDarkColor(LabelConstant.COLOR_BLACK)).toBeTruthy();
  });

  it('should be false for light color', () => {
    expect(labelService.isDarkColor(LabelConstant.COLOR_WHITE)).toBeFalsy();
  });
});

describe('LabelService: setLabelStyle()', () => {
  beforeEach(() => {
    labelService = new LabelService(null);
  });

  afterEach(() => {
    labelService = null;
  });

  it('should be dark color background with light color text', () => {
    expect(labelService.setLabelStyle(LabelConstant.COLOR_BLACK)).toEqual(LabelConstant.DARK_BG_LIGHT_TEXT);
  });

  it('should be light color background with dark color text', () => {
    expect(labelService.setLabelStyle(LabelConstant.COLOR_WHITE)).toEqual(LabelConstant.LIGHT_BG_DARK_TEXT);
  });
});
