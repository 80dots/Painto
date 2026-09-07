import { Directory, File, Paths } from 'expo-file-system';

const PHOTO_DIR = 'paint-photos';
/** 카탈로그 사진을 받아 두는 임시 폴더 */
const DOWNLOAD_DIR = 'paint-photo-downloads';

function photoDirectory() {
  const dir = new Directory(Paths.document, PHOTO_DIR);
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
  return dir;
}

/**
 * 카메라/앨범에서 받은 임시 파일을 앱 문서 폴더로 복사한다.
 * 임시 캐시는 OS 가 지울 수 있어서 그대로 저장하면 사진이 사라진다.
 */
export async function persistPhoto(sourceUri: string) {
  const extension = sourceUri.split('?')[0].split('.').pop()?.toLowerCase() ?? 'jpg';
  const safeExtension = /^[a-z0-9]{2,4}$/.test(extension) ? extension : 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExtension}`;

  const destination = new File(photoDirectory(), fileName);
  await new File(sourceUri).copy(destination);
  return destination.uri;
}

/**
 * 내장 카탈로그의 제품 사진을 내려받아 앱 문서 폴더에 넣는다.
 * 한 번 받아 두면 그 뒤로는 네트워크 없이 보인다.
 * 실패하면 null 을 돌려준다 — 사진이 없다고 등록을 막지는 않는다.
 */
export async function downloadPhoto(url: string): Promise<string | null> {
  try {
    const cache = new Directory(Paths.cache, DOWNLOAD_DIR);
    if (!cache.exists) {
      cache.create({ intermediates: true, idempotent: true });
    }

    // 같은 주소를 다시 받을 때 남아 있는 파일과 부딪히지 않게 먼저 치운다.
    const fileName = url.split('?')[0].split('/').pop();
    if (fileName) {
      const stale = new File(cache, fileName);
      if (stale.exists) stale.delete();
    }

    const downloaded = await File.downloadFileAsync(url, cache);
    try {
      return await persistPhoto(downloaded.uri);
    } finally {
      try {
        downloaded.delete();
      } catch {
        // 캐시 파일은 못 지워도 그만
      }
    }
  } catch {
    return null;
  }
}

/** 더 이상 쓰지 않는 사진 파일을 지운다. 실패해도 앱 흐름을 막지 않는다. */
export function deletePhoto(uri?: string | null) {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // 이미 지워졌거나 접근할 수 없는 경로 — 무시
  }
}
