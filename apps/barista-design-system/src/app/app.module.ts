/**
 * @license
 * Copyright 2020 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import {
  BrowserModule,
  BrowserTransferStateModule,
} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { DtIconModule } from '@dynatrace/barista-components/icon';
import { DtOverlayModule } from '@dynatrace/barista-components/overlay';
import { DtTagModule } from '@dynatrace/barista-components/tag';
import { DtThemingModule } from '@dynatrace/barista-components/theming';
import { environment } from '../environments/environment';
import { BaFooter } from '../shared/components/footer';
import { BaNav } from '../shared/components/nav';
import { BaScrollToTop } from '../shared/components/scroll-to-top';
import { BaSidenav } from '../shared/components/sidenav';
import { BaApp } from './app';
import { BaRoutingModule } from './app.routing.module';
import { BaPageGuard } from '../shared/services/page-guard';
import { BaPageService } from '../shared/services/page.service';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule.withServerTransition({ appId: 'barista-design-system' }),
    BrowserTransferStateModule,
    HttpClientModule,
    BrowserAnimationsModule,
    DtThemingModule,
    RouterModule,
    BaRoutingModule,
    DtIconModule.forRoot({
      svgIconLocation: `${environment.deployUrl}assets/icons/{{name}}.svg`,
    }),
    DtOverlayModule,
    DtTagModule,
  ],
  declarations: [BaApp, BaScrollToTop, BaNav, BaFooter, BaSidenav],
  providers: [BaPageService, BaPageGuard],
  bootstrap: [BaApp],
})
export class AppModule {}
