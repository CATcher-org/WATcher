import { NgModule } from '@angular/core';
import { PresetsComponent } from './presets.component';
import { PresetsSavePromptComponent } from './presets-save-prompt/presets-save-prompt.component';
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [SharedModule],
  declarations: [PresetsComponent, PresetsSavePromptComponent],
  exports: [PresetsComponent]
})
export class PresetsModule {}
