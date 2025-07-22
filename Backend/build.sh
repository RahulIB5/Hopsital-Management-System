#!/bin/bash

cd "$(dirname "$0")"  # Go to backend directory

echo "🔧 Installing dependencies..."
pip install -r requirements.txt

echo "⚙️ Generating Prisma Client..."
python -m prisma generate

echo "📦 Fetching Prisma query engine binaries..."
python -m prisma py fetch

echo "🔍 Verifying binary installation..."
python -c "
import prisma
from prisma.engine import utils
try:
    binary_path = utils.ensure(utils.BINARY_PATHS.query_engine)
    print(f'✅ Query engine found at: {binary_path}')
except Exception as e:
    print(f'❌ Binary verification failed: {e}')
    exit(1)
"

echo "🔒 Setting binary permissions..."
find ~/.cache/prisma-python -name "prisma-query-engine*" -type f -exec chmod +x {} \;

echo "✅ Backend build complete!"