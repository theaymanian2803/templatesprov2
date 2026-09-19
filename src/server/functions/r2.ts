import { createServerFn } from '@tanstack/react-start'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { requireUser } from '../admin'

export const getR2UploadUrl = createServerFn({ method: 'POST' })
  .validator((v: { fileName: string; contentType: string; folder?: string }) => v)
  .handler(async ({ data }) => {
    await requireUser()
    const sanitizedFolder = data.folder ? data.folder.replace(/^\/+|\/+$/g, '') : ''
    const objectKey = sanitizedFolder ? `${sanitizedFolder}/${data.fileName}` : data.fileName
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    })
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: data.contentType,
    })
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${data.fileName}`
    return { uploadUrl, publicUrl }
  })
