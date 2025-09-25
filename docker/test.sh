#!/bin/sh

# Docker Test Script - Run tests inside Docker container

echo "🐳 Running tests in Docker container..."

# Build the development image
echo "Building development image..."
docker-compose -f docker-compose.dev.yml build

# Run tests in the container
echo "Running tests..."
docker-compose -f docker-compose.dev.yml run --rm app npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed!"
  exit 1
fi

# Run linting
echo "Running linting..."
docker-compose -f docker-compose.dev.yml run --rm app npm run lint

# Clean up
echo "Cleaning up..."
docker-compose -f docker-compose.dev.yml down

echo "🎉 All tests passed!"