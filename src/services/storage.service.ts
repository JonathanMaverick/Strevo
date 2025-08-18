import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, anonKey);

export async function uploadDirectToSupabaseS3(
  file: File,
  opts?: { bucket?: string; prefix?: string },
) {
  const bucket = (opts?.bucket ??
    import.meta.env.VITE_SUPABASE_BUCKET) as string;
  const prefix = (opts?.prefix ?? 'uploads/').replace(/^\/+|\/+$/g, '') + '/';

  const safeName = file.name.replace(/[^\w.\-]+/g, '_');
  const key = `${prefix}${crypto.randomUUID()}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(key, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(key);

  return {
    bucket,
    key,
    publicUrl,
    path: data.path,
  };
}

export function buildSupabasePublicUrl(params: {
  supabaseUrl: string;
  bucket: string;
  key: string;
}) {
  const { bucket, key } = params;
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(key);

  return publicUrl;
}

export function buildSupabasePublicUrlWithCustomClient(params: {
  supabaseUrl: string;
  bucket: string;
  key: string;
}) {
  const { supabaseUrl, bucket, key } = params;

  const client = createClient(supabaseUrl, anonKey);
  const {
    data: { publicUrl },
  } = client.storage.from(bucket).getPublicUrl(key);

  return publicUrl;
}
