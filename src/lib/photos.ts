import { Directory, File, Paths } from 'expo-file-system';

const PHOTO_DIR = 'paint-photos';

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
