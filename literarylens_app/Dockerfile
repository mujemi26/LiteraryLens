# Use official Node.js LTS image
FROM node:23

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if present)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Set environment variable to prevent OpenSSL errors
ENV NODE_OPTIONS=--openssl-legacy-provider
ENV PORT=3000

# Start the app
CMD ["node", "app.js"]
