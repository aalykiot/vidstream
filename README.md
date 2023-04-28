# Vidstream

An on-demand video streaming platform written in [Node.js](https://nodejs.org/en) and the [Rust](https://www.rust-lang.org/) programming language.

- Node.js (fastify)
- Rust
- MongoDB
- MinIO
- React
- RabbitMQ
- Redis

## Installation with Docker

Use `docker-compose` to run the backend:

```sh
$ docker-compose up --build
```

For the [React](https://react.dev/) client application:

```sh
$ yarn && yarn dev
```

You can access the web app at http://localhost:5175/browse (or any other port vite decides to use).

Access Points:

- RabbitMQ Dashboard: http://localhost:15672/
- MinIO Management: http://localhost:9000/

## Demo

![Demo](./assets/vidstream-demo.gif)

## Architecture

<img src='./assets/vidstream-architecture.png' />

**Gateway API**

The gateway-api service plays a pivotal role in managing video content on the web client. It serves as the primary interface for communication between the client and the server, handling critical tasks like video uploads and removals.

Moreover, the service leverages web sockets to provide real-time updates to the client, keeping it informed of any changes in the video content. The gateway-api service also enables smooth video streaming by pulling data from S3 buckets as a stream, ensuring seamless playback for the end-users. Overall, the gateway-api service is a critical component in the web client's infrastructure, facilitating seamless video management and playback.

**Frameflow**

The primary function of this service is to extract preview images from the video that can be used as trick-play in the web client's player. To accomplish this task, the service employs the asynchronous event-driven framework, [tokio](https://tokio.rs/), to pull events from the video-process-queue.

Furthermore, the service utilizes [ffmpeg](https://ffmpeg.org/) to perform the actual video chunking process, allowing for the extraction of smooth and uninterrupted preview images. By combining these technologies, the service enables the web client's player to deliver a seamless and user-friendly trick-play experience.

**RabbitMQ**

This component acts as a mediator between the `Gateway API` and `Frameflow` services, enhancing the communication between them and facilitating a smoother data exchange.

**MongoDB**

This database stores various metadata related to videos, such as their titles, durations, sizes, and other relevant information.

**Redis**

This in-memory store is utilized to monitor the number of video views, owing to its quick read and write capabilities.

**MinIO**

The MinIO service replicates an AWS-hosted S3 bucket, providing a similar set of functionalities and features.

## The Reason

I started working on this project after watching a YouTube [video](https://www.youtube.com/watch?v=zQSwPEqBiLU) from `Primeagen`. He reviewed someone's thoughts on Netflix's architecture, and in the video, I learned that the preview images you see when you move your cursor along the Netflix or YouTube video player are generated during video upload, not in real-time.

After watching that video, I decided to try and make something similar using technologies I enjoy like Node.js for the API, Rust (ffmpeg) for video processing, and React for the website. Since video processing can take a while, I thought it would be good to add an async message broker, like RabbitMQ, to make communication between different parts smoother.

## Feedback

Feedback is welcomed 🙂
