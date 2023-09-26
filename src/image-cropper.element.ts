import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import "./image-cropper-cropper.element";

@customElement("umb-image-cropper")
export class UmbImageCropperElement extends LitElement {
  render() {
    return html`
      <div>Hello world from ${this.tagName}!</div>
      <umb-image-cropper-cropper></umb-image-cropper-cropper>
    `;
  }
  static styles = css`
    :host {
      display: block;
      height: 600px;
      width: 800px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "umb-image-cropper": UmbImageCropperElement;
  }
}
