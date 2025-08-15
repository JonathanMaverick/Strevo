import axios from 'axios';

export async function uploadToSupabaseS3(file: File) {
  const fileName = `uploads/${crypto.randomUUID()}-${file.name}`;
  const presign = await fetch('/api/s3-presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName,
      contentType: file.type || 'application/octet-stream',
    }),
  }).then((r) => r.json());
  if (!presign.url) throw new Error('Failed to get presigned URL');
  await axios.put(presign.url, file, {
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  });
  return { bucket: presign.bucket, key: presign.key };
}

export function buildSupabasePublicUrl(params: {
  supabaseUrl: string;
  bucket: string;
  key: string;
}) {
  const { supabaseUrl, bucket, key } = params;
  const base = supabaseUrl.replace(/\/+$/, '');
  return `${base}/storage/v1/object/public/${encodeURIComponent(bucket)}/${key.split('/').map(encodeURIComponent).join('/')}`;
}
