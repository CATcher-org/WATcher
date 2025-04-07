import { NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';
import { PresetsSavePromptComponent } from './presets-save-prompt/presets-save-prompt.component';
import { PresetsComponent } from './presets.component';

@NgModule({
  imports: [SharedModule],
  declarations: [PresetsComponent, PresetsSavePromptComponent],
  exports: [PresetsComponent]
})
export class PresetsModule {}
