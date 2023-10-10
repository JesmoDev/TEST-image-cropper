import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import './image-cropper.element';
import './image-cropper-focus-setter.element';
import './image-cropper-preview.element';
import { repeat } from 'lit/directives/repeat.js';
import {
	UmbImageCropperCrop,
	UmbImageCropperCrops,
	UmbImageCropperFocalPoint,
	UmbImageCropperPropertyEditorValue,
} from '.';
import { UmbImageCropperElement } from './image-cropper.element';

@customElement('umb-image-cropper-property-editor')
export class UmbImageCropperPropertyEditorElement extends LitElement {
	@property({ attribute: false })
	get value() {
		return this.#value;
	}
	set value(value) {
		if (!value) {
			this.crops = [];
			this.focalPoint = { left: 0.5, top: 0.5 };
			this.src = '';
			this.#value = undefined;
		} else {
			this.crops = [...value.crops];
			this.focalPoint = value.focalPoint;
			this.src = value.src;
			this.#value = value;
		}

		this.requestUpdate();
	}

	#value?: UmbImageCropperPropertyEditorValue;

	@state()
	currentCrop?: UmbImageCropperCrop;

	@state()
	crops: UmbImageCropperCrops = [];

	@state()
	focalPoint: UmbImageCropperFocalPoint = { left: 0.5, top: 0.5 };

	@state()
	showCropper = false;

	@state()
	src = '';

	async #onCropClick(crop: any) {
		const index = this.crops.findIndex((c) => c.alias === crop.alias);

		if (index === -1) return;

		this.currentCrop = { ...this.crops[index] };
		this.showCropper = true;
	}

	#onCropChange(event: CustomEvent) {
		const target = event.target as UmbImageCropperElement;
		const value = target.value;

		if (!value) return;

		const index = this.crops.findIndex((crop) => crop.alias === value.alias);

		if (index === undefined) return;

		this.crops[index] = value;
		this.currentCrop = undefined;
		this.showCropper = false;
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

			<!-- DEBUG INFO (REMOVE LATER) -->
			<div style="position: absolute; top: 90px; left: 0">
				<pre>${JSON.stringify(this.value, null, 2)}</pre>
			</div>
			<!-- DEBUG INFO (REMOVE LATER) -->
		`;
	}

	#renderMain() {
		return this.showCropper
			? html`<umb-image-cropper
					@change=${this.#onCropChange}
					.src=${this.src}
					.focalPoint=${this.focalPoint}
					.value=${this.currentCrop}></umb-image-cropper>`
			: html`<umb-image-cropper-focus-setter
					@change=${this.#onFocalPointChange}
					.focalPoint=${this.focalPoint}
					.src=${this.src}></umb-image-cropper-focus-setter>`;
	}

	#renderSide() {
		if (!this.value || !this.crops) return;

		return repeat(
			this.crops,
			(crop) => crop.alias + JSON.stringify(crop.coordinates),
			(crop) =>
				html` <umb-image-cropper-preview
					@click=${() => this.#onCropClick(crop)}
					.crop=${crop}
					.focalPoint=${this.focalPoint}
					.src=${this.src}></umb-image-cropper-preview>`
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
		'umb-image-cropper-property-editor': UmbImageCropperPropertyEditorElement;
	}
}
