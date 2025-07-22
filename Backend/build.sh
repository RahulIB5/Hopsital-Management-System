#!/bin/bash

cd "$(dirname "$0")"  # Go to backend directory

echo "🔧 Installing dependencies..."
pip install -r requirements.txt

echo "⚙️ Generating Prisma Client..."
python -m prisma generate

echo "📦 Fetching Prisma query engine binaries..."
python -m prisma py fetch

echo "✅ Backend build complete!"
