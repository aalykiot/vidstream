mod constants;
mod frames;

use aws_sdk_s3 as s3;
use constants::CONSUMER_TAG;
use constants::PREVIEWS_BUCKET;
use constants::VIDEOS_BUCKET;
use constants::VIDEO_METADATA_QUEUE;
use constants::VIDEO_PROCESS_QUEUE;
use dotenv::dotenv;
use frames::generate_previews;
use futures_lite::stream::StreamExt;
use lapin::message::Delivery;
use lapin::options::BasicAckOptions;
use lapin::options::BasicConsumeOptions;
use lapin::options::BasicPublishOptions;
use lapin::types::FieldTable;
use lapin::BasicProperties;
use lapin::Channel;
use lapin::Connection;
use lapin::ConnectionProperties;
use nanoid::nanoid;
use rayon::ThreadPool;
use rayon::ThreadPoolBuilder;
use serde::Deserialize;
use serde::Serialize;
use std::env;
use std::error::Error;
use std::num::NonZeroUsize;
use std::sync::Arc;
use std::thread;

#[derive(Debug, Serialize, Deserialize)]
struct EventData {
    // Video reference stored in s3.
    reference: String,
    // Basically the video extension.
    mimetype: String,
}

#[derive(Debug, Serialize, Deserialize, Default)]
struct EventPublishData {
    // Video reference stored in s3.
    reference: String,
    // Duration in seconds.
    duration: f64,
    // The distance between two previews (in seconds).
    step: i32,
    // Preview IDs stored in s3.
    previews: Vec<String>,
}

#[derive(Debug)]
struct Handler {
    /// Shared AWS s3 client.
    client: Arc<s3::Client>,
    /// Shared AMQP channel.
    channel: Arc<Channel>,
    /// Shared access to the thread-pool.
    thread_pool_rc: Arc<ThreadPool>,
}

impl Handler {
    pub async fn run(&self, delivery: Delivery) -> Result<(), Box<dyn Error>> {
        // Parse data from the incoming event.
        let data = delivery.data.as_slice();
        let data: EventData = serde_json::from_slice(data)?;

        let filename_ext = data.mimetype.split('/').last().unwrap();
        let filename = format!("/tmp/{}.{}", &data.reference, filename_ext);

        // Fetch the video object from the S3 bucket.
        let mut stream = self
            .client
            .get_object()
            .bucket(VIDEOS_BUCKET)
            .key(&data.reference)
            .send()
            .await?
            .body
            .into_async_read();

        // Open the destination file and write the video stream to it.
        let mut file = tokio::fs::OpenOptions::new()
            .write(true)
            .create(true)
            .open(&filename)
            .await?;

        tokio::io::copy(&mut stream, &mut file).await?;

        // Generate preview frames from the video.
        let fname = filename.clone();
        let thread_pool = self.thread_pool_rc.clone();

        let task = move || thread_pool.install(|| generate_previews(&fname));
        let previews = tokio::task::spawn_blocking(task).await??;

        // Assign unique IDs to the preview frames.
        let step = previews.step_in_seconds;
        let duration = previews.duration;

        let previews: Vec<(String, Vec<u8>)> = previews
            .frames
            .iter()
            .map(|frame| (nanoid!(), frame.clone()))
            .collect();

        let mut metadata = EventPublishData {
            reference: data.reference,
            duration,
            step,
            previews: vec![],
        };

        for (id, bytes) in previews {
            // Upload each preview frame as a separate object in the S3 bucket
            self.client
                .put_object()
                .body(bytes.into())
                .bucket(PREVIEWS_BUCKET)
                .key(&id)
                .send()
                .await?;

            metadata.previews.push(id);
        }

        // Convert metadata into JSON string format and publish it.
        let payload = serde_json::to_string(&metadata)?;

        self.channel
            .basic_publish(
                "",
                VIDEO_METADATA_QUEUE,
                BasicPublishOptions::default(),
                payload.as_bytes(),
                BasicProperties::default(),
            )
            .await?
            .await?;

        // Acknowledge the received message.
        delivery.ack(BasicAckOptions::default()).await?;

        // Remove video from `tmp/` directory (clean up).
        tokio::fs::remove_file(&filename).await?;

        Ok(())
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Load env variables.
    dotenv().ok();

    // Initialize FFMPEG.
    frames::init();

    // Create a tread-pool for CPU heavy tasks.
    let default_size = unsafe { NonZeroUsize::new_unchecked(2) };
    let num_cores = thread::available_parallelism().unwrap_or(default_size);
    let num_threads = usize::from(num_cores) - 1;

    let thread_pool = ThreadPoolBuilder::new()
        .num_threads(num_threads)
        .build()
        .unwrap();

    let thread_pool_rc = Arc::new(thread_pool);

    // Retrieve endpoint url and AWS config, create a new S3 client.
    let endpoint = std::env::var("AWS_ENDPOINT").unwrap();
    let config = aws_config::from_env().endpoint_url(&endpoint).load().await;
    let config_s3 = s3::config::Builder::from(&config)
        .force_path_style(true)
        .build();

    let client_s3 = s3::Client::from_conf(config_s3);
    let client_s3 = Arc::new(client_s3);

    // Retrieve the AMQP url, create a connection and a channel.
    let addr = env::var("AMQP_URL").unwrap();
    let connection = Connection::connect(&addr, ConnectionProperties::default()).await?;
    let channel = Arc::new(connection.create_channel().await?);

    // Create a new consumer for the video-process queue.
    let mut consumer = channel
        .basic_consume(
            VIDEO_PROCESS_QUEUE,
            CONSUMER_TAG,
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await?;

    // Start listening for video-process events.
    while let Some(delivery) = consumer.next().await {
        // Create an event handler.
        let handler = Handler {
            client: client_s3.clone(),
            channel: channel.clone(),
            thread_pool_rc: thread_pool_rc.clone(),
        };

        tokio::spawn(async move {
            // Process the event. If an error is encountered, log it.
            if let Err(e) = handler.run(delivery.unwrap()).await {
                eprintln!("Err: {e:?}");
            }
        });
    }

    Ok(())
}
