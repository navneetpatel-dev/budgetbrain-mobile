import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

export async function saveAndShareFile(
  filename: string,
  content: string | ArrayBuffer,
  mimeType: string
): Promise<void> {
  const dir = FileSystem.cacheDirectory;
  if (!dir) throw new Error('Cache directory unavailable');

  const uri = `${dir}${filename}`;
  if (typeof content === 'string') {
    await FileSystem.writeAsStringAsync(uri, content);
  } else {
    await FileSystem.writeAsStringAsync(uri, arrayBufferToBase64(content), {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, { mimeType });
  } else {
    throw new Error('Sharing is not available on this device');
  }
}
