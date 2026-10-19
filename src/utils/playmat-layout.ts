/** Fit the entire image and its hit areas into the available viewport. */
export function fitPlaymat(width: number, height: number, rotated: boolean) {
  const ratio = 2171 / 1434;
  const availableWidth = Math.max(0, width);
  const availableHeight = Math.max(0, height);
  const imageWidth = rotated
    ? Math.min(availableHeight, availableWidth * ratio)
    : Math.min(availableWidth, availableHeight * ratio);
  return { width: imageWidth, height: imageWidth / ratio };
}
