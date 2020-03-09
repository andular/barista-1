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

import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import {
  Compiler,
  Component,
  Input,
  NgModule,
  OnDestroy,
  OnInit,
  Type,
} from '@angular/core';
import {
  Highlighter,
  htmlRender,
  init,
  process,
  registerLanguages,
  SCSS,
  TypeScript,
  XML,
} from 'highlight-ts';
import { from, Observable, Subscription, timer } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { BaCopyToClipboardService } from '../../shared/services/copy-to-clipboard.service';
import { wrapCodeLines } from '../../utils/wrap-code-lines';

type BaSourceType = 'html' | 'ts' | 'scss';

@Component({
  selector: 'ba-live-example',
  templateUrl: 'live-example.html',
  styleUrls: ['live-example.scss'],
  host: {
    class: 'ba-live-example',
    '[class.ba-live-example-dark]': 'themedark',
    '[class.ba-live-example-full-width]': 'fullwidth',
  },
})
export class BaLiveExample implements OnInit, OnDestroy {
  /** The name of the example (class name) that will be instantiated. */
  @Input() name: string;

  /**
   * The directory inside the libs/examples/src/* where
   * the examples are located.
   * Is needed to know from which directory the example should be loaded
   * via the es6 import statement in the `_initExample` method
   */
  @Input() directory: string;

  /** Whether the example should run in the dark theme. */
  @Input()
  get themedark(): boolean {
    return this._hasThemeDark;
  }
  set themedark(value: boolean) {
    this._hasThemeDark = coerceBooleanProperty(value);
  }
  private _hasThemeDark = false;

  /** Whether the example needs the full width of barista. */
  @Input()
  get fullwidth(): boolean {
    return this._isFullWidth;
  }
  set fullwidth(value: boolean) {
    this._isFullWidth = coerceBooleanProperty(value);
  }
  private _isFullWidth = false;

  /** Whether the example needs a colored background. */
  @Input()
  get background(): boolean {
    return this._background;
  }
  set background(value: boolean) {
    this._background = coerceBooleanProperty(value);
  }
  private _background = false;

  /** The encoded html template source of the given example. */
  @Input()
  get templateSource(): string {
    return this._templateSource;
  }
  set templateSource(value: string) {
    this._templateSource = value;
    if (!this._activeTabChanged) {
      this._activeTab = 'html';
    }
    this._enhancedTemplateSource = this._enhanceCode(value, 'html');
  }
  private _templateSource: string;

  /** The encoded typescript class (component) source of the given example. */
  @Input()
  get classSource(): string {
    return this._classSource;
  }
  set classSource(value: string) {
    this._classSource = value;
    if (!this._activeTabChanged && !this._activeTab) {
      this._activeTab = 'ts';
    }
    this._enhancedClassSource = this._enhanceCode(value, 'ts');
  }
  private _classSource: string;

  /** The encoded styles source of the given example. */
  @Input()
  get stylesSource(): string {
    return this._stylesSource;
  }
  set stylesSource(value: string) {
    this._stylesSource = value;
    if (!this._activeTabChanged && !this._activeTab) {
      this._activeTab = 'scss';
    }
    this._enhancedStylesSource = this._enhanceCode(value, 'scss');
  }
  private _stylesSource: string;

  /**
   * @internal
   * The stream that holds the current component type.
   */
  example$: Observable<any>;

  /**
   * @internal
   * The currently active tab for displaying a source (html, ts or scss).
   */
  _activeTab: BaSourceType;

  /** @internal Whether the source code is expanded to its max height. */
  _isExpanded = false;

  /** @internal Whether the source code has been copied. */
  _copied = false;

  /** @internal Enhanced template source with line wrappers and code highlighting. */
  _enhancedTemplateSource: string;

  /** @internal Enhanced class source with line wrappers and code highlighting. */
  _enhancedClassSource: string;

  /** @internal Enhanced styles source with line wrappers and code highlighting. */
  _enhancedStylesSource: string;

  private _timerSubscription = Subscription.EMPTY;

  /** Whether the user has changed the active tab. */
  private _activeTabChanged = false;

  /** Highlighter for highlight-ts syntax highlighting. */
  private _highlighter: Highlighter<string>;

  constructor(
    private _compiler: Compiler,
    private _platform: Platform,
    private _ctcService: BaCopyToClipboardService,
  ) {
    registerLanguages(TypeScript, XML, SCSS);
    this._highlighter = init(htmlRender);
  }

  ngOnInit(): void {
    // TODO: remove when all our components can be rendered on the server with universal.
    // currently we have some window references (chart...). Those would break the application.
    if (this._platform.isBrowser) {
      this._initExample();
    }
  }

  ngOnDestroy(): void {
    this._timerSubscription.unsubscribe();
  }

  /** @internal Whether one of the three sources has been set. */
  _hasSources(): boolean {
    return Boolean(this.classSource || this.templateSource);
  }

  /** @internal Sets the active tab. */
  _setActiveTab(tab: BaSourceType): void {
    this._activeTab = tab;
    this._activeTabChanged = true;
  }

  /** @internal Copies content of currently active tab to clipboard. */
  _copyToClipboard(): void {
    if (this._platform.isBrowser) {
      let copySucceeded = false;
      switch (this._activeTab) {
        case 'html':
          copySucceeded = this._ctcService.copy(this._templateSource, true);
          break;
        case 'ts':
          copySucceeded = this._ctcService.copy(this._classSource, true);
          break;
        case 'scss':
          copySucceeded = this._ctcService.copy(this._stylesSource, true);
          break;
      }

      if (copySucceeded) {
        this._copySuccess();
      }
    }
  }

  /** @internal Opens this example in stackblitz. */
  _getStackblitzLink(): string {
    return `https://stackblitz.com/github/dynatrace-oss/barista-examples/tree/master/examples/${this.name}/`;
  }

  private _initExample(): void {
    this.example$ = from(
      import(`../../../../../libs/examples/src/${this.directory}/index.ts`),
    ).pipe(
      map(es6Module => getNgModuleFromEs6Module(es6Module)),
      filter(Boolean),
      switchMap((moduleType: Type<NgModule>) =>
        this._compiler.compileModuleAndAllComponentsAsync(moduleType),
      ),
      map(({ componentFactories }) => {
        return componentFactories.find(
          factory => factory.componentType.name === this.name,
        )?.componentType;
      }),
    );
  }

  /**
   * Updates value of behavior subject after
   * successful copy to clipboard action.
   */
  private _copySuccess(): void {
    this._copied = true;
    this._timerSubscription = timer(1000).subscribe(
      () => (this._copied = false),
    );
  }

  /**
   * Transforms given code by replacing empty lines,
   * and wrapping each line in a span element.
   */
  private _enhanceCode(code: string, type: BaSourceType): string {
    // Remove empty lines at the start of the source
    let transformedCode = code.replace(/^(\s*\r?\n)*/g, '');
    // Remove empty lines at the end of the source
    transformedCode = transformedCode.replace(/(\r?\n\s*)*$/g, '');

    // highlight-ts needs 'xml' as type instead of 'html'
    const highlightType = type === 'html' ? 'xml' : type;
    // Add syntax highlighting using highlight-ts
    transformedCode = process(this._highlighter, transformedCode, highlightType)
      .value;

    return wrapCodeLines(transformedCode, 'ba-live-example-code-line');
  }
}

/** Retrieves the NgModule of an es6 module */
function getNgModuleFromEs6Module(es6Module: any): Type<NgModule> | null {
  for (const key of Object.keys(es6Module)) {
    if (isNgModule(es6Module[key])) {
      return es6Module[key];
    }
  }
  return null;
}

/** Checks if a provided type is an Angular Module */
const isNgModule = (moduleType: any): boolean =>
  !!(
    Array.isArray(moduleType?.decorators) &&
    moduleType.decorators[0]?.type?.prototype?.ngMetadataName === 'NgModule'
  );
