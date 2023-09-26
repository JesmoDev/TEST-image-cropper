import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import "./image-cropper-cropper.element";

@customElement("umb-image-cropper")
export class UmbImageCropperElement extends LitElement {
  render() {
    return html`
      <umb-image-cropper-cropper></umb-image-cropper-cropper>
      <div>
        <input id="slider" type="range" min="0" max="1" value="0" step="0.001" />
      </div>
    `;
  }
  static styles = css`
    :host {
      display: block;
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
    }
    #slider {
      width: 100%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "umb-image-cropper": UmbImageCropperElement;
  }
}
