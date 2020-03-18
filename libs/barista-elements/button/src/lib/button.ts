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
  html,
  css,
  LitElement,
  property,
  CSSResult,
  TemplateResult,
} from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

/**
 * This is an experimental button element built with lit-elements and
 * web-components. It registers itself as `barista-button` custom element.
 * @attr {boolean|undefined} disabled - Disables the button.
 * @attr {string} color - Sets the color of the button to either `main` (default),
 * `warning`, or `cta` (call to action).
 * @attr {string} variant - Sets the button variant either to `primary`(default),
 * `secondary` or `nested` (should only be available for dt-icon-button).
 * @slot The content of the button will be put inside the button element.
 * @cssprop --barista-button--padding - Controls the inner padding of the button.
 * @cssprop --barista-button--height - Controls the height of the button.
 * @cssprop --barista-button--border-style - Controls the border style of the button.
 * @cssprop --barista-button--border-width - Controls the border width of the button.
 * @cssprop --barista-button--border-radius - Controls the border radius of the button.
 * @cssprop --barista-button--foreground - Controls the default foreground color.
 * @cssprop --barista-button--background - Controls the default background color.
 * @cssprop --barista-button--foreground-hover - Controls the foreground color of the button in hover mode.
 * @cssprop --barista-button--background-hover - Controls the background color of the button in hover mode.
 * @cssprop --barista-button--foreground-active - Controls the foreground color of the button in active mode.
 * @cssprop --barista-button--background-active - Controls the background color of the button in active mode.
 * @cssprop --barista-button--foreground-disabled - Controls the foreground color of the button in disabled mode.
 * @cssprop --barista-button--background-disabled - Controls the background color of the button in disabled mode.
 */
export class BaristaButton extends LitElement {
  /** Styles for the button component */
  static get styles(): CSSResult {
    return css`
      :host {
        /** These should probably come from the design-tokens */
        --font-family: 'BerninaSansWeb', 'OpenSans', sans-serif;
        --font-weight--regular: 400;
        --text-size--regular: 14px;
        --text--line-height: 30px;
        --spacing-0: 0;
        --spacing-medium: 15px;
        --border-style: solid;
        --border-radius: 3px;
        --border-width--small: 1px;
        --palette-color-white: #ffffff;
        --palette-color-gray-300: #cccccc;
        --palette-color-turquoise-600: #00a1b2;
        --palette-color-turquoise-700: #00848e;
        --palette-color-turquoise-800: #006d75;
        --palette-color-yellow-600: #e6be00;
        --palette-color-yellow-700: #c9a000;
        --palette-color-yellow-800: #ab8300;
        --palette-color-green-600: #5ead35;
        --palette-color-green-700: #3f962a;
        --palette-color-green-800: #1f7e1e;
        /** End of these should probably come from the design-tokens */

        display: inline-block;
        box-sizing: border-box;
        position: relative;

        --barista-button--padding: var(--spacing-0) var(--spacing-medium)
          var(--spacing-0) var(--spacing-medium);
        --barista-button--height: 32px;
        --barista-button--border-style: var(--border-style);
        --barista-button--border-width: var(--border-width--small);
        --barista-button--border-radius: var(--border-radius);

        --barista-button--foreground: var(--palette-color-white);
        --barista-button--background: var(--palette-color-turquoise-600);
        --barista-button--foreground-hover: var(--palette-color-white);
        --barista-button--background-hover: var(--palette-color-turquoise-700);
        --barista-button--foreground-active: var(--palette-color-white);
        --barista-button--background-active: var(--palette-color-turquoise-800);
        --barista-button--foreground-disabled: var(--palette-color-white);
        --barista-button--background-disabled: var(--palette-color-gray-300);
      }

      .dt-color--warning {
        --barista-button--background: var(--palette-color-yellow-600);
        --barista-button--background-hover: var(--palette-color-yellow-700);
        --barista-button--background-active: var(--palette-color-yellow-800);
      }

      .dt-color--cta {
        --barista-button--background: var(--palette-color-green-600);
        --barista-button--background-hover: var(--palette-color-green-700);
        --barista-button--background-active: var(--palette-color-green-800);
      }

      .barista-button {
        cursor: pointer;
        display: inline-block;
        box-sizing: border-box;
        position: relative;
        white-space: nowrap;
        text-decoration: none;
        text-align: center;
        overflow: hidden;

        font-family: var(--font-family);
        font-weight: var(--font-weight--regular);
        font-size: var(--text-size--regular);
        line-height: var(--text--line-height);

        height: var(--barista-button--height);
        border-style: var(--barista-button--border-style);
        border-width: var(--barista-button--border-width);
        border-radius: var(--barista-button--border-radius);
        border-color: var(--barista-button--background);
        padding: var(--barista-button--padding);
        color: var(--barista-button--foreground);
        background: var(--barista-button--background);
      }

      .barista-button:hover {
        text-decoration: none;
        background: var(--barista-button--background-hover);
        border-color: var(--barista-button--background-hover);
        color: var(--barista-button--foreground-hover);
      }

      .barista-button:active {
        background: var(--barista-button--background-active);
        border-color: var(--barista-button--background-active);
        color: var(--barista-button--foreground-active);
      }

      .barista-button[disabled] {
        cursor: default;
        box-shadow: none;
        outline: none;
        background: var(--barista-button--background-disabled);
        border-color: var(--barista-button--background-disabled);
        color: var(--barista-button--foreground-disabled);
      }

      .barista-button::-moz-focus-inner {
        border: 0;
      }

      /** Secondary style changes */
      .dt-variant--secondary,
      .dt-variant--secondary:hover,
      .dt-variant--secondary:active {
        background: transparent;
        color: var(--barista-button--background);
      }

      .dt-variant--secondary[disabled] {
        background: transparent;
        color: var(--barista-button--background-disabled);
      }
    `;
  }

  /**
   * Defines if the button is disabled or not.
   * @attribute {boolean}
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Defines the color theme of the button.
   * @attrribute
   * @type {'main' | 'warning' | 'cta' }
   */
  @property({ type: String, reflect: false })
  color: 'main' | 'warning' | 'cta' = 'main';

  /**
   * Defines the variant of the button.
   * @attribute
   * @type {'primary' | 'secondary' | 'nested'}
   */
  @property({ type: String, reflect: false })
  variant: 'primary' | 'secondary' | 'nested' = 'primary';

  constructor() {
    super();
  }

  /**
   * Render function of the custom element. It is called when one of the
   * observedProperties (annotated with @property) changes.
   */
  render(): TemplateResult {
    const classMapData = {
      'barista-button': true,
      'dt-color--main': this.color === 'main',
      'dt-color--warning': this.color === 'warning',
      'dt-color--cta': this.color === 'cta',
      'dt-variant--primary': this.variant === 'primary',
      'dt-variant--secondary': this.variant === 'secondary',
      'dt-variant--nested': this.variant === 'nested',
    };

    return html`
      <button class=${classMap(classMapData)} ?disabled="${this.disabled}">
        <span class="barista-button-label">
          <slot></slot>
        </span>
      </button>
    `;
  }
}
if (!customElements.get('barista-button')) {
  customElements.define('barista-button', BaristaButton);
}
