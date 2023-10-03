import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import "./image-cropper.element";
import "./image-cropper-focus-setter.element";
import "./image-cropper-preview.element";
import { repeat } from "lit/directives/repeat.js";
import { UmbImageCropperPropertyEditorValue } from ".";

@customElement("umb-image-cropper-property-editor")
export class UmbImageCropperPropertyEditorElement extends LitElement {
  @property({ type: Object, attribute: false })
  value?: UmbImageCropperPropertyEditorValue = {
    focalPoint: { left: 0.5, top: 0.25 },
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
  currentCrop = this.value?.crops[5];

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

  #onSave = () => {
    //TODO Save
  };

  render() {
    return html`
      <div id="main">
        ${this.#renderMain()}
        <button @click=${this.#onSave} style="margin-top: 8px">Save</button>
      </div>
      <div id="side">${this.#renderSide()}</div>
      <div style="position: absolute; top: 0; left: 0">
        <pre>${JSON.stringify(this.value, null, 2)}</pre>
      </div>
    `;
  }

  #renderMain() {
    return this.currentCrop
      ? html`<umb-image-cropper @change=${this.#onCropChange} .focalPoint=${this.value!.focalPoint} .value=${this.currentCrop}></umb-image-cropper>`
      : html`<umb-image-cropper-focus-setter></umb-image-cropper-focus-setter>`;
  }

  #renderSide() {
    if (!this.value || !this.value?.crops) return;

    return repeat(
      this.value.crops,
      (crop) => html` <umb-image-cropper-preview @click=${() => this.#onCropClick(crop)} .crop=${crop} .focalPoint=${this.value!.focalPoint} .src=${this.value!.src}></umb-image-cropper-preview>`
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
