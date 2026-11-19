# Stage 1: Runtime
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production

# Copy package manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application source
COPY src/ ./src/

# Create a non-root user and switch to it for security
USER node

# Expose port 3000
EXPOSE 3000

# Start server
CMD ["node", "src/server.js"]
