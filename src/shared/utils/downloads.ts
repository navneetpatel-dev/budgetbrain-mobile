import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

/** For a remote file (e.g. a presigned S3 / export-job download URL). */
export async function downloadAndShareFile(
  url: string,
  filename: string,
  mimeType: string
): Promise<void> {
  const dir = FileSystem.cacheDirectory;
  if (!dir) throw new Error('Cache directory unavailable');

  const fileUri = `${dir}${filename}`;
  const result = await FileSystem.downloadAsync(url, fileUri);
  if (result.status < 200 || result.status >= 300) {
    throw new Error('Download failed');
  }

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(result.uri, { mimeType });
  } else {
    throw new Error('Sharing is not available on this device');
  }
}
