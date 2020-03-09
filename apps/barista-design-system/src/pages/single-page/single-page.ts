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

import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, Inject, OnInit, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import {
  BaPageLayoutType,
  BaSinglePageContent,
} from '@dynatrace/shared/barista-definitions';
import { BaPageService } from '../../shared/services/page.service';
import { BaRecentlyOrderedService } from '../../shared/services/recently-ordered.service';
import { applyTableDefinitionHeadingAttr } from '../../utils/apply-table-definition-headings';

@Component({
  selector: 'ba-single-page',
  templateUrl: 'single-page.html',
  styleUrls: ['single-page.scss'],
  host: {
    class: 'ba-page',
  },
})
export class BaSinglePage implements OnInit, AfterViewInit {
  content = this._pageService._getCurrentPage();

  /** @internal Whether the page is the icon overview page */
  _isIconOverview = this._isIconOverviewPage();

  constructor(
    private _router: Router,
    private _pageService: BaPageService<BaSinglePageContent>,
    private _recentlyOrderedService: BaRecentlyOrderedService,
    @Inject(DOCUMENT) private _document: any,
  ) {}

  ngOnInit(): void {
    if (this.content && this.content?.layout !== BaPageLayoutType.Icon) {
      this._recentlyOrderedService.savePage(this.content, this._router.url);
    }
  }

  ngAfterViewInit(): void {
    const allTables = Array.prototype.slice.call(
      this._document.querySelectorAll('table'),
    );

    /** Add data attributes to all tables, to apply responsive behavior of the tables. */
    for (const table of allTables) {
      applyTableDefinitionHeadingAttr(table);
    }
  }

  /**
   * @internal
   * Checks whether the page is the icon overview page
   * based on the current URL.
   */
  private _isIconOverviewPage(): boolean {
    // we're on the icon overview page if the URL starts with
    // "/resources/icons" and does not continue with another
    // slash and letters (that would be a subpage)
    return (
      this._router.url.startsWith('/resources/icons') &&
      !this._router.url.match(/^\/resources\/icons\/[A-Za-z]+/m)
    );
  }
}
