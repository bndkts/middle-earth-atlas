// Illustration coordinates, independent of both CSS pixels and world-map miles.
export const WIDTH = 1500, HEIGHT = 1000;
export function fitCamera(width, height) {
  const scale = Math.max(.001, Math.min(width / WIDTH, height / HEIGHT));
  return { scale, x: (width - WIDTH * scale) / 2, y: (height - HEIGHT * scale) / 2 };
}
export function panCamera(camera, dx, dy, width, height) {
  const bound = (value, size, available) => size <= available ? (available-size)/2 : Math.min(0, Math.max(available-size, value));
  return { scale: camera.scale,
    x: bound(camera.x + dx, WIDTH * camera.scale, width),
    y: bound(camera.y + dy, HEIGHT * camera.scale, height) };
}
export function zoomCamera(camera, factor, x, y, width, height) {
  const minimum = fitCamera(width, height).scale;
  const scale = Math.min(minimum * 6, Math.max(minimum, camera.scale * factor));
  const ratio = scale / camera.scale;
  return panCamera({ scale, x: x-(x-camera.x)*ratio, y: y-(y-camera.y)*ratio }, 0, 0, width, height);
}
