import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import "./image-cropper.element";
import "./image-cropper-focus-setter.element";
import "./image-cropper-preview.element";
import { repeat } from "lit/directives/repeat.js";

@customElement("umb-image-cropper-property-editor")
export class UmbImageCropperPropertyEditorElement extends LitElement {
  @state()
  focalPoint = { x: 0.5, y: 0.5 };

  @state()
  showCrop = true;

  @state()
  image = "src/assets/TEST 4.png";

  crops = [
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
      focalPoint: {
        x: 0.5,
        y: 0.5,
      },
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
      focalPoint: {
        x: 0.5,
        y: 0.5,
      },
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
      focalPoint: {
        x: 0.5,
        y: 0.5,
      },
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
      focalPoint: {
        x: 0.5,
        y: 0.5,
      },
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
      focalPoint: {
        x: 0.5,
        y: 0.5,
      },
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
      focalPoint: {
        x: 0.5,
        y: 0.5,
      },
    },
  ];

  @state()
  currentCrop = this.crops[0];

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
    return this.showCrop
      ? html`<umb-image-cropper .cropHeight=${this.currentCrop.dimensions.height} .cropWidth=${this.currentCrop.dimensions.width}></umb-image-cropper>`
      : html`<umb-image-cropper-focus-setter></umb-image-cropper-focus-setter>`;
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
      display: grid;
      grid-template-columns: 1fr auto;
      height: 600px;
      width: 800px;
      box-sizing: border-box;
      gap: 8px;
    }
    #main,
    #side {
      height: 100%;
    }
    #side {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "umb-image-cropper-property-editor": UmbImageCropperPropertyEditorElement;
  }
}
