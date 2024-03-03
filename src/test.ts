// This file is required by karma.conf.js and loads recursively all the .spec and framework files

// tslint:disable:ordered-imports
// Ordered-imports rule is disabled here because the import statement for 'zone-testing' must be
// at the top to prevent test setup breakage in 'npm run test'.
import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

declare const require: any;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
// Then we find all the tests.
const context = require.context('../tests', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
