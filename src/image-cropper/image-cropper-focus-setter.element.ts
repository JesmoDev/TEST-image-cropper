import { LitElement, css, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { clamp } from "./mathUtils";

@customElement("umb-image-cropper-focus-setter")
export class UmbImageCropperFocusSetterElement extends LitElement {
  @query("#image") imageElement!: HTMLImageElement;
  @query("#focal-point") focalPointElement!: HTMLImageElement;

  @property({ type: String }) src?: string;

  connectedCallback() {
    super.connectedCallback();
    this.#addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#removeEventListeners();
  }

  async #addEventListeners() {
    await this.updateComplete;
    this.imageElement.addEventListener("mousedown", this.#onStartDrag);
    window.addEventListener("mouseup", this.#onEndDrag);
  }

  #removeEventListeners() {
    this.imageElement.removeEventListener("mousedown", this.#onStartDrag);
    window.removeEventListener("mouseup", this.#onEndDrag);
  }

  #onStartDrag = (event: MouseEvent) => {
    event.preventDefault();
    window.addEventListener("mousemove", this.#onDrag);
  };

  #onEndDrag = (event: MouseEvent) => {
    event.preventDefault();
    window.removeEventListener("mousemove", this.#onDrag);
  };

  #onDrag = (event: MouseEvent) => {
    event.preventDefault();
    this.#onSetFocalPoint(event);
  };

  #onSetFocalPoint(event: MouseEvent) {
    event.preventDefault();

    const viewport = this.getBoundingClientRect();
    const image = this.imageElement.getBoundingClientRect();

    const x = clamp(event.clientX - image.left, 0, image.width);
    const y = clamp(event.clientY - image.top, 0, image.height);

    const left = clamp(x / image.width, 0, 1);
    const top = clamp(y / image.height, 0, 1);

    this.focalPointElement.style.left = `${x + image.left - viewport.left - 6}px`;
    this.focalPointElement.style.top = `${y + image.top - viewport.top - 6}px`;

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { left, top },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (!this.src) return nothing;

    return html`
      <img id="image" @click=${this.#onSetFocalPoint} src=${this.src} alt="" />
      <div id="focal-point"></div>
    `;
  }
  static styles = css`
    :host {
      display: flex;
      width: 100%;
      height: 100%;
      border: 1px solid black;
      position: relative;
      user-select: none;
    }
    #image {
      max-width: 100%;
      max-height: 100%;
      margin: auto;
      position: relative;
    }
    #focal-point {
      content: "";
      display: block;
      position: absolute;
      width: 12px;
      height: 12px;
      outline: 3px solid black;
      top: 0;
      border-radius: 50%;
      pointer-events: none;
      background-color: white;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "umb-image-cropper-focus-setter": UmbImageCropperFocusSetterElement;
  }
}
