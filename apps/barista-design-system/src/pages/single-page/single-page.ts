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

import { Component } from '@angular/core';
import { BaPageService } from '../../shared/services/page.service';
import { Router } from '@angular/router';
// import {
//   BaSinglePageContent,
//   BaIconOverviewPageContent,
// } from '@dynatrace/shared/barista-definitions';

@Component({
  selector: 'ba-single-page',
  templateUrl: 'single-page.html',
  styleUrls: ['single-page.scss'],
  host: {
    class: 'ba-page',
  },
})
export class BaSinglePage {

  // Yes, this should definitely not be any...
  // TODO: how to solve the problem with having 2 very different types for the page content?
  content = this._pageService._getCurrentPage() as any;

  /** @internal Whether the page is the icon overview page */
  _isIconOverview = this._router.url.startsWith('/resources/icons');

  constructor(private _router: Router, private _pageService: BaPageService) {
  }

}
