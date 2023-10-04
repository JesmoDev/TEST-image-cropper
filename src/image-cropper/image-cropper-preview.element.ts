import { LitElement, css, html, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";

import "./image-cropper.element";
import "./image-cropper-focus-setter.element";
import { UmbImageCropperCrop } from ".";
import { clamp, calculateExtrapolatedValue } from "./mathUtils";

@customElement("umb-image-cropper-preview")
export class UmbImageCropperPreviewElement extends LitElement {
  @query("#image") imageElement!: HTMLImageElement;
  @query("#image-container") imageContainerElement!: HTMLImageElement;

  @property({ type: Object, attribute: false })
  crop?: UmbImageCropperCrop;

  @property({ type: String, attribute: false })
  src: string = "";

  @property({ attribute: false })
  get focalPoint() {
    return this.#focalPoint;
  }
  set focalPoint(value) {
    this.#focalPoint = value;
    this.#onFocalPointUpdated();
  }

  #focalPoint = { left: 0.5, top: 0.5 };

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
    let imageLeft = 0;
    let imageTop = 0;
    const cropAspectRatio = this.crop.width / this.crop.height;
    const imageAspectRatio = this.imageElement.naturalWidth / this.imageElement.naturalHeight;

    if (cropAspectRatio > 1) {
      imageContainerWidth = imageContainerWidth;
      imageContainerHeight = imageContainerWidth / cropAspectRatio;
    } else {
      imageContainerWidth = imageContainerHeight * cropAspectRatio;
      imageContainerHeight = imageContainerHeight;
    }

    if (this.crop.coordinates) {
      if (cropAspectRatio > 1) {
        const cropSize = this.crop.coordinates.x1 + this.crop.coordinates.x2;
        imageWidth = calculateExtrapolatedValue(imageContainerWidth, cropSize);
        imageHeight = imageWidth / imageAspectRatio;
        imageTop = -imageHeight * this.crop.coordinates.y1;
        imageLeft = -imageWidth * this.crop.coordinates.x1;
      } else {
        const cropSize = this.crop.coordinates.y1 + this.crop.coordinates.y2;
        imageHeight = calculateExtrapolatedValue(imageContainerHeight, cropSize);
        imageWidth = imageHeight * imageAspectRatio;
        imageHeight = calculateExtrapolatedValue(imageContainerHeight, cropSize);
        imageTop = -imageHeight * this.crop.coordinates.y1;
        imageLeft = -imageWidth * this.crop.coordinates.x1;
      }
      this.imageElement.style.top = `${imageTop}px`;
      this.imageElement.style.left = `${imageLeft}px`;
    } else {
      // Set the image size to fill the imageContainer while preserving aspect ratio
      if (cropAspectRatio > 1) {
        imageWidth = imageContainerWidth;
        imageHeight = imageWidth / imageAspectRatio;
      } else {
        imageHeight = imageContainerHeight;
        imageWidth = imageHeight * imageAspectRatio;
      }

      this.#onFocalPointUpdated(imageWidth, imageHeight, imageContainerWidth, imageContainerHeight);
    }

    this.imageContainerElement.style.width = `${imageContainerWidth}px`;
    this.imageContainerElement.style.height = `${imageContainerHeight}px`;

    this.imageElement.style.width = `${imageWidth}px`;
    this.imageElement.style.height = `${imageHeight}px`;
  }

  #onFocalPointUpdated(imageWidth?: number, imageHeight?: number, containerWidth?: number, containerHeight?: number) {
    if (!this.crop) return;
    if (!this.imageElement || !this.imageContainerElement) return;
    if (this.crop.coordinates) return;

    if (!imageWidth || !imageHeight) {
      const image = this.imageElement.getBoundingClientRect();
      imageWidth = image.width;
      imageHeight = image.height;
    }
    if (!containerWidth || !containerHeight) {
      const container = this.imageContainerElement.getBoundingClientRect();
      containerWidth = container.width;
      containerHeight = container.height;
    }
    // position image so that its center is at the focal point
    let imageLeft = containerWidth / 2 - imageWidth * this.#focalPoint.left;
    let imageTop = containerHeight / 2 - imageHeight * this.#focalPoint.top;
    // clamp
    imageLeft = clamp(imageLeft, containerWidth - imageWidth, 0);
    imageTop = clamp(imageTop, containerHeight - imageHeight, 0);

    this.imageElement.style.top = `${imageTop}px`;
    this.imageElement.style.left = `${imageLeft}px`;
  }

  render() {
    if (!this.crop) {
      return nothing;
    }

    return html`
      <div id="image-container">
        <img id="image" src=${this.src} alt="image" />
      </div>
      <span id="name">${this.crop.alias}</span>
      <span id="dimensions">${this.crop.width} x ${this.crop.height}</span>
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
      pointer-events: none;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "umb-image-cropper-preview": UmbImageCropperPreviewElement;
  }
}
