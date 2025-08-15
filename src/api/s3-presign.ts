import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  },
});

export default async function handler(req: any, res: any) {
  try {
    const { fileName, contentType } = req.body;
    const Bucket = process.env.S3_BUCKET as string;
    const Key = fileName;
    const command = new PutObjectCommand({
      Bucket,
      Key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 300 });
    res.status(200).json({ url, bucket: Bucket, key: Key });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
