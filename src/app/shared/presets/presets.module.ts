import { NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';
import { PresetsComponent } from './presets.component';
import { PresetsSavePromptComponent } from './presets-save-prompt/presets-save-prompt.component';

@NgModule({
  imports: [SharedModule],
  declarations: [PresetsComponent, PresetsSavePromptComponent],
  exports: [PresetsComponent]
})
export class PresetsModule {}
