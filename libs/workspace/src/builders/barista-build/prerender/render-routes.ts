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
import { logging } from '@angular-devkit/core';
import axios from 'axios';
import { mkdirSync, promises as fs } from 'fs';
import { dirname, join } from 'path';
import { forkJoin, from, Observable } from 'rxjs';
import { mapTo, pluck, switchMap, tap } from 'rxjs/operators';

/** Collects a list of routes and get the html code of it */
export function renderRoutes(config: {
  outputPath: string;
  baseURL: string;
  routes: string[];
  logger?: logging.LoggerApi;
}): Observable<string[]> {
  const pages = config.routes.map(route =>
    from(
      axios.get<string>(route, { baseURL: config.baseURL }),
    ).pipe(
      pluck('data'),
      switchMap(data => {
        const fileName = generateFileName(route);
        const filePath = join(config.outputPath, fileName);

        mkdirSync(dirname(filePath), { recursive: true });

        return from(fs.writeFile(filePath, data, 'utf-8')).pipe(
          mapTo(fileName),
        );
      }),
      tap(file => {
        if (config.logger) {
          config.logger.info(`CREATED ${file}`);
        }
      }),
    ),
  );

  return forkJoin(pages);
}

/** generates the html filename out of a route */
function generateFileName(route: string): string {
  return join(route, 'index.html');
}
