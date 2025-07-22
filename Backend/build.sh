#!/bin/bash

echo "🔧 Installing dependencies..."
pip install -r requirements.txt

echo "⚙️ Generating Prisma Client..."
prisma generate

echo "📦 Fetching Prisma query engine binaries..."
prisma py fetch

echo "✅ Build complete!"
