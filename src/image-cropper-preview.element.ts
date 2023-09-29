import { LitElement, css, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import "./image-cropper.element";
import "./image-cropper-focus-setter.element";

@customElement("umb-image-cropper-preview")
export class UmbImageCropperPreviewElement extends LitElement {
  @query("#image") imageElement!: HTMLImageElement;
  @query("#image-container") imageContainerElement!: HTMLImageElement;

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
    focalPoint: {
      x: number;
      y: number;
    };
  };

  @property({ type: String, attribute: false })
  image: string = "";

  connectedCallback() {
    super.connectedCallback();
    this.#init();
  }

  #calculateIncreasedValue(startValue: number, increaseFactor: number): number {
    if (increaseFactor < 0 || increaseFactor >= 1) {
      throw new Error("Increase factor must be between 0 (inclusive) and 1 (exclusive)");
    }

    return startValue / (1 - increaseFactor);
  }

  #calculateDistance(a: number, b: number): number {
    return Math.abs(a - b);
  }

  async #init() {
    await this.updateComplete;

    if (!this.imageElement.complete) {
      await new Promise((resolve) => (this.imageElement.onload = () => resolve(this.imageElement)));
    }

    if (!this.crop) return;
    console.log(this.crop);

    const imageContainerRect = this.imageContainerElement.getBoundingClientRect();
    let imageContainerWidth = imageContainerRect.width;
    let imageContainerHeight = imageContainerRect.height;
    let imageWidth = 0;
    let imageHeight = 0;
    const cropAspectRatio = this.crop.dimensions.width / this.crop.dimensions.height;
    const imageAspectRatio = this.imageElement.naturalWidth / this.imageElement.naturalHeight;

    if (cropAspectRatio > 1) {
      imageContainerWidth = imageContainerWidth;
      imageContainerHeight = imageContainerWidth / cropAspectRatio;
      const cropSize = 1 - this.#calculateDistance(this.crop.crop.x1, this.crop.crop.x2);
      imageWidth = this.#calculateIncreasedValue(imageContainerWidth, cropSize);
      imageHeight = imageWidth / imageAspectRatio;
      this.imageElement.style.width = `${this.#calculateIncreasedValue(imageContainerWidth, cropSize)}px`;
      this.imageElement.style.top = `${-imageHeight * this.crop.crop.y1}px`;
      this.imageElement.style.left = `${-imageWidth * this.crop.crop.x1}px`;
    } else {
      imageContainerWidth = imageContainerHeight * cropAspectRatio;
      imageContainerHeight = imageContainerHeight;
      const cropSize = 1 - this.#calculateDistance(this.crop.crop.y1, this.crop.crop.y2);
      imageHeight = this.#calculateIncreasedValue(imageContainerHeight, cropSize);
      imageWidth = imageHeight * imageAspectRatio;
      this.imageElement.style.height = `${this.#calculateIncreasedValue(imageContainerHeight, cropSize)}px`;
      this.imageElement.style.top = `${-imageHeight * this.crop.crop.y1}px`;
      this.imageElement.style.left = `${-imageWidth * this.crop.crop.x1}px`;
    }
    this.imageContainerElement.style.width = `${imageContainerWidth}px`;
    this.imageContainerElement.style.height = `${imageContainerHeight}px`;

    // this.imageElement.style.top = `${-imageContainerHeight * this.crop.crop.y1}px`;
    // this.imageElement.style.left = `${-imageContainerWidth * this.crop.crop.x1}px`;

    // const top = 0 - this.crop.crop.y1 * imageHeight;
    // const right = imageContainerWidth - this.crop.crop.x2 * imageWidth;
    // const left = 0 - this.crop.crop.x1 * imageWidth;
    // const bottom = imageContainerHeight - this.crop.crop.y2 * imageHeight;

    // this.imageElement.style.top = `${top}px`;
    // this.imageElement.style.left = `${left}px`;
    // this.imageElement.style.right = `${right}px`;
    // this.imageElement.style.bottom = `${bottom}px`;
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
      width: 200px;
    }
    #image-container {
      display: flex;
      width: 100px;
      height: 100px;
      overflow: hidden;
      outline: 1px solid black;
      position: relative;
      overflow: hidden;
    }
    #name {
      font-weight: bold;
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
