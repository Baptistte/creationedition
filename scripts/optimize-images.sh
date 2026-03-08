#!/bin/bash
# Optimisation complète des images :
# 1. Redimensionne les images > 1920px de large
# 2. Convertit tout en WebP (qualité 82)
# 3. Renomme les images yachting pour le SEO

set -e
ASSETS="assets/images"
QUALITY=82
MAX_WIDTH=1920

echo "🖼  Conversion en WebP..."

find "$ASSETS" \( -name "*.jpg" -o -name "*.png" \) | while read -r img; do
  webp="${img%.*}.webp"

  # Vérifier la largeur, redimensionner si nécessaire avant conversion
  width=$(identify -format "%w" "$img" 2>/dev/null || echo 0)

  if [ "$width" -gt "$MAX_WIDTH" ] 2>/dev/null; then
    echo "  ↓ Redim + WebP: $(basename $img) ($width px → $MAX_WIDTH px)"
    convert "$img" -resize "${MAX_WIDTH}x>" -quality 90 /tmp/resized_tmp.jpg
    cwebp -q $QUALITY /tmp/resized_tmp.jpg -o "$webp" -quiet
  else
    echo "  → WebP: $(basename $img)"
    cwebp -q $QUALITY "$img" -o "$webp" -quiet
  fi
done

echo ""
echo "✏️  Renommage SEO des images yachting..."

YACHT="$ASSETS/services/yachting"

declare -A RENAMES=(
  ["Screenshot_20260209_105730_Gallery.jpg"]="broderie-uniforme-yacht-cote-azur-1.jpg"
  ["Screenshot_20260209_105844_Instagram.jpg"]="broderie-uniforme-yacht-cote-azur-2.jpg"
  ["Screenshot_20260209_105938_Instagram.jpg"]="personnalisation-textile-superyacht-1.jpg"
  ["Screenshot_20260209_110040_Instagram.jpg"]="personnalisation-textile-superyacht-2.jpg"
  ["Screenshot_20260209_110135_Instagram.jpg"]="marquage-yacht-crew-uniform-1.jpg"
  ["Screenshot_20260209_110235_Instagram.jpg"]="marquage-yacht-crew-uniform-2.jpg"
  ["Screenshot_20260209_110425_Instagram.jpg"]="broderie-premium-yachting-french-riviera.jpg"
)

for old in "${!RENAMES[@]}"; do
  new="${RENAMES[$old]}"
  if [ -f "$YACHT/$old" ]; then
    mv "$YACHT/$old" "$YACHT/$new"
    # Renommer aussi le WebP correspondant si existant
    old_webp="${old%.*}.webp"
    new_webp="${new%.*}.webp"
    [ -f "$YACHT/$old_webp" ] && mv "$YACHT/$old_webp" "$YACHT/$new_webp"
    echo "  ✅ $old → $new"
  fi
done

echo ""
echo "📊 Taille avant/après :"
du -sh "$ASSETS"
echo ""
echo "✨ Optimisation terminée !"
