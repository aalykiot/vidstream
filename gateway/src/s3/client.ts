import config from '../config';
import {
  S3Client,
  CreateBucketCommand,
  ListBucketsCommand,
} from '@aws-sdk/client-s3';

const VIDEOS_BUCKET = 'videos';
const PREVIEWS_BUCKET = 'previews';

const { accessKeyId, secretAccessKey, endpoint } = config.s3;

const s3 = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  endpoint,
  region: 'us-east-1',
  forcePathStyle: true,
  maxAttempts: 6,
  retryMode: 'standard',
});

async function init() {
  // Get all existing buckets.
  const buckets = await s3.send(new ListBucketsCommand({}));
  const bucketNames = (buckets?.Buckets || []).map((item) => item.Name);

  // Create a bucket for `videos` if does not exist.
  if (!bucketNames.includes(VIDEOS_BUCKET)) {
    const cmd = new CreateBucketCommand({ Bucket: VIDEOS_BUCKET });
    await s3.send(cmd);
  }

  // Create a bucket for `previews` if does not exist.
  if (!bucketNames.includes(PREVIEWS_BUCKET)) {
    const cmd = new CreateBucketCommand({ Bucket: PREVIEWS_BUCKET });
    await s3.send(cmd);
  }
}

export { s3, init, VIDEOS_BUCKET, PREVIEWS_BUCKET };
