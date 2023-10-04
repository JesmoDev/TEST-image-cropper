import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./image-cropper.element";
import "./image-cropper-focus-setter.element";
import "./image-cropper-preview.element";
import { repeat } from "lit/directives/repeat.js";
import { UmbImageCropperPropertyEditorValue } from ".";
import { UmbImageCropperElement } from "./image-cropper.element";

@customElement("umb-image-cropper-property-editor")
export class UmbImageCropperPropertyEditorElement extends LitElement {
  @property({ attribute: false })
  get value() {
    return this.#value;
  }
  set value(value) {
    if (!value) {
      this.crops = [];
      this.focalPoint = { left: 0.5, top: 0.5 };
      this.src = "";
      this.#value = undefined;
    } else {
      this.crops = [...value.crops];
      this.focalPoint = value.focalPoint;
      this.src = value.src;
      this.#value = value;
    }

    this.requestUpdate();
  }

  #value? = {
    focalPoint: { left: 0.5, top: 0.5 },
    src: "src/assets/TEST 4.png",
    crops: [
      {
        alias: "Almost Bot Left",
        width: 1000,
        height: 1000,
        coordinates: {
          x1: 0.04113924050632909,
          x2: 0.3120537974683548,
          y1: 0.32154746835443077,
          y2: 0.031645569620253146,
        },
      },
      {
        alias: "Test",
        width: 1000,
        height: 1000,
        coordinates: {
          x1: 0.3086962025316458,
          x2: 0.04449683544303807,
          y1: 0.04746835443037985,
          y2: 0.305724683544304,
        },
      },
      {
        alias: "Test2",
        width: 1000,
        height: 1000,
        coordinates: {
          x1: 0.3531930379746837,
          x2: 0,
          y1: 0,
          y2: 0.3531930379746837,
        },
      },
      {
        alias: "TopLeft",
        width: 1000,
        height: 1000,
        coordinates: {
          x1: 0,
          x2: 0.5,
          y1: 0,
          y2: 0.5,
        },
      },
      {
        alias: "bottomRight",
        width: 1000,
        height: 1000,
        coordinates: {
          x1: 0.5,
          x2: 0,
          y1: 0.5,
          y2: 0,
        },
      },
      {
        alias: "Desktop",
        width: 1920,
        height: 1080,
      },
      {
        alias: "Banner",
        width: 1920,
        height: 300,
      },
      {
        alias: "Tablet",
        width: 600,
        height: 800,
      },
      {
        alias: "Mobile",
        width: 400,
        height: 800,
      },
    ],
  };

  @state()
  currentCrop?: UmbImageCropperPropertyEditorValue["crops"][number];

  @state()
  crops: UmbImageCropperPropertyEditorValue["crops"] = [];

  @state()
  focalPoint: UmbImageCropperPropertyEditorValue["focalPoint"] = { left: 0.5, top: 0.5 };

  @state()
  src: UmbImageCropperPropertyEditorValue["src"] = "";

  constructor() {
    super();

    //TODO: Remove this
    this.value = this.#value;
  }

  async #onCropClick(crop: any) {
    const index = this.crops.findIndex((c) => c.alias === crop.alias);

    if (index === undefined) return;

    //TODO WHY DO I HAVE TO DO THIS TO MAKE LIT UPDATE THE DOM??
    this.currentCrop = undefined;
    this.requestUpdate();
    await this.updateComplete;
    this.currentCrop = this.crops[index!];
    this.requestUpdate();
  }

  async #onCropChange(event: CustomEvent) {
    const target = event.target as UmbImageCropperElement;
    const value = target.value;

    if (!value) return;

    const index = this.crops.findIndex((crop) => crop.alias === value.alias);

    if (index === undefined) return;

    this.crops[index] = value;
    this.currentCrop = undefined;

    //TODO WHY DO I HAVE TO DO THIS TO MAKE LIT UPDATE THE DOM??
    const temp = this.crops;
    this.crops = [];
    this.requestUpdate();
    await this.updateComplete;
    this.crops = temp;
  }

  #onFocalPointChange(event: CustomEvent) {
    this.focalPoint = event.detail;
  }

  #onSave() {
    this.value = {
      focalPoint: this.focalPoint,
      src: this.src,
      crops: this.crops,
    };
  }

  render() {
    return html`
      <div id="main">
        ${this.#renderMain()}
        <div id="actions">
          <button @click=${this.#onSave} style="margin-top: 8px">Save editor</button>
        </div>
      </div>
      <div id="side">${this.#renderSide()}</div>
      <div style="position: absolute; top: 0; left: 0">
        <pre>${JSON.stringify(this.value, null, 2)}</pre>
      </div>
    `;
  }

  #renderMain() {
    return this.currentCrop
      ? html`<umb-image-cropper @change=${this.#onCropChange} .src=${this.src} .focalPoint=${this.focalPoint} .value=${this.currentCrop}></umb-image-cropper>`
      : html`<umb-image-cropper-focus-setter @change=${this.#onFocalPointChange} .focalPoint=${this.focalPoint} .src=${this.src}></umb-image-cropper-focus-setter>`;
  }

  #renderSide() {
    if (!this.value || !this.crops) return;

    return repeat(
      this.crops,
      (crop) => crop.alias,
      (crop) => html` <umb-image-cropper-preview @click=${() => this.#onCropClick(crop)} .crop=${crop} .focalPoint=${this.focalPoint} .src=${this.src}></umb-image-cropper-preview>`
    );
  }
  static styles = css`
    :host {
      display: flex;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      gap: 8px;
    }
    #main,
    #side {
      height: 100%;
    }
    #main {
      width: 600px;
      height: 600px;
      flex-shrink: 0;
    }
    #side {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 8px;
      flex-grow: 1;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "umb-image-cropper-property-editor": UmbImageCropperPropertyEditorElement;
  }
}
