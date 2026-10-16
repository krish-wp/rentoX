#!/bin/bash
set -e

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

if ! command -v node &> /dev/null; then
  echo "Error: node not found. Run: nvm install 22"
  exit 1
fi

BASE="http://localhost:5000"
EMAIL="loadtest$(date +%s)@rx.io"
PASS="Test1234!"
RESULTS_DIR="$(dirname "$0")/results"
RATELIMIT_FILE="$(dirname "$0")/../backend/src/middleware/ratelimit.js"
RATELIMIT_BACKUP="$(dirname "$0")/ratelimit.js.bak"

mkdir -p "$RESULTS_DIR"
TS=$(date +%Y%m%d_%H%M%S)

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
header() { echo -e "\n${CYAN}=== $1 ===${NC}\n"; }

# 1. Start server if not running
header "STEP 1: Server"
if curl -sf "$BASE/api-docs" > /dev/null 2>&1; then
  echo -e "${GREEN}Server running${NC}"
  SERVER_WAS_RUNNING=true
else
  echo -e "${YELLOW}Starting server...${NC}"
  cd "$(dirname "$0")/../backend"
  node src/server.js > /dev/null 2>&1 &
  SERVER_PID=$!
  cd - > /dev/null
  SERVER_WAS_RUNNING=false
  sleep 3
  echo -e "${GREEN}Server started${NC}"
fi

# 2. Register, verify, login
header "STEP 2: Test user"
curl -sf -X POST "$BASE/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"username\":\"LoadTester\"}" 2>&1
echo ""

curl -sf -X POST "$BASE/api/v1/auth/dev/auto-verify" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\"}" 2>&1
echo ""

LOGIN_RESP=$(curl -sf -X POST "$BASE/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
TOKEN=$(echo "$LOGIN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")
echo -e "${GREEN}Token obtained${NC}"

# 3. Complete profile + create vehicle
header "STEP 3: Setup data"
curl -sf -X PUT "$BASE/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9999999999","state":"Maharashtra","district":"Mumbai","pincode":"400001"}' > /dev/null

curl -sf -X POST "$BASE/api/v1/vehicles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"plateNumber\":\"LT$(date +%s)\",\"brand\":\"Toyota\",\"model\":\"Innova\",\"type\":\"SUV\",\"pricePerDay\":2500,\"location\":\"Mumbai\",\"description\":\"load test\"}" > /dev/null
echo -e "${GREEN}Vehicle created${NC}"

# 4. Bump rate limits
header "STEP 4: Bumping rate limits"
cp "$RATELIMIT_FILE" "$RATELIMIT_BACKUP"
cat > "$RATELIMIT_FILE" << 'EOF'
import rateLimit from 'express-rate-limit';
const limitCreator = (windowMs, max, msg) => rateLimit({ windowMs, max, message: msg });
const globalLimiter = limitCreator(15*60*1000, 5000, 'rate limited');
const authLimiter = limitCreator(15*60*1000, 5000, 'rate limited');
const vehicleLimiter = limitCreator(15*60*1000, 5000, 'rate limited');
const requestLimiter = limitCreator(15*60*1000, 5000, 'rate limited');
export { globalLimiter, authLimiter, vehicleLimiter, requestLimiter };
EOF
echo -e "${GREEN}Limits raised to 5000/15min${NC}"

# Restart server for rate limit changes
if [ "$SERVER_WAS_RUNNING" = false ] && [ -n "$SERVER_PID" ]; then
  kill $SERVER_PID 2>/dev/null || true
  sleep 1
else
  lsof -ti :5000 | xargs kill -9 2>/dev/null || true
  sleep 1
fi
cd "$(dirname "$0")/../backend"
node src/server.js > /dev/null 2>&1 &
SERVER_PID=$!
cd - > /dev/null
sleep 3
echo -e "${GREEN}Server restarted${NC}"

# 5. Run tests
header "TEST 1/3: GET /api/v1/vehicles (c=50, 30s)"
autocannon -c 50 -d 30 -H "Authorization=Bearer $TOKEN" \
  "$BASE/api/v1/vehicles" \
  | tee "$RESULTS_DIR/vehicles_${TS}.txt"

# Re-login for fresh token (login test will use it heavily)
LOGIN_RESP=$(curl -sf -X POST "$BASE/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
TOKEN=$(echo "$LOGIN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

header "TEST 2/3: POST /api/v1/auth/login (c=30, 20s)"
autocannon -c 30 -d 20 -m POST \
  -H "Content-Type=application/json" \
  -b "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" \
  "$BASE/api/v1/auth/login" \
  | tee "$RESULTS_DIR/login_${TS}.txt"

# Fresh token again
LOGIN_RESP=$(curl -sf -X POST "$BASE/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
TOKEN=$(echo "$LOGIN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

header "TEST 3/3: GET /api/v1/rental-requests/received (c=30, 20s)"
autocannon -c 30 -d 20 -H "Authorization=Bearer $TOKEN" \
  "$BASE/api/v1/rental-requests/received" \
  | tee "$RESULTS_DIR/requests_${TS}.txt"

# 6. Restore rate limits
header "STEP 6: Restoring"
cp "$RATELIMIT_BACKUP" "$RATELIMIT_FILE"
rm "$RATELIMIT_BACKUP"
echo -e "${GREEN}Rate limits restored${NC}"

# 7. Stop server if we started it
if [ "$SERVER_WAS_RUNNING" = false ] && [ -n "$SERVER_PID" ]; then
  kill $SERVER_PID 2>/dev/null || true
fi

echo -e "\n${GREEN}Done! Results saved in $RESULTS_DIR/${NC}"
