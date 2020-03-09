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
  Injectable,
  Injector,
  ɵrenderComponent as renderComponent,
} from '@angular/core';

@Injectable()
export class DynamicService {
  constructor(private injector: Injector) {}

  loadComponent(tag: string) {
    return import(`./${tag}.component`)
      .then(esModule => esModule.default)
      .then(ComponentType => {
        const tagName = ComponentType.ngComponentDef.selectors[0];
        const host = document.createElement(tagName);
        const component = renderComponent(ComponentType, {
          host,
          injector: this.injector,
        });

        return {
          component,
          host,
        };
      });
  }
}
