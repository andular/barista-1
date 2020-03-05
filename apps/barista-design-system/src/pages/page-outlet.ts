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

import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  Injector,
  Input,
  ViewContainerRef,
  ChangeDetectorRef,
} from '@angular/core';

import {
  BaPageMetaBase,
  BaSinglePageContent,
} from '@dynatrace/shared/barista-definitions';
import { BaIndexPage } from './index-page/index-page';
import { BaOverviewPage } from './overview-page/overview-page';
import { BaSinglePage } from './single-page/single-page';
import { BaIconOverviewPage } from './icon-overview-page/icon-overview-page';
import { BaErrorPage } from './error-page/error-page';
import { BaSearchPage } from './search-page/search-page';
import { ActivatedRouteSnapshot } from '@angular/router';
import { BaPageService } from '../shared/services/page.service';

const LAYOUT_PAGES_MAPPING = {
  default: BaSinglePage,
  overview: BaOverviewPage,
  iconOverview: BaIconOverviewPage,
  index: BaIndexPage,
  error: BaErrorPage,
  search: BaSearchPage,
};

/**
 * Pages that should be rendered via the ba-page-outlet
 * have to implement the BaPage interface.
 */
export interface BaPage {
  contents: BaPageMetaBase;
}

@Component({
  selector: 'ba-page-outlet',
  template: '',
  styleUrls: ['page-outlet.scss'],
  host: {
    class: 'ba-page',
  },
})
export class BaPageOutlet {
  /** Reference to the current page component. */
  private _currentPageComponentRef: ComponentRef<BaPage>;

  /** Data needed to render the page. */
  @Input()
  set content(value: BaPageMetaBase) {
    // Ignore `undefined` values that could happen if the host component
    // does not initially specify a value for the `doc` input.
    if (value) {
      this._createPage(value);
    }
  }

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _viewContainerRef: ViewContainerRef,
    private _injector: Injector,
    private _elementRef: ElementRef<HTMLElement>,
    private _route: ActivatedRouteSnapshot,
    private _pageService: BaPageService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    console.log('init page outlet');
    const pageKey = this._route.url.join('/');
    console.log(pageKey);
    const page = this._pageService._cache.get(pageKey);
    // if (page) {
    //   this._renderPage(page);
    // }
  }

  ngOnDestroy(): void {
    if (this._currentPageComponentRef) {
      this._currentPageComponentRef.destroy();
    }
  }

  // private _renderPage(page: BaSinglePageContent) {
  //   const layout = LAYOUT_PAGES_MAPPING[page.layout || 'default'];
  //   const componentFactory = this._componentFactoryResolver.resolveComponentFactory(
  //     layout
  //   );
  //   this._currentPageComponentRef = componentFactory.create(this._injector) as ComponentRef<BaPage>;
  //   this._currentPageComponentRef.instance.contents = page.content;

  //   this._container.insert(this._currentPageComponentRef.hostView);
  //   this._changeDetectorRef.markForCheck();
  // }

  /** Dynamically creates a new page component and adds it to the DOM. */
  // TODO: Can be removed?
  private _createPage(contents: BaPageMetaBase): void {
    this._destroyPage();

    const pageTypeComponent = contents.layout
      ? LAYOUT_PAGES_MAPPING[contents.layout] || LAYOUT_PAGES_MAPPING.default
      : LAYOUT_PAGES_MAPPING.default;

    const componentFactory = this._componentFactoryResolver.resolveComponentFactory<
      BaPage
    >(pageTypeComponent);

    const componentRef = this._viewContainerRef.createComponent<BaPage>(
      componentFactory,
      this._viewContainerRef.length,
      this._injector,
    );
    componentRef.instance.contents = contents;

    // At this point the component has been instantiated, so we move it to the location in the DOM
    // where we want it to be rendered.
    this._elementRef.nativeElement.appendChild(
      this._getComponentRootNode(componentRef),
    );

    this._currentPageComponentRef = componentRef;

    // Reset scroll position on new page load.
    if (window) {
      window.scrollTo({
        top: 0,
      });
    }
  }

  /** Destroys page that should be replaced by a new one. */
  private _destroyPage(): void {
    if (this._currentPageComponentRef) {
      this._currentPageComponentRef.destroy();
    }
  }

  /** Gets the root HTMLElement for an instantiated component. */
  private _getComponentRootNode(
    componentRef: ComponentRef<BaPage>,
  ): HTMLElement {
    return (componentRef.hostView as EmbeddedViewRef<BaPage>)
      .rootNodes[0] as HTMLElement;
  }
}
