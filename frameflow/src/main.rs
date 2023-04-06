mod constants;

use aws_sdk_s3 as s3;
use constants::CONSUMER_TAG;
use constants::VIDEO_PROCESS_QUEUE;
use ffmpeg_next as ffmpeg;
use futures_lite::stream::StreamExt;
use lapin::message::Delivery;
use lapin::options::BasicAckOptions;
use lapin::options::BasicConsumeOptions;
use lapin::types::FieldTable;
use lapin::Connection;
use lapin::ConnectionProperties;
use serde::Deserialize;
use serde::Serialize;
use std::env;
use std::error::Error;
use std::sync::Arc;
use tokio;

#[derive(Debug, Serialize, Deserialize)]
struct EventData {
    /// Video reference stored in s3.
    reference: String,
    // Basically the video extension.
    mimetype: String,
}

const VIDEOS_BUCKET: &str = "videos";

#[derive(Debug)]
struct Handler {
    /// AWS s3 client.
    client: Arc<s3::Client>,
}

impl Handler {
    pub async fn run(&self, delivery: Delivery) -> Result<(), Box<dyn Error>> {
        // Get data from event.
        let data = delivery.data.as_slice();
        let data: EventData = serde_json::from_slice(data)?;

        let filename_ext = data.mimetype.split("/").last().unwrap();
        let filename = format!("/tmp/{}.{}", &data.reference, filename_ext);

        // Get object from s3 bucket (as stream).
        let mut stream = self
            .client
            .get_object()
            .bucket(VIDEOS_BUCKET)
            .key(&data.reference)
            .send()
            .await?
            .body
            .into_async_read();

        // Crate the file destination.
        let mut file = tokio::fs::OpenOptions::new()
            .write(true)
            .create(true)
            .open(filename)
            .await?;

        // Save the video bytes into the file.
        tokio::io::copy(&mut stream, &mut file).await?;

        // Ack the message.
        delivery.ack(BasicAckOptions::default()).await?;

        Ok(())
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Initialize FFMPEG.
    ffmpeg::init().unwrap();

    // Connect to AWS (aka MinIO) services.
    let endpoint = std::env::var("AWS_ENDPOINT").unwrap();
    let config = aws_config::from_env().endpoint_url(&endpoint).load().await;
    let config_s3 = s3::config::Builder::from(&config)
        .force_path_style(true)
        .build();

    let client_s3 = s3::Client::from_conf(config_s3);
    let client_s3 = Arc::new(client_s3);

    // Connect to the AMQP (aka rabbitmq) broker.
    let addr = env::var("AMQP_URL").unwrap();
    let connection = Connection::connect(&addr, ConnectionProperties::default()).await?;
    let channel = connection.create_channel().await?;

    // Create a consumer.
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
        };

        tokio::spawn(async move {
            // Process the event. If an error is encountered, log it.
            if let Err(e) = handler.run(delivery.unwrap()).await {
                eprintln!("Event error: {e}");
            }
        });
    }

    Ok(())
}
