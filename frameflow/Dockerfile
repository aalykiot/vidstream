# Using official ubuntu base image.
FROM ubuntu:latest

# Set the application directory.
WORKDIR /app

# Update package registry.
RUN apt-get update && apt-get install -y \
  curl \
  build-essential

# Install Rust toolchain.
RUN curl https://sh.rustup.rs -sSf | sh -s -- --default-toolchain stable -y

ENV PATH="/root/.cargo/bin:${PATH}"

# Install FFMPEG and required libs.
RUN apt-get install -y \
  ffmpeg \
  pkg-config \
  libavutil-dev \
  libavformat-dev \
  libavfilter-dev \
  libavdevice-dev \
  libclang-dev

# Install cargo-watch.
RUN cargo install cargo-watch

# Copy the files to the Docker image.
COPY . .
