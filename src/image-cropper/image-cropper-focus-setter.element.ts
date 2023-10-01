import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

@customElement("umb-image-cropper-focus-setter")
export class UmbImageCropperFocusSetterElement extends LitElement {
  render() {
    return html``;
  }
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      border: 1px solid black;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "umb-image-cropper-focus-setter": UmbImageCropperFocusSetterElement;
  }
}
