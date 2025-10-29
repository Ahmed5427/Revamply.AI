#!/bin/bash

echo ""
echo "🔐 Admin Password Generator"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -z "$1" ]; then
  echo "Usage: ./GENERATE_PASSWORD.sh YourPassword"
  echo "Example: ./GENERATE_PASSWORD.sh MySecurePass123!"
  echo ""
  exit 1
fi

echo "Generating hash for password: $1"
echo ""

node generate-password.mjs "$1"

