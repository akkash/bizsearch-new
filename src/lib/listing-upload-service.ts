import { supabase } from '@/lib/supabase';

export interface ListingUploadedFile {
  id: string;
  url: string;
  path: string;
  filename: string;
  size: number;
  type: string;
  preview?: string;
  bucket: string;
}

function extensionFor(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type.startsWith('image/')) return file.type.split('/')[1] || 'jpg';
  if (file.type.startsWith('video/')) return file.type.split('/')[1] || 'mp4';
  return 'bin';
}

function bucketFor(file: File): { bucket: string; isPublic: boolean } {
  if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
    return { bucket: 'listing-media', isPublic: true };
  }
  return { bucket: 'documents', isPublic: false };
}

export async function uploadListingAsset(
  file: File,
  options?: { folder?: string }
): Promise<ListingUploadedFile> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error('Sign in to upload listing files.');

  const { bucket, isPublic } = bucketFor(file);
  const folder = options?.folder || 'media';
  const safeName = file.name.replace(/[^\w.\-]+/g, '_');
  const path = `${user.id}/${folder}/${Date.now()}-${safeName || `file.${extensionFor(file)}`}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) throw uploadError;

  let url = path;
  if (isPublic) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    url = data.publicUrl;
  } else {
    const { data, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    if (signedError) throw signedError;
    url = data.signedUrl;
  }

  return {
    id: path,
    url,
    path,
    filename: file.name,
    size: file.size,
    type: file.type,
    preview: file.type.startsWith('image/') ? url : undefined,
    bucket,
  };
}
