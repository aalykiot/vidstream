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

pub fn init() {
    ffmpeg_next::init().unwrap();
}

pub struct FrameResult {
    /// The distance between 2 frames.
    pub step_in_seconds: i32,
    /// The generated frames as PNG images.
    pub frames: Vec<Vec<u8>>,
}

pub fn generate_previews(path: &String) -> Result<FrameResult> {
    // Get the video stream index from source.
    let mut context = input(path)?;
    let stream = context.streams().best(Type::Video).unwrap();
    let video_stream_idx = stream.index();

    // Initialize the decoder.
    let decoder = codec::context::Context::from_parameters(stream.parameters())?;
    let mut decoder = decoder.decoder().video()?;

    // Create the scaler.
    let mut scaler = scaling::context::Context::get(
        decoder.format(),
        decoder.width(),
        decoder.height(),
        Pixel::RGBA,
        decoder.width(),
        decoder.height(),
        scaling::flag::Flags::BILINEAR,
    )?;

    // We want to extract one frame every 5 secs.
    let frame_rate = stream.avg_frame_rate();
    let step = frame_rate.0 as f64 / frame_rate.1 as f64;
    let step = step.ceil() as usize * 5;

    let mut frames = vec![];

    for (stream, packet) in context.packets() {
        if stream.index() == video_stream_idx {
            decoder.send_packet(&packet).unwrap();
            receive_and_process_decoded_frames(&mut decoder, &mut scaler, &mut frames);
        }
    }

    let width = decoder.width();
    let height = decoder.height();

    // Tranform `Video` frames to `PNG` frames.
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

fn receive_and_process_decoded_frames(
    decoder: &mut ffmpeg_next::decoder::Video,
    scaler: &mut scaling::context::Context,
    frames: &mut Vec<Video>,
) {
    // Frame placeholder.
    let mut decoded = Video::empty();

    // Compute next raw frame.
    while decoder.receive_frame(&mut decoded).is_ok() {
        let mut rgb_frame = Video::empty();
        scaler.run(&decoded, &mut rgb_frame).unwrap();
        frames.push(rgb_frame);
    }
}

fn to_png_image(width: u32, height: u32, frame: &Video) -> Vec<u8> {
    // Generate an ImageBuffer from the frame.
    let bytes = frame.data(0);
    let img: ImageBuffer<Rgba<u8>, _> =
        ImageBuffer::from_raw(width, height, bytes).unwrap_or_default();

    // We need a structure that implements Seek.
    let mut cursor = std::io::Cursor::new(Vec::new());
    img.write_to(&mut cursor, ImageFormat::Png).unwrap();

    cursor.into_inner()
}
