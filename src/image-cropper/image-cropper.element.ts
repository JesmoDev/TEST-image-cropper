import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { UmbImageCropperCrop, UmbImageCropperFocalPoint } from ".";
import { clamp, calculateExtrapolatedValue, inverseLerp, lerp } from "./mathUtils";

@customElement("umb-image-cropper")
export class UmbImageCropperElement extends LitElement {
  @query("#viewport") viewportElement!: HTMLElement;
  @query("#mask") maskElement!: HTMLElement;
  @query("#image") imageElement!: HTMLImageElement;

  @property({ attribute: false }) value?: UmbImageCropperCrop;
  @property({ type: String }) src: string = "";
  @property({ attribute: false }) focalPoint: UmbImageCropperFocalPoint = { left: 0.5, top: 0.5 };
  @property({ type: Number })
  get zoom() {
    return this._zoom;
  }
  set zoom(value) {
    // Calculate the delta value - the value the zoom has changed b
    const delta = value - this._zoom;
    this.#updateImageScale(delta);
  }

  @state() _zoom = 0;

  #DEBUG_USE_MOUSE_POSITION_FOR_ZOOM = true; //TODO: Decide and remove, also remove the checkbox

  #VIEWPORT_PADDING = 100 as const;
  #MAX_SCALE_FACTOR = 4 as const;

  #minImageScale = 0;
  #maxImageScale = 0;
  #oldImageScale = 0;
  #isDragging = false;
  #mouseOffsetX = 0;
  #mouseOffsetY = 0;

  get #getImageScale() {
    return lerp(this.#minImageScale, this.#maxImageScale, this._zoom);
  }

  connectedCallback() {
    super.connectedCallback();
    this.#initializeCrop();
    this.#addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#removeEventListeners();
  }

  async #addEventListeners() {
    await this.updateComplete;
    this.imageElement.addEventListener("mousedown", this.#onStartDrag);
    this.addEventListener("wheel", this.#onWheel, { passive: false }); //
  }

  #removeEventListeners() {
    this.imageElement.removeEventListener("mousedown", this.#onStartDrag);
    this.removeEventListener("wheel", this.#onWheel);
  }

  async #initializeCrop() {
    if (!this.value) return;

    await this.updateComplete; // Wait for the @query to be resolved

    if (!this.imageElement.complete) {
      // Wait for the image to load
      await new Promise((resolve) => (this.imageElement.onload = () => resolve(this.imageElement)));
    }

    const viewportWidth = this.viewportElement.clientWidth;
    const viewportHeight = this.viewportElement.clientHeight;

    const viewportAspectRatio = viewportWidth / viewportHeight;
    const cropAspectRatio = this.value.width / this.value.height;

    // Init variables
    let maskWidth,
      maskHeight,
      imageWidth,
      imageHeight,
      imageLeft,
      imageTop = 0;

    // NOTE {} are used to keep some variables in scope, preventing them from being used outside.

    {
      // Calculate mask size
      const viewportPadding = 2 * this.#VIEWPORT_PADDING;
      const availableWidth = viewportWidth - viewportPadding;
      const availableHeight = viewportHeight - viewportPadding;

      const isCropWider = cropAspectRatio > viewportAspectRatio;

      maskWidth = isCropWider ? availableWidth : availableHeight * cropAspectRatio;
      maskHeight = isCropWider ? availableWidth / cropAspectRatio : availableHeight;
    }

    // Center the mask within the viewport
    const maskLeft = (viewportWidth - maskWidth) / 2;
    const maskTop = (viewportHeight - maskHeight) / 2;

    this.maskElement.style.width = `${maskWidth}px`;
    this.maskElement.style.height = `${maskHeight}px`;
    this.maskElement.style.left = `${maskLeft}px`;
    this.maskElement.style.top = `${maskTop}px`;

    {
      // Calculate the scaling factors to fill the mask area while preserving aspect ratio
      const scaleX = maskWidth / this.imageElement.naturalWidth;
      const scaleY = maskHeight / this.imageElement.naturalHeight;
      const scale = Math.max(scaleX, scaleY);
      this.#minImageScale = scale;
      this.#maxImageScale = scale * this.#MAX_SCALE_FACTOR;
    }

    // Calculate the image size and position
    if (this.value.coordinates) {
      const imageAspectRatio = this.imageElement.naturalWidth / this.imageElement.naturalHeight;

      if (cropAspectRatio > 1) {
        const cropAmount = this.value.coordinates.x1 + this.value.coordinates.x2;
        // Use the cropAmount as a factor to increase the mask size, this zooms the image.
        imageWidth = calculateExtrapolatedValue(maskWidth, cropAmount);
        imageHeight = imageWidth / imageAspectRatio;
        // Move the up and left from the edges of the mask based on the crop coordinates
        imageLeft = -imageWidth * this.value.coordinates.x1 + maskLeft;
        imageTop = -imageHeight * this.value.coordinates.y1 + maskTop;
      } else {
        const cropAmount = this.value.coordinates.y1 + this.value.coordinates.y2;
        // Use the crop zoom as a factor to increase the mask size, this zooms the image.
        imageHeight = calculateExtrapolatedValue(maskHeight, cropAmount);
        imageWidth = imageHeight * imageAspectRatio;
        // Move the up and left from the edges of the mask based on the crop coordinates
        imageLeft = -imageWidth * this.value.coordinates.x1 + maskLeft;
        imageTop = -imageHeight * this.value.coordinates.y1 + maskTop;
      }
    } else {
      //TODO: This is not working FIX
      // Set the image size to fill the mask while preserving aspect ratio
      imageWidth = this.imageElement.naturalWidth * this.#minImageScale;
      imageHeight = this.imageElement.naturalHeight * this.#minImageScale;
      // position image using focal point
      imageTop = lerp(maskTop, maskTop + maskHeight - imageHeight, this.focalPoint.top);
      imageLeft = lerp(maskLeft, maskLeft + maskWidth - imageWidth, this.focalPoint.left);
    }

    this.imageElement.style.left = `${imageLeft}px`;
    this.imageElement.style.top = `${imageTop}px`;
    this.imageElement.style.width = `${imageWidth}px`;
    this.imageElement.style.height = `${imageHeight}px`;

    const currentScaleX = imageWidth / this.imageElement.naturalWidth;
    const currentScaleY = imageHeight / this.imageElement.naturalHeight;
    const currentScale = Math.max(currentScaleX, currentScaleY);
    // Calculate the zoom level based on the current scale
    // This finds the alpha value in the range of min and max scale.
    this._zoom = inverseLerp(this.#minImageScale, this.#maxImageScale, currentScale);
  }

  #updateImageScale(amount: number, mouseX?: number, mouseY?: number) {
    this.#oldImageScale = this.#getImageScale;
    this._zoom = clamp(this._zoom + amount, 0, 1);
    const newImageScale = this.#getImageScale;

    const maskRect = this.maskElement.getBoundingClientRect();
    const imageRect = this.imageElement.getBoundingClientRect();

    let fixedLocation = { left: 0, top: 0 };

    // If mouse position is provided, use that as the fixed location
    // Else use the center of the mask
    if (mouseX && mouseY && this.#DEBUG_USE_MOUSE_POSITION_FOR_ZOOM) {
      fixedLocation = this.#toLocalPosition(mouseX, mouseY);
    } else {
      fixedLocation = this.#toLocalPosition(maskRect.left + maskRect.width / 2, maskRect.top + maskRect.height / 2);
    }

    const imageLocalPosition = this.#toLocalPosition(imageRect.left, imageRect.top);
    // Calculate the new image position while keeping the fixed location in the same position
    const imageLeft = fixedLocation.left - (fixedLocation.left - imageLocalPosition.left) * (newImageScale / this.#oldImageScale);
    const imageTop = fixedLocation.top - (fixedLocation.top - imageLocalPosition.top) * (newImageScale / this.#oldImageScale);

    this.imageElement.style.width = `${this.imageElement.naturalWidth * newImageScale}px`;
    this.imageElement.style.height = `${this.imageElement.naturalHeight * newImageScale}px`;

    this.#updateImagePosition(imageTop, imageLeft);
  }

  #updateImagePosition(top: number, left: number) {
    const mask = this.maskElement.getBoundingClientRect();
    const image = this.imageElement.getBoundingClientRect();

    // Calculate the minimum and maximum image positions
    const minLeft = this.#toLocalPosition(mask.left + mask.width - image.width, 0).left;
    const maxLeft = this.#toLocalPosition(mask.left, 0).left;
    const minTop = this.#toLocalPosition(0, mask.top + mask.height - image.height).top;
    const maxTop = this.#toLocalPosition(0, mask.top).top;

    // Clamp the image position to the min and max values
    left = clamp(left, minLeft, maxLeft);
    top = clamp(top, minTop, maxTop);

    this.imageElement.style.left = `${left}px`;
    this.imageElement.style.top = `${top}px`;
  }

  #calculateCropCoordinates(): { x1: number; x2: number; y1: number; y2: number } {
    const cropCoordinates = { x1: 0, y1: 0, x2: 0, y2: 0 };

    const mask = this.maskElement.getBoundingClientRect();
    const image = this.imageElement.getBoundingClientRect();

    cropCoordinates.x1 = (mask.left - image.left) / image.width;
    cropCoordinates.y1 = (mask.top - image.top) / image.height;
    cropCoordinates.x2 = Math.abs((mask.right - image.right) / image.width);
    cropCoordinates.y2 = Math.abs((mask.bottom - image.bottom) / image.height);

    return cropCoordinates;
  }

  #toLocalPosition(left: number, top: number) {
    const viewportRect = this.viewportElement.getBoundingClientRect();

    return {
      left: left - viewportRect.left,
      top: top - viewportRect.top,
    };
  }

  #onSave() {
    if (!this.value) return;

    const { x1, x2, y1, y2 } = this.#calculateCropCoordinates();
    this.value = {
      ...this.value,
      coordinates: { x1, x2, y1, y2 },
    };

    this.dispatchEvent(new CustomEvent("change"));
  }

  #onCancel() {
    //TODO: How should we handle canceling the crop?
    this.dispatchEvent(new CustomEvent("change"));
  }

  #onReset() {
    if (!this.value) return;

    delete this.value.coordinates;
    this.dispatchEvent(new CustomEvent("change"));
  }

  #onSliderUpdate(event: InputEvent) {
    const target = event.target as HTMLInputElement;
    this.zoom = Number(target.value);
  }

  #onStartDrag = (event: MouseEvent) => {
    event.preventDefault();

    this.#isDragging = true;
    const imageRect = this.imageElement.getBoundingClientRect();
    const viewportRect = this.viewportElement.getBoundingClientRect();
    this.#mouseOffsetX = event.clientX - imageRect.left + viewportRect.left;
    this.#mouseOffsetY = event.clientY - imageRect.top + viewportRect.top;

    window.addEventListener("mousemove", this.#onDrag);
    window.addEventListener("mouseup", this.#onEndDrag);
  };

  #onDrag = (event: MouseEvent) => {
    if (this.#isDragging) {
      let newLeft = event.clientX - this.#mouseOffsetX;
      let newTop = event.clientY - this.#mouseOffsetY;

      this.#updateImagePosition(newTop, newLeft);
    }
  };

  #onEndDrag = () => {
    this.#isDragging = false;

    window.removeEventListener("mousemove", this.#onDrag);
    window.removeEventListener("mouseup", this.#onEndDrag);
  };

  #onWheel = (event: WheelEvent) => {
    event.preventDefault();
    this.#updateImageScale(event.deltaY * -0.001, event.clientX, event.clientY);
  };

  render() {
    return html`
      <div id="viewport">
        <img id="image" src=${this.src} alt="" />
        <div id="mask"></div>
      </div>
      <input @input=${this.#onSliderUpdate} .value=${this._zoom.toString()} id="slider" type="range" min="0" max="1" value="0" step="0.001" />
      <div id="actions">
        <button @click=${this.#onReset}>Reset crop</button>
        <button @click=${this.#onCancel}>Cancel</button>
        <button @click=${this.#onSave}>Save Crop</button>
      </div>

      <div style="position: absolute; width: fit-content; height: 100px; bottom: 0;">
        DEBUG: Use mouse position for zoom:
        <input
          type="checkbox"
          ?checked=${this.#DEBUG_USE_MOUSE_POSITION_FOR_ZOOM}
          @change=${(e: InputEvent) => {
            this.#DEBUG_USE_MOUSE_POSITION_FOR_ZOOM = (e.target as HTMLInputElement).checked;
          }}
        />
      </div>
    `;
  }

  static styles = css`
    :host {
      display: grid;
      grid-template-rows: 1fr auto;
      gap: 8px;
      height: 100%;
      width: 100%;
    }
    #viewport {
      background-color: #fff;
      background-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill-opacity=".1"><path d="M50 0h50v50H50zM0 50h50v50H0z"/></svg>');
      background-repeat: repeat;
      background-size: 10px 10px;
      contain: strict;
      overflow: hidden;
      position: relative;
      width: 100%;
      height: 100%;
      outline: 1px solid black;
    }

    #mask {
      display: block;
      position: absolute;
      box-shadow: 0 0 0 2000px hsla(0, 0%, 100%, 0.8);
      pointer-events: none;
    }
    #mask::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(1);
      width: 10px;
      height: 10px;
      outline: 1px solid red;
      border-radius: 50%;
    }

    #image {
      display: block;
      position: absolute;
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
