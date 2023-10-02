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
      name: "Almost Bot Left",
      dimensions: {
        width: 1000,
        height: 1000,
      },
      crop: {
        x1: 0.04113924050632909,
        y1: 0.32154746835443077,
        x2: 0.3120537974683548,
        y2: 0.031645569620253146,
      },
      focalPoint: this.focalPoint,
    },
    {
      name: "Test",
      dimensions: {
        width: 1000,
        height: 1000,
      },
      crop: {
        x1: 0.3086962025316458,
        y1: 0.04746835443037985,
        x2: 0.04449683544303807,
        y2: 0.305724683544304,
      },
      focalPoint: this.focalPoint,
    },
    {
      name: "Test2",
      dimensions: {
        width: 1000,
        height: 1000,
      },
      crop: {
        x1: 0.3531930379746837,
        y1: 0,
        x2: 0,
        y2: 0.3531930379746837,
      },
      focalPoint: this.focalPoint,
    },
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
        x2: 0,
        y2: 0,
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
        x2: 0,
        y2: 0,
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
        x2: 0,
        y2: 0,
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
        x2: 0,
        y2: 0,
      },
      focalPoint: this.focalPoint,
    },
  ];

  @state()
  currentCrop = this.crops[0];

  #onCropClick(crop: any) {
    this.currentCrop = crop;
    this.showCrop = true;

    this.requestUpdate();
  }

  #onCropChange(event: CustomEvent) {
    console.log(event.detail.crop, this.currentCrop.crop);
  }

  render() {
    return html`
      <div id="main">
        ${this.#renderMain()}
        <button style="margin-top: 8px">Save</button>
      </div>
      <div id="side">${this.#renderSide()}</div>
    `;
  }

  #renderMain() {
    return this.showCrop
      ? html`<umb-image-cropper @change=${this.#onCropChange} .crop=${this.currentCrop}></umb-image-cropper>`
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
      width: 120px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "umb-image-cropper-property-editor": UmbImageCropperPropertyEditorElement;
  }
}
