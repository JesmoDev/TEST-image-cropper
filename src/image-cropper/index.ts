export type UmbImageCropperCrop = {
  name: string;
  dimensions: {
    width: number;
    height: number;
  };
  crop: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  focalPoint: {
    x: number;
    y: number;
  };
};
