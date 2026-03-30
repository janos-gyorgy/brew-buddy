#!/bin/sh
# Replace env var placeholders in built JS files at container startup
# This allows runtime configuration via Helm values
ENV_JS_DIR="/usr/share/nginx/html/assets"

if [ -d "$ENV_JS_DIR" ]; then
  for file in "$ENV_JS_DIR"/*.js; do
    [ -f "$file" ] || continue
    sed -i "s|__VITE_SUPABASE_URL__|${VITE_SUPABASE_URL}|g" "$file"
    sed -i "s|__VITE_SUPABASE_PUBLISHABLE_KEY__|${VITE_SUPABASE_PUBLISHABLE_KEY}|g" "$file"
    sed -i "s|__VITE_SUPABASE_PROJECT_ID__|${VITE_SUPABASE_PROJECT_ID}|g" "$file"
  done
fi
