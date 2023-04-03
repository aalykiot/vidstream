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
use tokio;
use tracing::error;

const VIDEO_PROCESS_QUEUE: &str = "video-process-queue";
const CONSUMER_TAG: &str = "frameflow";

#[derive(Debug, Serialize, Deserialize)]
struct EventData {
    /// Video reference stored in S3.
    reference: String,
}

#[derive(Debug)]
struct Handler {}

impl Handler {
    pub async fn run(&self, delivery: Delivery) -> Result<(), Box<dyn Error>> {
        // Get data from event.
        let data = delivery.data.as_slice();
        let data: EventData = serde_json::from_slice(data)?;
        println!("Data: {data:?}");

        // Ack the message.
        delivery.ack(BasicAckOptions::default()).await?;

        Ok(())
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Initialize FFMPEG.
    ffmpeg::init().unwrap();

    // Connect to the amqp broker.
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
        let handler = Handler {};

        tokio::spawn(async move {
            // Process the event. If an error is encountered, log it.
            if let Err(e) = handler.run(delivery.unwrap()).await {
                error!(cause = ?e, "event error");
            }
        });
    }

    Ok(())
}
