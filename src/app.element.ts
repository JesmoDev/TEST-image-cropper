import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import './image-cropper/image-cropper-property-editor.element';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-app')
export class AppElement extends LitElement {
	_testCrops = [
		{
			focalPoint: { left: 0.5, top: 0.5 },
			src: 'src/assets/TEST 4.png',
			crops: [
				{
					alias: 'Almost Bot Left',
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
					alias: 'Almost top right',
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
					alias: 'TopLeft',
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
					alias: 'bottomRight',
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
					alias: 'Gigantic crop',
					width: 40200,
					height: 104000,
				},
				{
					alias: 'Desktop',
					width: 1920,
					height: 1080,
				},
				{
					alias: 'Banner',
					width: 1920,
					height: 300,
				},
				{
					alias: 'Tablet',
					width: 600,
					height: 800,
				},
				{
					alias: 'Mobile',
					width: 400,
					height: 800,
				},
			],
		},
		{
			focalPoint: { left: 0.5, top: 0.5 },
			src: 'src/assets/image1.png',
			crops: [
				{
					alias: 'Square',
					width: 1000,
					height: 1000,
				},
				{
					alias: 'Desktop',
					width: 1920,
					height: 1080,
				},
				{
					alias: 'Banner',
					width: 1920,
					height: 300,
				},
				{
					alias: 'Tablet',
					width: 600,
					height: 800,
				},
				{
					alias: 'Mobile',
					width: 400,
					height: 800,
				},
			],
		},
	];

	@state()
	_value? = [...this._testCrops][0];

	async #onChangeImage(index: number) {
		this._value = undefined;
		this.requestUpdate();
		await this.updateComplete;
		this._value = [...this._testCrops][index];
		this.requestUpdate();
	}

	render() {
		if (!this._value) return nothing;
		return html`
			<div id="left-panel">
				<div id="buttons">
					<button @click=${() => this.#onChangeImage(0)}>Test Image 1</button>
					<button @click=${() => this.#onChangeImage(1)}>Test Image 2</button>
				</div>
				<b>Property editor value</b>
			</div>
			<umb-image-cropper-property-editor .value=${this._value}></umb-image-cropper-property-editor>
		`;
	}
	static styles = css`
		:host {
			display: flex;
			color: #1f1f1f;
			padding: 32px;
			box-sizing: border-box;
		}

		#left-panel {
			width: 300px;
			height: 100%;
			flex-shrink: 0;
			margin-right: 16px;
			padding: 16px;
			box-sizing: border-box;
			margin-top: -16px;
			margin-left: -16px;
		}

		#buttons {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 8px;
			margin-bottom: 16px;
		}

		button {
			padding: 16px;
			color: white;
			background-color: #334eaf;
			border: none;
			border-radius: 4px;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'my-app': AppElement;
	}
}
