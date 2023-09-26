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
  image = "src/assets/image1.png";

  crops = [
    {
      name: "Desktop",
      dimensions: {
        width: 1000,
        height: 800,
      },
      crop: {
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 1,
      },
    },
    {
      name: "Tablet",
      dimensions: {
        width: 800,
        height: 600,
      },
      crop: {
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 1,
      },
    },
    {
      name: "Mobile",
      dimensions: {
        width: 400,
        height: 300,
      },
      crop: {
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 1,
      },
    },
  ];

  render() {
    return html`
      <div id="main">${this.#renderMain()}</div>
      <div id="side">${this.#renderSide()}</div>
    `;
  }

  #renderMain() {
    return this.showCrop ? html`<umb-image-cropper></umb-image-cropper>` : html`<umb-image-cropper-focus-setter></umb-image-cropper-focus-setter>`;
  }

  #renderSide() {
    return repeat(
      this.crops,
      (crop) => crop.name,
      (crop) => html`<umb-image-cropper-preview .crop=${crop} .image=${this.image}></umb-image-cropper-preview>`
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
