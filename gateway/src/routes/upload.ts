import { promisify } from 'util';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { nanoid } from 'nanoid';

const pump = promisify(pipeline);

const acceptableMimeTypes = [
  'video/avi',
  'video/mpeg',
  'video/x-mpeg',
  'video/mp4',
  'video/ogg',
  'video/webm',
];

// The controller for the /upload endpoint.
async function onUpload(request: FastifyRequest, reply: FastifyReply) {
  // Process a single file.
  const data = await request.file();

  if (data === undefined) {
    const err = new Error(`Couldn't process the file successfully.`);
    reply.status(400).send(err);
    return;
  }

  const mimetype = data.mimetype;

  if (!acceptableMimeTypes.includes(mimetype)) {
    const err = new Error(`Provided file's mimetype is not supported.`);
    reply.status(400).send(err);
    return;
  }

  // Generate a new ID for the video.
  const id = `vid_${nanoid()}`;
  const extension = mimetype.split('/')[1];

  // TODO: Upload file to AWS S3 bucket.
  await pump(data.file, createWriteStream(`./tmp/${id}.${extension}`));

  reply.send({ success: true, id });
}

export const autoPrefix = '/upload';

export default async function (fastify: FastifyInstance) {
  // Register the route to fastify.
  fastify.route({
    method: 'POST',
    url: '/',
    handler: onUpload,
  });
}
