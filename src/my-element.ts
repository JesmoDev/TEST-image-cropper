import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {
	@query('#viewport') viewport!: HTMLElement;
	@query('#mask') mask!: HTMLElement;
	@query('#image') image!: HTMLImageElement;

	@property({ type: Number }) cropWidth = 1000;
	@property({ type: Number }) cropHeight = 800;

	@state() viewportPadding = 50;

	constructor() {
		super();

		this.#init();
	}

	async #init() {
		await this.updateComplete;

		const cropAspectRatio = this.cropWidth / this.cropHeight;

		const viewportWidth = this.viewport.clientWidth;
		const viewportHeight = this.viewport.clientHeight;
		const viewportAspectRatio = viewportWidth / viewportHeight;

		let maskWidth = 0;
		let maskHeight = 0;

		if (cropAspectRatio > viewportAspectRatio) {
			maskWidth = viewportWidth - this.viewportPadding * 2;
			maskHeight = (viewportWidth - this.viewportPadding * 2) / cropAspectRatio;
		} else {
			maskHeight = viewportHeight - this.viewportPadding * 2;
			maskWidth = (viewportHeight - this.viewportPadding * 2) * cropAspectRatio;
		}

		const maskLeft = (viewportWidth - maskWidth) / 2;
		const maskTop = (viewportHeight - maskHeight) / 2;

		this.mask.style.width = `${maskWidth}px`;
		this.mask.style.height = `${maskHeight}px`;
		this.mask.style.left = `${maskLeft}px`;
		this.mask.style.top = `${maskTop}px`;

		// Calculate the scaling factors to fill the mask area while preserving aspect ratio
		const scaleX = maskWidth / this.image.naturalWidth;
		const scaleY = maskHeight / this.image.naturalHeight;
		const scale = Math.max(scaleX, scaleY);

		// Set the image size to fill the mask while preserving aspect ratio
		const imageWidth = this.image.naturalWidth * scale;
		const imageHeight = this.image.naturalHeight * scale;

		// Center the image within the mask
		const imageLeft = maskLeft + (maskWidth - imageWidth) / 2;
		const imageTop = maskTop + (maskHeight - imageHeight) / 2;

		this.image.style.width = `${imageWidth}px`;
		this.image.style.height = `${imageHeight}px`;
		this.image.style.left = `${imageLeft}px`;
		this.image.style.top = `${imageTop}px`;
	}

	render() {
		return html`
			<div id="viewport">
				<img id="image" src="src/assets/image1.png" alt="" />
				<div id="mask"></div>
			</div>
		`;
	}
	static styles = css`
		:host {
			display: block;
			height: 800px;
			width: 1200px;
		}
		#viewport {
			background-color: #fff;
			background-image: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill-opacity=".1"><path d="M50 0h50v50H50zM0 50h50v50H0z"/></svg>');
			background-repeat: repeat;
			background-size: 10px 10px;
			contain: strict;
			overflow: hidden;
			position: relative;
			width: 100%;
			height: 100%;
		}

		#mask {
			display: block;
			position: absolute;
			box-shadow: 0 0 0 2000px hsla(0, 0%, 100%, 0.8);
		}

		#image {
			display: block;
			position: absolute;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'my-element': MyElement;
	}
}
