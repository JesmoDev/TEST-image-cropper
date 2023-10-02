import { LitElement, PropertyValueMap, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { UmbImageCropperCrop } from ".";
import { clamp, inverseLerp, lerp } from "./mathUtils";

@customElement("umb-image-cropper")
export class UmbImageCropperElement extends LitElement {
  @query("#viewport") viewportElement!: HTMLElement;
  @query("#mask") maskElement!: HTMLElement;
  @query("#image") imageElement!: HTMLImageElement;

  @property({ attribute: false }) crop?: UmbImageCropperCrop;

  // @property({ type: Number }) cropWidth = 1000;
  // @property({ type: Number }) cropHeight = 800;
  @property({ type: Number })
  get zoom() {
    return this._zoom;
  }
  set zoom(value) {
    const delta = value - this._zoom;
    this.#updateImageScale(delta);
  }

  @state() private viewportPadding = 50;
  @state() private maxScaleFactor = 4;
  @state() private _zoom = 0;

  private maxImageScale = 0;
  private minImageScale = 0;
  private oldImageScale = 0;
  private isDragging = false;
  private mouseOffsetX = 0;
  private mouseOffsetY = 0;

  get imageScale() {
    return lerp(this.minImageScale, this.maxImageScale, this._zoom);
  }

  /* change event props
  crop size
  image original size
  image position
  new image scale

  */

  connectedCallback() {
    super.connectedCallback();
    this.addEventListeners();
    this.#init2();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListeners();
  }

  protected update(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    super.update(changedProperties);
    if (changedProperties.has("crop")) {
      this.#init2();
    }
  }

  private async addEventListeners() {
    await this.updateComplete;
    this.imageElement.addEventListener("mousedown", this.onStartDrag.bind(this));
    window.addEventListener("mousemove", this.onDrag.bind(this));
    window.addEventListener("mouseup", this.onEndDrag.bind(this));
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    this.addEventListener("wheel", this.onWheel.bind(this));
  }

  private removeEventListeners() {
    this.imageElement.removeEventListener("mousedown", this.onStartDrag.bind(this));
    window.removeEventListener("mousemove", this.onDrag.bind(this));
    window.removeEventListener("mouseup", this.onEndDrag.bind(this));
    this.removeEventListener("wheel", this.onWheel.bind(this));
    window.removeEventListener("keydown", this.onKeyDown.bind(this));
  }

  private onStartDrag(event: MouseEvent) {
    event.preventDefault();
    this.isDragging = true;
    const imageRect = this.imageElement.getBoundingClientRect();
    const viewportRect = this.viewportElement.getBoundingClientRect();
    this.mouseOffsetX = event.clientX - imageRect.left + viewportRect.left;
    this.mouseOffsetY = event.clientY - imageRect.top + viewportRect.top;
  }

  private onDrag(event: MouseEvent) {
    if (this.isDragging) {
      let newLeft = event.clientX - this.mouseOffsetX;
      let newTop = event.clientY - this.mouseOffsetY;

      this.#updateImagePosition(newTop, newLeft);
    }
  }

  private onEndDrag() {
    this.isDragging = false;
  }

  private onWheel(event: WheelEvent) {
    event.preventDefault();
    this.#updateImageScale(event.deltaY * -0.001, event.clientX, event.clientY);
  }

  private onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.#updateImageScale(0.1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      this.#updateImageScale(-0.1);
    }
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

  async #init2() {
    if (!this.crop) return;

    await this.updateComplete;

    if (!this.imageElement.complete) {
      await new Promise((resolve) => (this.imageElement.onload = () => resolve(this.imageElement)));
    }

    this._zoom = 0;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const cropAspectRatio = this.crop.dimensions.width / this.crop.dimensions.height;
    const imageAspectRatio = this.imageElement.naturalWidth / this.imageElement.naturalHeight;

    const viewportWidth = this.viewportElement.clientWidth;
    const viewportHeight = this.viewportElement.clientHeight;
    const viewportAspectRatio = viewportWidth / viewportHeight;

    let maskWidth = 0;
    let maskHeight = 0;
    let imageWidth = 0;
    let imageHeight = 0;

    if (cropAspectRatio > viewportAspectRatio) {
      maskWidth = viewportWidth - this.viewportPadding * 2;
      maskHeight = (viewportWidth - this.viewportPadding * 2) / cropAspectRatio;
    } else {
      maskHeight = viewportHeight - this.viewportPadding * 2;
      maskWidth = (viewportHeight - this.viewportPadding * 2) * cropAspectRatio;
    }

    const maskLeft = (viewportWidth - maskWidth) / 2;
    const maskTop = (viewportHeight - maskHeight) / 2;

    this.maskElement.style.width = `${maskWidth}px`;
    this.maskElement.style.height = `${maskHeight}px`;
    this.maskElement.style.left = `${maskLeft}px`;
    this.maskElement.style.top = `${maskTop}px`;

    if (cropAspectRatio > 1) {
      const cropSize = 1 - this.#calculateDistance(this.crop.crop.x1, this.crop.crop.x2);
      imageWidth = this.#calculateIncreasedValue(maskWidth, cropSize);
      imageHeight = imageWidth / imageAspectRatio;
      this.imageElement.style.width = `${this.#calculateIncreasedValue(maskWidth, cropSize)}px`;
      this.imageElement.style.top = `${-imageHeight * this.crop.crop.y1 + maskTop}px`;
      this.imageElement.style.left = `${-imageWidth * this.crop.crop.x1 + maskLeft}px`;
    } else {
      const cropSize = 1 - this.#calculateDistance(this.crop.crop.y1, this.crop.crop.y2);
      imageHeight = this.#calculateIncreasedValue(maskHeight, cropSize);
      imageWidth = imageHeight * imageAspectRatio;
      this.imageElement.style.height = `${this.#calculateIncreasedValue(maskHeight, cropSize)}px`;
      this.imageElement.style.top = `${-imageHeight * this.crop.crop.y1 + maskTop}px`;
      this.imageElement.style.left = `${-imageWidth * this.crop.crop.x1 + maskLeft}px`;
    }

    // Calculate the scaling factors to fill the mask area while preserving aspect ratio
    const scaleX = maskWidth / this.imageElement.naturalWidth;
    const scaleY = maskHeight / this.imageElement.naturalHeight;
    const scale = Math.max(scaleX, scaleY);
    this.minImageScale = scale;
    this.maxImageScale = scale * this.maxScaleFactor;

    const currentScaleX = imageWidth / this.imageElement.naturalWidth;
    const currentScaleY = imageHeight / this.imageElement.naturalHeight;
    const currentScale = Math.max(currentScaleX, currentScaleY);

    this._zoom = inverseLerp(this.minImageScale, this.maxImageScale, currentScale);
  }

  async #init() {
    if (!this.crop) return;

    // Makes sure the image is loaded before calculating the layout
    await this.updateComplete;

    if (!this.imageElement.complete) {
      await new Promise((resolve) => (this.imageElement.onload = () => resolve(this.imageElement)));
    }

    this._zoom = 0;

    const cropAspectRatio = this.crop.dimensions.width / this.crop.dimensions.height;

    const viewportWidth = this.viewportElement.clientWidth;
    const viewportHeight = this.viewportElement.clientHeight;
    const viewportAspectRatio = viewportWidth / viewportHeight;

    let maskWidth = 0;
    let maskHeight = 0;

    if (cropAspectRatio > viewportAspectRatio) {
      maskWidth = viewportWidth - this.viewportPadding * 2;
      maskHeight = (viewportWidth - this.viewportPadding * 2) / cropAspectRatio;
    } else {
      maskHeight = viewportHeight - this.viewportPadding * 2;
      maskWidth = (viewportHeight - this.viewportPadding * 2) * cropAspectRatio;
    }

    const maskLeft = (viewportWidth - maskWidth) / 2;
    const maskTop = (viewportHeight - maskHeight) / 2;

    this.maskElement.style.width = `${maskWidth}px`;
    this.maskElement.style.height = `${maskHeight}px`;
    this.maskElement.style.left = `${maskLeft}px`;
    this.maskElement.style.top = `${maskTop}px`;

    // Calculate the scaling factors to fill the mask area while preserving aspect ratio
    const scaleX = maskWidth / this.imageElement.naturalWidth;
    const scaleY = maskHeight / this.imageElement.naturalHeight;
    const scale = Math.max(scaleX, scaleY);
    this.minImageScale = scale;
    this.maxImageScale = scale * this.maxScaleFactor;

    // Set the image size to fill the mask while preserving aspect ratio
    const imageWidth = this.imageElement.naturalWidth * this.minImageScale;
    const imageHeight = this.imageElement.naturalHeight * this.minImageScale;

    // Center the image within the mask based on the focal point
    const imageLeft = maskLeft + (maskWidth - imageWidth) * this.crop.focalPoint.x;
    const imageTop = maskTop + (maskHeight - imageHeight) * this.crop.focalPoint.y;

    // const imageLeft = maskLeft + (maskWidth - imageWidth) / 2;
    // const imageTop = maskTop + (maskHeight - imageHeight) / 2;

    this.imageElement.style.width = `${imageWidth}px`;
    this.imageElement.style.height = `${imageHeight}px`;
    this.imageElement.style.left = `${imageLeft}px`;
    this.imageElement.style.top = `${imageTop}px`;

    console.log(maskTop);
  }

  #updateImageScale(amount: number, mouseX?: number, mouseY?: number) {
    this.oldImageScale = this.imageScale;
    this._zoom = clamp(this._zoom + amount, 0, 1);

    const maskRect = this.maskElement.getBoundingClientRect();
    const imageRect = this.imageElement.getBoundingClientRect();

    let fixedLocation = { x: 0, y: 0 };

    if (mouseX && mouseY) {
      fixedLocation = this.#toLocalPosition(mouseX, mouseY);
    } else {
      fixedLocation = this.#toLocalPosition(maskRect.left + maskRect.width / 2, maskRect.top + maskRect.height / 2);
    }

    const imageLocation = this.#toLocalPosition(imageRect.left, imageRect.top);

    // Calculate the new image position to keep the center of the mask fixed
    const imageLeft = fixedLocation.x - (fixedLocation.x - imageLocation.x) * (this.imageScale / this.oldImageScale);
    const imageTop = fixedLocation.y - (fixedLocation.y - imageLocation.y) * (this.imageScale / this.oldImageScale);

    this.imageElement.style.width = `${this.imageElement.naturalWidth * this.imageScale}px`;
    this.imageElement.style.height = `${this.imageElement.naturalHeight * this.imageScale}px`;

    this.#updateImagePosition(imageTop, imageLeft);
  }

  #updateImagePosition(top: number, left: number) {
    const maskRect = this.maskElement.getBoundingClientRect();
    const imageRect = this.imageElement.getBoundingClientRect();

    const imageWidth = imageRect.width;
    const imageHeight = imageRect.height;

    const maskWidth = maskRect.width;
    const maskHeight = maskRect.height;

    // Calculate the minimum and maximum image positions
    const minLeft = this.#toLocalPosition(maskRect.left + maskWidth - imageWidth, 0).x;
    const maxLeft = this.#toLocalPosition(maskRect.left, 0).x;
    const minTop = this.#toLocalPosition(0, maskRect.top + maskHeight - imageHeight).y;
    const maxTop = this.#toLocalPosition(0, maskRect.top).y;

    // Clamp the image position to the min and max values
    left = clamp(left, minLeft, maxLeft);
    top = clamp(top, minTop, maxTop);

    this.imageElement.style.left = `${left}px`;
    this.imageElement.style.top = `${top}px`;
  }

  #toLocalPosition(x: number, y: number) {
    const viewportRect = this.viewportElement.getBoundingClientRect();

    return {
      x: x - viewportRect.left,
      y: y - viewportRect.top,
    };
  }

  #onSliderUpdate(event: InputEvent) {
    const target = event.target as HTMLInputElement;

    this.zoom = Number(target.value);
  }

  render() {
    return html`
      <div id="viewport">
        <img id="image" src="src/assets/TEST 4.png" alt="" />
        <div id="mask"></div>
      </div>
      <input @input=${this.#onSliderUpdate} .value=${this._zoom.toString()} id="slider" type="range" min="0" max="1" value="0" step="0.001" />
    `;
  }
  static styles = css`
    :host {
      display: block;
      height: 100%;
      width: 100%;
      border: 1px solid black;
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
