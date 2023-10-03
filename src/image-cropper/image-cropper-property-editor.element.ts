import { LitElement, css, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import "./image-cropper.element";
import "./image-cropper-focus-setter.element";
import "./image-cropper-preview.element";
import { repeat } from "lit/directives/repeat.js";
import { UmbImageCropperPropertyEditorValue } from ".";

@customElement("umb-image-cropper-property-editor")
export class UmbImageCropperPropertyEditorElement extends LitElement {
  @property({ type: Object, attribute: false })
  get value() {
    return this.#value;
  }
  set value(value) {
    this.crops = value?.crops ?? [];
    this.focalPoint = value?.focalPoint ?? { left: 0.5, top: 0.5 };
    this.src = value?.src ?? "";
    this.#value = value;

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

  /**
   *
   */
  constructor() {
    super();
    this.value = this.#value;
  }

  async #onCropClick(crop: any) {
    const index = this.value?.crops.findIndex((c) => c.alias === crop.alias);

    this.currentCrop = undefined;
    this.requestUpdate();
    await this.updateComplete;
    this.currentCrop = this.value?.crops[index!];
    this.requestUpdate();
  }

  async #onCropChange(event: CustomEvent) {
    if (!this.currentCrop) return;

    this.currentCrop.coordinates = event.detail.crop;

    if (!this.value?.crops) return;

    const temp = [...this.value.crops];

    this.value.crops = [];
    this.requestUpdate();
    await this.updateComplete;
    this.value.crops = temp;
    this.requestUpdate();
  }

  async #onFocalPointChange(event: CustomEvent) {
    this.focalPoint = event.detail;
    this.requestUpdate();
  }

  #onSave = () => {
    //TODO Save
  };

  #onCancel = () => {
    this.currentCrop = undefined;
    this.requestUpdate();
  };

  render() {
    return html`
      <div id="main">
        ${this.#renderMain()}
        <div id="actions">
          <button @click=${this.#onSave} style="margin-top: 8px">Save</button>
          <button @click=${this.#onCancel} style="margin-top: 8px">Cancel</button>
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
      this.value.crops,
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
      flex-grow: 1;
      height: 600px;
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
