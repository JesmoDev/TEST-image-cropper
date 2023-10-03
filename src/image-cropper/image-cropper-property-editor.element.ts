import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import "./image-cropper.element";
import "./image-cropper-focus-setter.element";
import "./image-cropper-preview.element";
import { repeat } from "lit/directives/repeat.js";
import { UmbImageCropperPropertyEditorValue } from ".";

@customElement("umb-image-cropper-property-editor")
export class UmbImageCropperPropertyEditorElement extends LitElement {
  @state()
  focalPoint = { x: 0.5, y: 0.5 };

  @property({ type: Object, attribute: false })
  value?: UmbImageCropperPropertyEditorValue = {
    focalPoint: { left: 0.5, top: 0.5 },
    src: "src/assets/TEST 4.png",
    crops: [
      {
        alias: "Almost Bot Left",
        width: 1000,
        height: 1000,
        coordinates: {
          x1: 0.04113924050632909,
          y1: 0.32154746835443077,
          x2: 0.3120537974683548,
          y2: 0.031645569620253146,
        },
      },
      {
        alias: "Test",
        width: 1000,
        height: 1000,
        coordinates: {
          x1: 0.3086962025316458,
          y1: 0.04746835443037985,
          x2: 0.04449683544303807,
          y2: 0.305724683544304,
        },
      },
      {
        alias: "Test2",
        width: 1000,
        height: 1000,
        coordinates: {
          x1: 0.3531930379746837,
          y1: 0,
          x2: 0,
          y2: 0.3531930379746837,
        },
      },
      {
        alias: "TopLeft",
        width: 1000,
        height: 1000,
        coordinates: {
          x1: 0,
          y1: 0,
          x2: 0.5,
          y2: 0.5,
        },
      },
      {
        alias: "bottomRight",
        width: 1000,
        height: 1000,
        coordinates: {
          x1: 0.5,
          y1: 0.5,
          x2: 0,
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
  currentCrop = this.value?.crops[0];

  #onCropClick(crop: any) {
    this.currentCrop = crop;

    this.requestUpdate();
  }

  #onCropChange(event: CustomEvent) {}

  #onSave = () => {
    if (!this.value) return;
    const temp = this.value.crops;

    // TODO: Fix this
    // WHY DO I HAVE TO DO THIS!??!?!?
    this.value.crops = [];

    this.requestUpdate();
    requestAnimationFrame(() => {
      if (!this.value) return;
      this.value.crops = temp;
      this.requestUpdate();
    });
  };

  render() {
    return html`
      <div id="main">
        ${this.#renderMain()}
        <button @click=${this.#onSave} style="margin-top: 8px">Save</button>
      </div>
      <div id="side">${this.#renderSide()}</div>
      <div style="position: absolute; bottom: 20px;">
        <pre>${JSON.stringify(this.value, null, 2)}</pre>
      </div>
    `;
  }

  #renderMain() {
    return this.currentCrop
      ? html`<umb-image-cropper @change=${this.#onCropChange} .value=${this.currentCrop}></umb-image-cropper>`
      : html`<umb-image-cropper-focus-setter></umb-image-cropper-focus-setter>`;
  }

  #renderSide() {
    if (!this.value || !this.value?.crops) return;

    return repeat(this.value.crops, (crop) => html`<umb-image-cropper-preview @click=${() => this.#onCropClick(crop)} .crop=${crop} .src=${this.value!.src}></umb-image-cropper-preview>`);
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
