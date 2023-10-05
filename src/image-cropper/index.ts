export type UmbImageCropperCrop = {
	alias: string;
	coordinates?: {
		x1: number;
		x2: number;
		y1: number;
		y2: number;
	};
	height: number;
	width: number;
};

export type UmbImageCropperPropertyEditorValue = {
	crops: Array<{
		alias: string;
		coordinates?: {
			x1: number;
			x2: number;
			y1: number;
			y2: number;
		};
		height: number;
		width: number;
	}>;
	focalPoint: { left: number; top: number };
	src: string;
};

export type UmbImageCropperFocalPoint = Pick<UmbImageCropperPropertyEditorValue['focalPoint'], 'left' | 'top'>;
