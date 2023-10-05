import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import './image-cropper.element';
import './image-cropper-focus-setter.element';
import { UmbImageCropperCrop } from '.';
import { clamp, calculateExtrapolatedValue } from './mathUtils';

@customElement('umb-image-cropper-preview')
export class UmbImageCropperPreviewElement extends LitElement {
	@query('#image') imageElement!: HTMLImageElement;
	@query('#container') imageContainerElement!: HTMLImageElement;

	@property({ type: Object, attribute: false })
	crop?: UmbImageCropperCrop;

	@property({ type: String, attribute: false })
	src: string = '';

	@property({ attribute: false })
	get focalPoint() {
		return this.#focalPoint;
	}
	set focalPoint(value) {
		this.#focalPoint = value;
		this.#onFocalPointUpdated();
	}

	#focalPoint = { left: 0.5, top: 0.5 };

	connectedCallback() {
		super.connectedCallback();
		this.#initializeCrop();
	}

	async #initializeCrop() {
		if (!this.crop) return;

		await this.updateComplete; // Wait for the @query to be resolved

		if (!this.imageElement.complete) {
			// Wait for the image to load
			await new Promise((resolve) => (this.imageElement.onload = () => resolve(this.imageElement)));
		}

		const container = this.imageContainerElement.getBoundingClientRect();
		const cropAspectRatio = this.crop.width / this.crop.height;
		const imageAspectRatio = this.imageElement.naturalWidth / this.imageElement.naturalHeight;

		let imageContainerWidth = 0,
			imageContainerHeight = 0,
			imageWidth = 0,
			imageHeight = 0,
			imageLeft = 0,
			imageTop = 0;

		if (cropAspectRatio > 1) {
			imageContainerWidth = container.width;
			imageContainerHeight = container.width / cropAspectRatio;
		} else {
			imageContainerWidth = container.height * cropAspectRatio;
			imageContainerHeight = container.height;
		}

		if (this.crop.coordinates) {
			if (cropAspectRatio > 1) {
				// Landscape-oriented cropping
				const cropAmount = this.crop.coordinates.x1 + this.crop.coordinates.x2;
				// Use crop amount to extrapolate the image width from the container width.
				imageWidth = calculateExtrapolatedValue(imageContainerWidth, cropAmount);
				imageHeight = imageWidth / imageAspectRatio;
				// Move the image up and left from the top and left edges of the container based on the crop coordinates
				imageTop = -imageHeight * this.crop.coordinates.y1;
				imageLeft = -imageWidth * this.crop.coordinates.x1;
			} else {
				// Portrait-oriented cropping
				const cropAmount = this.crop.coordinates.y1 + this.crop.coordinates.y2;
				// Use crop amount to extrapolate the image height from the container height.
				imageHeight = calculateExtrapolatedValue(imageContainerHeight, cropAmount);
				imageWidth = imageHeight * imageAspectRatio;
				// Move the image up and left from the top and left edges of the container based on the crop coordinates
				imageTop = -imageHeight * this.crop.coordinates.y1;
				imageLeft = -imageWidth * this.crop.coordinates.x1;
			}
			this.imageElement.style.top = `${imageTop}px`;
			this.imageElement.style.left = `${imageLeft}px`;
		} else {
			// Set the image size to fill the imageContainer while preserving aspect ratio
			if (cropAspectRatio > 1) {
				imageWidth = imageContainerWidth;
				imageHeight = imageWidth / imageAspectRatio;
			} else {
				imageHeight = imageContainerHeight;
				imageWidth = imageHeight * imageAspectRatio;
			}

			this.#onFocalPointUpdated(imageWidth, imageHeight, imageContainerWidth, imageContainerHeight);
		}

		this.imageContainerElement.style.width = `${imageContainerWidth}px`;
		this.imageContainerElement.style.height = `${imageContainerHeight}px`;

		this.imageElement.style.width = `${imageWidth}px`;
		this.imageElement.style.height = `${imageHeight}px`;
	}

	#onFocalPointUpdated(imageWidth?: number, imageHeight?: number, containerWidth?: number, containerHeight?: number) {
		if (!this.crop) return;
		if (!this.imageElement || !this.imageContainerElement) return;
		if (this.crop.coordinates) return;

		if (!imageWidth || !imageHeight) {
			const image = this.imageElement.getBoundingClientRect();
			imageWidth = image.width;
			imageHeight = image.height;
		}
		if (!containerWidth || !containerHeight) {
			const container = this.imageContainerElement.getBoundingClientRect();
			containerWidth = container.width;
			containerHeight = container.height;
		}
		// position image so that its center is at the focal point
		let imageLeft = containerWidth / 2 - imageWidth * this.#focalPoint.left;
		let imageTop = containerHeight / 2 - imageHeight * this.#focalPoint.top;
		// clamp
		imageLeft = clamp(imageLeft, containerWidth - imageWidth, 0);
		imageTop = clamp(imageTop, containerHeight - imageHeight, 0);

		this.imageElement.style.top = `${imageTop}px`;
		this.imageElement.style.left = `${imageLeft}px`;
	}

	render() {
		if (!this.crop) {
			return nothing;
		}

		return html`
			<div id="container">
				<img id="image" src=${this.src} alt="image" />
			</div>
			<span id="alias">${this.crop.alias}</span>
			<span id="dimensions">${this.crop.width} x ${this.crop.height}</span>
			${this.crop.coordinates ? html`<span id="user-defined">User defined</span>` : nothing}
		`;
	}
	static styles = css`
		:host {
			display: flex;
			flex-direction: column;
			outline: 1px solid lightgrey;
			padding: 12px;
			border-radius: 4px;
			background-color: white;
		}
		#container {
			display: flex;
			width: 100%;
			aspect-ratio: 1;
			overflow: hidden;
			position: relative;
			overflow: hidden;
			margin: auto;
		}
		#alias {
			font-weight: bold;
			margin-top: 8px;
		}
		#dimensions {
			font-size: 0.8em;
		}
		#image {
			position: absolute;
			pointer-events: none;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'umb-image-cropper-preview': UmbImageCropperPreviewElement;
	}
}
