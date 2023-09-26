import { LitElement, css, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import "./image-cropper.element";
import "./image-cropper-focus-setter.element";

@customElement("umb-image-cropper-preview")
export class UmbImageCropperPreviewElement extends LitElement {
  @property({ type: Object, attribute: false })
  crop?: {
    name: string;
    dimensions: {
      width: number;
      height: number;
    };
    crop: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };
  };

  @property({ type: String, attribute: false })
  image: string = "";

  render() {
    if (!this.crop) {
      return nothing;
    }

    return html`
      <img src=${this.image} alt="image" />
      <span id="name">${this.crop.name}</span>
      <span id="dimensions">${this.crop.dimensions.width} x ${this.crop.dimensions.height}</span>
    `;
  }
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      border: 1px solid black;
      width: 100px;
      height: 120px;
      padding: 12px;
      border-radius: 4px;
    }
    #name {
      font-weight: bold;
    }
    #dimensions {
      font-size: 0.8em;
    }
    img {
      width: 100%;
      margin-bottom: 8px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "umb-image-cropper-preview": UmbImageCropperPreviewElement;
  }
}
