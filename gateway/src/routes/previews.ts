import { Readable } from 'stream';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GetObjectCommand, S3ServiceException } from '@aws-sdk/client-s3';
import { s3, PREVIEWS_BUCKET } from '../s3/client';

type RequestParams = { id: string };

async function onPreview(request: FastifyRequest, reply: FastifyReply) {
  // Extract the preview ID from the query parameters.
  const { id } = request.params as RequestParams;

  // Ensure the preview ID is not empty.
  if (id === '') {
    const err = new Error(`You need to provide a preview ID.`);
    reply.status(400).send(err);
    return;
  }

  try {
    // Retrieve the preview image from the S3 bucket.
    const getCommand = new GetObjectCommand({
      Bucket: PREVIEWS_BUCKET,
      Key: id,
    });

    const preview = await s3.send(getCommand);

    // Send the retrieved preview image as a stream.
    await reply
      .header('Content-Type', 'image/png')
      .send(preview.Body as Readable);
    //
  } catch (e: unknown) {
    // Handle any errors that may occur during the process and send
    // an appropriate response.
    const exception = e as S3ServiceException;
    const err = new Error(exception.message);
    reply.status(exception.$metadata.httpStatusCode || 500).send(err);
  }
}

export const autoPrefix = '/api/previews';

export default async function (fastify: FastifyInstance) {
  // Register the route to fastify.
  fastify.route({
    method: 'GET',
    url: '/:id',
    handler: onPreview,
  });
}
