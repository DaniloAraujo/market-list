const SIZE = 256;
const MAX_CHARS = 140_000;
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler essa imagem. Tente outra.'));
    };
    image.src = url;
  });
}

export async function imageToAvatar(file) {
  if (!file.type || !ACCEPTED.includes(file.type)) {
    throw new Error('Escolha uma imagem PNG, JPEG ou WebP.');
  }
  const image = await loadImage(file);

  const side = Math.min(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const context = canvas.getContext('2d');
  context.drawImage(
    image,
    (image.naturalWidth - side) / 2,
    (image.naturalHeight - side) / 2,
    side,
    side,
    0,
    0,
    SIZE,
    SIZE
  );

  for (const quality of [0.85, 0.7, 0.55]) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (dataUrl.length <= MAX_CHARS) return dataUrl;
  }
  throw new Error('A imagem ficou grande demais. Tente outra.');
}
