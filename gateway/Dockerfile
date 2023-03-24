FROM node:18-alpine

WORKDIR /app

# Copy and download dependencies
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

# Copy the source files into the image
COPY . .

# Generate prisma client
RUN yarn prisma:generate

EXPOSE 8080

CMD yarn start
