FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev deps for building)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev

# Expose port (GCP Cloud Run uses PORT env var, defaults to 8080)
EXPOSE 8080

# Start the application
CMD ["npm", "run", "start"] 
