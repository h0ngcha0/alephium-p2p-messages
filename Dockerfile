# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Add metadata labels
LABEL org.opencontainers.image.title="Alephium P2P Messages"
LABEL org.opencontainers.image.description="Visualize Real-time P2P messages for Alephium Network"
LABEL org.opencontainers.image.source="https://github.com/h0ngcha0/alephium-p2p-messages"

# Set environment variables
ENV NODE_ENV=production
ENV APP_NAME=alephium-p2p-messages

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]