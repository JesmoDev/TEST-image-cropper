import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import "./image-cropper.element";
import "./image-cropper-focus-setter.element";
import "./image-cropper-preview.element";
import { repeat } from "lit/directives/repeat.js";
import { UmbImageCropperCrop } from ".";

@customElement("umb-image-cropper-property-editor")
export class UmbImageCropperPropertyEditorElement extends LitElement {
  @state()
  focalPoint = { x: 0.5, y: 0.5 };

  @state()
  showCrop = true;

  @state()
  image = "src/assets/TEST 4.png";

  crops: Array<UmbImageCropperCrop> = [
    {
      name: "TopLeft",
      dimensions: {
        width: 1000,
        height: 1000,
      },
      crop: {
        x1: 0,
        y1: 0,
        x2: 0.5,
        y2: 0.5,
      },
      focalPoint: this.focalPoint,
    },
    {
      name: "bottomRight",
      dimensions: {
        width: 1000,
        height: 1000,
      },
      crop: {
        x1: 0.5,
        y1: 0.5,
        x2: 0,
        y2: 0,
      },
      focalPoint: this.focalPoint,
    },
    {
      name: "Desktop",
      dimensions: {
        width: 1920,
        height: 1080,
      },
      crop: {
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 1,
      },
      focalPoint: this.focalPoint,
    },
    {
      name: "Banner",
      dimensions: {
        width: 1920,
        height: 300,
      },
      crop: {
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 1,
      },
      focalPoint: this.focalPoint,
    },
    {
      name: "Tablet",
      dimensions: {
        width: 600,
        height: 800,
      },
      crop: {
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 1,
      },
      focalPoint: this.focalPoint,
    },
    {
      name: "Mobile",
      dimensions: {
        width: 400,
        height: 800,
      },
      crop: {
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 1,
      },
      focalPoint: this.focalPoint,
    },
  ];

  @state()
  currentCrop = this.crops[1];

  render() {
    return html`
      <div id="main">${this.#renderMain()}</div>
      <div id="side">${this.#renderSide()}</div>
    `;
  }

  #onCropClick(crop: any) {
    this.currentCrop = crop;
    this.showCrop = true;

    this.requestUpdate();
  }

  #renderMain() {
    return this.showCrop ? html`<umb-image-cropper .crop=${this.currentCrop}></umb-image-cropper>` : html`<umb-image-cropper-focus-setter></umb-image-cropper-focus-setter>`;
  }

  #renderSide() {
    return repeat(
      this.crops,
      (crop) => crop.name,
      (crop) => html`<umb-image-cropper-preview @click=${() => this.#onCropClick(crop)} .crop=${crop} .image=${this.image}></umb-image-cropper-preview>`
    );
  }
  static styles = css`
    :host {
      display: flex;
      height: 600px;
      width: 100%;
      box-sizing: border-box;
      gap: 8px;
    }
    #main,
    #side {
      height: 100%;
    }
    #main {
      flex-grow: 1;
    }
    #side {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 150px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "umb-image-cropper-property-editor": UmbImageCropperPropertyEditorElement;
  }
}
