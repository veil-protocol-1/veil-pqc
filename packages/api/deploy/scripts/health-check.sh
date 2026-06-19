#!/usr/bin/env bash
set -euo pipefail

NODES=(
  "veil-node-1:45.63.6.252"
  "veil-node-2:108.61.81.13"
  "veil-node-3:149.28.229.102"
)
PORT=3000
PASS=0
FAIL=0

for entry in "${NODES[@]}"; do
  name="${entry%%:*}"
  ip="${entry##*:}"
  url="http://${ip}:${PORT}/health"
  status=$(curl -s -o /tmp/veil_health_resp -w "%{http_code}" --connect-timeout 5 --max-time 10 "$url" || echo "000")
  body=$(cat /tmp/veil_health_resp 2>/dev/null || echo "")
  if [[ "$status" == "200" ]]; then
    echo "[PASS] ${name} (${ip}) — HTTP ${status} — ${body}"
    ((PASS++))
  else
    echo "[FAIL] ${name} (${ip}) — HTTP ${status} — ${body}"
    ((FAIL++))
  fi
done

echo ""
echo "Results: ${PASS} passed, ${FAIL} failed"
[[ "$FAIL" -eq 0 ]]
