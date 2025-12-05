import { supabaseServer } from '@/lib/supabase-server'

interface UploadBufferParams {
  bucket: string
  path: string
  buffer: Buffer
  contentType?: string
}

export async function uploadBufferToStorage({ bucket, path, buffer, contentType = 'application/octet-stream' }: UploadBufferParams) {
  const { data, error } = await supabaseServer.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType,
      upsert: true
    })


    
  if (error) {
    throw new Error(`[Storage] Failed to upload ${path}: ${error.message}`)
  }

  const { data: publicData } = supabaseServer.storage.from(bucket).getPublicUrl(path)
  return {
    path: data?.path || path,
    url: publicData?.publicUrl || ''
  }
}
