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

import { Platform } from '@angular/cdk/platform';
import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  ViewChild,
  ɵcreateInjector as createInjector,
  ViewContainerRef,
  NgModuleFactory,
  Compiler,
  ModuleWithComponentFactories,
} from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import { ngModuleJitUrl, compileNgModule } from '@angular/compiler';
import { Observable, from, of, combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Type } from '@angular/compiler/src/core';

@Component({
  selector: 'ba-live-example',
  template: `
    <ng-container
      [ngComponentOutlet]="example$ | async"
      [ngComponentOutletNgModuleFactory]="factory$ | async"
    ></ng-container>
  `,
})
export class BaLiveExample implements OnDestroy {
  /** The name of the example (class name) that will be instantiated. */
  @Input()
  get name(): string {
    return this._name;
  }
  set name(value: string) {
    this._name = value;
    this._initExample();
  }
  private _name: string;

  example$: Observable<any>;
  factory$: Observable<any>;

  /** @internal The component-ref of the instantiated class. */
  _componentRef: ComponentRef<unknown>;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _injector: Injector,
    private _viewContainerRef: ViewContainerRef,
    private _platform: Platform,
    private compiler: Compiler,
  ) {}

  ngOnDestroy(): void {
    if (this._componentRef) {
      this._componentRef.destroy();
    }
  }

  private _initExample(): void {
    console.log('INIT EXAMPLES: ');
    const examples$ = of(this._name).pipe(
      switchMap(() => import(`@dynatrace/examples/input`)),
      map(moduleMap => moduleMap['DtInputExamplesModule']),
      switchMap(moduleType =>
        this.compiler.compileModuleAndAllComponentsAsync(moduleType),
      ),
    );

    this.example$ = examples$.pipe(
      map(({ componentFactories }) => {
        return componentFactories.find(
          factory => factory.componentType.name === this._name,
        )?.componentType;
      }),
    );

    this.factory$ = examples$.pipe(
      map(({ ngModuleFactory }) => ngModuleFactory),
      tap(console.log),
    );

    // this.example$.subscribe(console.log);

    // from().pipe(
    //   map(a =>)
    // )

    // import(
    //   `/Users/lukas.holzer/Sites/barista/libs/examples/src/button/button-default-example/button-default-example`
    // )
    //   // .then(comp => comp[Object.keys(comp)[0]])
    //   // .then(m => this.compiler.compileModuleAndAllComponentsAsync(m))
    //   .then(m => {
    //     // const injector = createInjector(m, this._injector);
    //     // const myModule = injector.get(m);

    //     console.log(m);

    //     //working example
    //     // const componentFactory = this._componentFactoryResolver.resolveComponentFactory(
    //     //   m,
    //     // );
    //     // const componentRef = this._placeholder.createComponent(
    //     //   componentFactory,
    //     //   0,
    //     //   this._injector,
    //     // );
    //     // componentRef.changeDetectorRef.markForCheck();
    //     //working example

    //     // const componentFactory = myModule.resolveComponentFactory(DtButtonDE);
    //     // const componentRef = this.carousel.createComponent(componentFactory);
    //     // componentRef.changeDetectorRef.markForCheck();
    //     // const tagName = ComponentType.ngComponentDef.selectors[0];
    //     // const host = document.createElement(tagName);
    //     // const component = renderComponent(ComponentType, {
    //     //   host,
    //     //   injector: this.injector,
    //     // });

    //     // return {
    //     //   component,
    //     //   host,
    //     // };
    //   });

    // console.log(this._name);
    //   const exampleType = EXAMPLES_MAP.get(this.name);
    //   if (exampleType) {
    //     const factory = this._componentFactoryResolver.resolveComponentFactory(
    //       exampleType,
    //     );
    //     this._componentRef = createComponent(
    //       factory,
    //       this._viewContainerRef,
    //       this._injector,
    //       this._placeholder.nativeElement,
    //       true,
    //     );
    //   }
  }
}
