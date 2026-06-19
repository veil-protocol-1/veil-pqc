#!/usr/bin/env bash
# Rolling update: rebuild bundle, push to each node sequentially, health-check between each.
# Run from packages/api: bash deploy/scripts/update.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BUNDLE="${API_DIR}/dist/bundle.js"
REMOTE_DIR="/opt/veil-api"

NODES=(
  "1:veil-node-1:45.63.6.252"
  "2:veil-node-2:108.61.81.13"
  "3:veil-node-3:149.28.229.102"
)

health_check_node() {
  local ip="$1"
  local url="http://${ip}:3000/health"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "$url" || echo "000")
  echo "$status"
}

echo "Building bundle..."
cd "${API_DIR}"
pnpm run bundle
echo "Bundle size: $(du -sh "${BUNDLE}" | cut -f1)"

for entry in "${NODES[@]}"; do
  n="${entry%%:*}"
  rest="${entry#*:}"
  node_id="${rest%%:*}"
  ip="${rest##*:}"

  echo ""
  echo "── Updating ${node_id} (${ip}) ──────────────────────────────"

  rsync -az --progress "${BUNDLE}" "root@${ip}:${REMOTE_DIR}/bundle.js"
  ssh "root@${ip}" "systemctl restart veil-api"

  echo -n "  Waiting for health check..."
  for i in $(seq 1 12); do
    sleep 5
    status=$(health_check_node "$ip")
    if [[ "$status" == "200" ]]; then
      echo " OK (${i}×5s)"
      break
    fi
    echo -n "."
    if [[ "$i" -eq 12 ]]; then
      echo " TIMEOUT"
      echo "  [ERROR] ${node_id} did not become healthy after 60s — aborting rollout."
      echo "  Check: ssh root@${ip} 'journalctl -u veil-api -n 50'"
      exit 1
    fi
  done

  echo "  [done] ${node_id}"
done

echo ""
echo "All nodes updated. Final health check:"
bash "${SCRIPT_DIR}/health-check.sh"
