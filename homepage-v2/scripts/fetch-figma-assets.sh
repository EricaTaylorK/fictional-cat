#!/bin/sh
# Downloads Figma assets listed in figma-assets.txt into public/v2/.
cd "$(dirname "$0")/.." || exit 1
while read -r path url; do
  case "$path" in ""|\#*) continue;; esac
  out="public/v2/$path"
  [ -s "$out" ] && continue
  mkdir -p "$(dirname "$out")"
  curl -sfL -o "$out" "$url" || echo "FAILED $path"
done < scripts/figma-assets.txt
