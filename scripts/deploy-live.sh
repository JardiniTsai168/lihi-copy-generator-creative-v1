#!/bin/zsh
set -euo pipefail

echo "This repository is isolated for creative.bktsai.link only."
echo "Refusing to deploy to copy.bktsai.link from workspace-lihi-copy-generator-creative-v1."
echo "Use ./scripts/deploy-creative-live.sh instead."
exit 1
