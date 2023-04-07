use anyhow::Result;
use ffmpeg_next::codec;
use ffmpeg_next::format::input;
use ffmpeg_next::format::Pixel;
use ffmpeg_next::media::Type;
use ffmpeg_next::software::scaling;
use ffmpeg_next::util::frame::video::Video;
use image::ImageBuffer;
use image::ImageFormat;
use image::Rgba;

/// Initializes the FFMPEG toolkit.
pub fn init() {
    ffmpeg_next::init().unwrap();
}

pub struct FrameResult {
    /// The distance between two frames.
    pub step_in_seconds: i32,
    /// The generated frames as PNG images.
    pub frames: Vec<Vec<u8>>,
}

/// Generates video preview frames by extracting one frame every 5 seconds from a video file.
pub fn generate_previews(path: &String) -> Result<FrameResult> {
    // Get the video stream index from the input file.
    let mut context = input(path)?;
    let stream = context.streams().best(Type::Video).unwrap();
    let video_stream_idx = stream.index();

    // Initialize the video decoder.
    let decoder = codec::context::Context::from_parameters(stream.parameters())?;
    let mut decoder = decoder.decoder().video()?;

    // Create the scaler to convert the decoded frames to RGBA format.
    let mut scaler = scaling::context::Context::get(
        decoder.format(),
        decoder.width(),
        decoder.height(),
        Pixel::RGBA,
        decoder.width(),
        decoder.height(),
        scaling::flag::Flags::BILINEAR,
    )?;

    // We want to extract one frame every 5 seconds.
    let frame_rate = stream.avg_frame_rate();
    let step = frame_rate.0 as f64 / frame_rate.1 as f64;
    let step = step.ceil() as usize * 5;

    let mut frames = vec![];

    // Loop through the packets in the input context.
    for (stream, packet) in context.packets() {
        if stream.index() == video_stream_idx {
            decoder.send_packet(&packet).unwrap();
            receive_and_process_decoded_frames(&mut decoder, &mut scaler, &mut frames);
        }
    }

    let width = decoder.width();
    let height = decoder.height();

    // Transform the `Video` frames to `PNG` frames by encoding them as PNG images.
    let frames = frames
        .iter()
        .step_by(step)
        .map(|frame| to_png_image(width, height, frame))
        .collect::<Vec<Vec<u8>>>();

    Ok(FrameResult {
        step_in_seconds: 5,
        frames,
    })
}

/// Receive and process decoded video frames from a decoder, scaling them to RGB format.
fn receive_and_process_decoded_frames(
    decoder: &mut ffmpeg_next::decoder::Video,
    scaler: &mut scaling::context::Context,
    frames: &mut Vec<Video>,
) {
    // Create a new empty video frame to store the scaled RGB frame.
    let mut decoded = Video::empty();

    // Process each decoded frame until there are no more.
    while decoder.receive_frame(&mut decoded).is_ok() {
        let mut rgb_frame = Video::empty();
        scaler.run(&decoded, &mut rgb_frame).unwrap();
        frames.push(rgb_frame);
    }
}

/// Convert a frame of a video to a PNG image with the specified width and height.
fn to_png_image(width: u32, height: u32, frame: &Video) -> Vec<u8> {
    // Create an ImageBuffer from the frame's data.
    let bytes = frame.data(0);
    let img: ImageBuffer<Rgba<u8>, _> =
        ImageBuffer::from_raw(width, height, bytes).unwrap_or_default();

    // Write the image to a buffer in PNG format (Cursor is needed cause it implements Seek).
    let mut cursor = std::io::Cursor::new(Vec::new());
    img.write_to(&mut cursor, ImageFormat::Png).unwrap();

    // Return the resulting byte vector.
    cursor.into_inner()
}
