import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("my-element2")
export class MyElement2 extends LitElement {
  @query("#viewport") viewport!: HTMLElement;
  @query("#mask") mask!: HTMLElement;
  @query("#image") image!: HTMLImageElement;

  @property({ type: Number }) cropWidth = 1000;
  @property({ type: Number }) cropHeight = 800;

  @state() viewportPadding = 50;
  @state() imageScale = 1;
  @state() maxScaleFactor = 4;

  private maxScale = 0;
  private minScale = 0;
  private isDragging = false;
  private offsetX = 0;
  private offsetY = 0;

  /* change event props
  crop size
  image original size
  image position
  new image scale

  */

  connectedCallback() {
    super.connectedCallback();
    this.addEventListeners();
    this.#init();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListeners();
  }

  private async addEventListeners() {
    await this.updateComplete;
    this.image.addEventListener("mousedown", this.onStartDrag.bind(this));
    this.addEventListener("mousemove", this.onDrag.bind(this));
    this.addEventListener("mouseup", this.onEndDrag.bind(this));
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    this.addEventListener("wheel", this.onWheel.bind(this));
  }

  private removeEventListeners() {
    this.image.removeEventListener("mousedown", this.onStartDrag.bind(this));
    this.removeEventListener("mousemove", this.onDrag.bind(this));
    this.removeEventListener("mouseup", this.onEndDrag.bind(this));
    this.removeEventListener("wheel", this.onWheel.bind(this));
    window.removeEventListener("keydown", this.onKeyDown.bind(this));
  }

  private onStartDrag(event: MouseEvent) {
    event.preventDefault();
    this.isDragging = true;
    const imageRect = this.image.getBoundingClientRect();
    const viewportRect = this.viewport.getBoundingClientRect();
    this.offsetX = event.clientX - imageRect.left + viewportRect.left;
    this.offsetY = event.clientY - imageRect.top + viewportRect.top;
  }

  private onDrag(event: MouseEvent) {
    if (this.isDragging) {
      let newLeft = event.clientX - this.offsetX;
      let newTop = event.clientY - this.offsetY;

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

  async #init() {
    // Makes sure the image is loaded before calculating the layout
    await this.updateComplete;
    await new Promise((resolve) => (this.image.onload = () => resolve(this.image)));

    const cropAspectRatio = this.cropWidth / this.cropHeight;

    const viewportWidth = this.viewport.clientWidth;
    const viewportHeight = this.viewport.clientHeight;
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

    this.mask.style.width = `${maskWidth}px`;
    this.mask.style.height = `${maskHeight}px`;
    this.mask.style.left = `${maskLeft}px`;
    this.mask.style.top = `${maskTop}px`;

    // Calculate the scaling factors to fill the mask area while preserving aspect ratio
    const scaleX = maskWidth / this.image.naturalWidth;
    const scaleY = maskHeight / this.image.naturalHeight;
    this.imageScale = Math.max(scaleX, scaleY);
    this.minScale = this.imageScale;
    this.maxScale = this.imageScale * this.maxScaleFactor;

    // Set the image size to fill the mask while preserving aspect ratio
    const imageWidth = this.image.naturalWidth * this.minScale;
    const imageHeight = this.image.naturalHeight * this.minScale;

    // Center the image within the mask
    const imageLeft = maskLeft + (maskWidth - imageWidth) / 2;
    const imageTop = maskTop + (maskHeight - imageHeight) / 2;

    this.image.style.width = `${imageWidth}px`;
    this.image.style.height = `${imageHeight}px`;
    this.image.style.left = `${imageLeft}px`;
    this.image.style.top = `${imageTop}px`;
  }

  #updateImageScale(amount: number, mouseX?: number, mouseY?: number) {
    const maskRect = this.mask.getBoundingClientRect();
    const imageRect = this.image.getBoundingClientRect();

    // Calculate the new zoom factor
    // TODO: How do i make this feel more natural?
    const newScale = this.#clamp(this.imageScale + amount * (this.imageScale * this.imageScale), this.minScale, this.maxScale);

    let fixedLocation = { x: 0, y: 0 };

    if (mouseX && mouseY) {
      fixedLocation = this.#toLocalPosition(mouseX, mouseY);
    } else {
      fixedLocation = this.#toLocalPosition(maskRect.left + maskRect.width / 2, maskRect.top + maskRect.height / 2);
    }
    //TODO: Use mouse position instead of center of mask with scroll
    const imageLocation = this.#toLocalPosition(imageRect.left, imageRect.top);

    // Calculate the new image position to keep the center of the mask fixed
    const imageLeft = fixedLocation.x - (fixedLocation.x - imageLocation.x) * (newScale / this.imageScale);
    const imageTop = fixedLocation.y - (fixedLocation.y - imageLocation.y) * (newScale / this.imageScale);

    this.imageScale = newScale;

    this.image.style.width = `${this.image.naturalWidth * this.imageScale}px`;
    this.image.style.height = `${this.image.naturalHeight * this.imageScale}px`;

    this.#updateImagePosition(imageTop, imageLeft);
  }

  #updateImagePosition(top: number, left: number) {
    const maskRect = this.mask.getBoundingClientRect();
    const imageRect = this.image.getBoundingClientRect();

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
    left = this.#clamp(left, minLeft, maxLeft);
    top = this.#clamp(top, minTop, maxTop);

    this.image.style.left = `${left}px`;
    this.image.style.top = `${top}px`;
  }

  #toLocalPosition(x: number, y: number) {
    const viewportRect = this.viewport.getBoundingClientRect();

    return {
      x: x - viewportRect.left,
      y: y - viewportRect.top,
    };
  }

  #clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  render() {
    return html`
      <div id="viewport">
        <img id="image" src="src/assets/image1.png" alt="" />
        <div id="mask"></div>
      </div>
    `;
  }
  static styles = css`
    :host {
      display: block;
      height: 800px;
      width: 1200px;
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
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "my-element2": MyElement2;
  }
}
