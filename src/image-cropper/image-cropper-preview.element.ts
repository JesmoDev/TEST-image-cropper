import { LitElement, css, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import "./image-cropper.element";
import "./image-cropper-focus-setter.element";
import { UmbImageCropperCrop } from ".";
import { distance, increaseValue } from "./mathUtils";

@customElement("umb-image-cropper-preview")
export class UmbImageCropperPreviewElement extends LitElement {
  @query("#image") imageElement!: HTMLImageElement;
  @query("#image-container") imageContainerElement!: HTMLImageElement;

  @property({ type: Object, attribute: false })
  crop?: UmbImageCropperCrop;

  @property({ type: String, attribute: false })
  image: string = "";

  connectedCallback() {
    super.connectedCallback();
    this.#init();
  }

  async #init() {
    if (!this.crop) return;

    await this.updateComplete;

    if (!this.imageElement.complete) {
      await new Promise((resolve) => (this.imageElement.onload = () => resolve(this.imageElement)));
    }

    const imageContainerRect = this.imageContainerElement.getBoundingClientRect();
    let imageContainerWidth = imageContainerRect.width;
    let imageContainerHeight = imageContainerRect.height;
    let imageWidth = 0;
    let imageHeight = 0;
    const cropAspectRatio = this.crop.dimensions.width / this.crop.dimensions.height;
    const imageAspectRatio = this.imageElement.naturalWidth / this.imageElement.naturalHeight;

    if (cropAspectRatio > 1) {
      imageContainerWidth = imageContainerWidth;
      imageContainerHeight = imageContainerWidth * cropAspectRatio;
      const cropSize = this.crop.crop.x1 + this.crop.crop.x2;
      imageWidth = increaseValue(imageContainerWidth, cropSize);
      imageHeight = imageWidth * imageAspectRatio;
      this.imageElement.style.width = `${increaseValue(imageContainerWidth, cropSize)}px`;
      this.imageElement.style.top = `${-imageHeight * this.crop.crop.y1}px`;
      this.imageElement.style.left = `${-imageWidth * this.crop.crop.x1}px`;
    } else {
      imageContainerWidth = imageContainerHeight * cropAspectRatio;
      imageContainerHeight = imageContainerHeight;
      const cropSize = this.crop.crop.y1 + this.crop.crop.y2;

      imageHeight = increaseValue(imageContainerHeight, cropSize);
      imageWidth = imageHeight * imageAspectRatio;
      this.imageElement.style.height = `${increaseValue(imageContainerHeight, cropSize)}px`;
      this.imageElement.style.top = `${-imageHeight * this.crop.crop.y1}px`;
      this.imageElement.style.left = `${-imageWidth * this.crop.crop.x1}px`;
    }
    this.imageContainerElement.style.width = `${imageContainerWidth}px`;
    this.imageContainerElement.style.height = `${imageContainerHeight}px`;
  }

  render() {
    if (!this.crop) {
      return nothing;
    }

    return html`
      <div id="image-container">
        <img id="image" src=${this.image} alt="image" />
      </div>
      <span id="name">${this.crop.name}</span>
      <span id="dimensions">${this.crop.dimensions.width} x ${this.crop.dimensions.height}</span>
    `;
  }
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      outline: 1px solid black;
      padding: 12px;
      border-radius: 4px;
    }
    #image-container {
      display: flex;
      width: 100%;
      aspect-ratio: 1;
      overflow: hidden;
      /* outline: 1px solid black; */
      position: relative;
      overflow: hidden;
      margin: auto;
    }
    #name {
      font-weight: bold;
      margin-top: 8px;
    }
    #dimensions {
      font-size: 0.8em;
    }
    #image {
      position: absolute;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "umb-image-cropper-preview": UmbImageCropperPreviewElement;
  }
}
