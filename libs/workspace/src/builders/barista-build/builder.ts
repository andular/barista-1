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
  BuilderContext,
  BuilderOutput,
  createBuilder,
  targetFromTargetString,
} from '@angular-devkit/architect';
import { readFileSync } from 'fs';
import { EOL } from 'os';
import { join } from 'path';
import { from, Observable, of } from 'rxjs';
import { catchError, map, mapTo, switchMap, tap } from 'rxjs/operators';
import { renderRoutes } from './prerender/render-routes';
import { BaristaBuildBuilderSchema } from './schema';

const COMPILE_ERROR =
  'Could not compile application for server side rendering!';

/** The main builder function to pre-render barista */
export function runBuilder(
  options: BaristaBuildBuilderSchema,
  context: BuilderContext,
): Observable<BuilderOutput> {
  const target = targetFromTargetString(options.devServerTarget);
  const outputPath = join(process.cwd(), options.outputPath);

  const routes = readFileSync(options.routesFile, 'utf-8').split(EOL);

  return from(context.scheduleTarget(target)).pipe(
    switchMap(server =>
      from(server.result).pipe(
        map(output => {
          if (!output.success) {
            throw new Error(COMPILE_ERROR);
          }
          return output.baseUrl;
        }),
        switchMap((baseURL: string) =>
          renderRoutes({
            baseURL,
            outputPath,
            routes,
            logger: context.logger,
          }),
        ),
      ),
    ),
    mapTo({ success: true }),
    catchError(error => {
      context.logger.error(error);
      return of({ success: false });
    }),
    tap(({ success }) => {
      if (success) {
        context.logger.info('\n✅ Successfully built barista!');
      }
    }),
  );
}

export default createBuilder(runBuilder);
