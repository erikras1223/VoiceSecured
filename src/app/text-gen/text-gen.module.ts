
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TextGenComponent } from './text-gen.component';

@NgModule({
 
  imports: [
    CommonModule,
    FormsModule
  ], declarations: [
    TextGenComponent
  ],
  exports: [TextGenComponent],
  providers: []
})
export class TextGenModule { }