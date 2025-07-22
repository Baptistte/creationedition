#!/bin/bash

# Script d'optimisation des images pour Création Édition & Broderie
# Convertit les images en WebP et les redimensionne aux bonnes tailles

echo "🖼️  Optimisation des images pour améliorer les performances SEO..."

# Créer le dossier webp s'il n'existe pas
mkdir -p assets/images/webp

# Images principales du portfolio (redimensionnées à 380x254)
echo "📐 Redimensionnement et conversion des images du portfolio..."

# Images de logos
magick assets/images/services/logo1-1.png -resize 380x254^ -gravity center -extent 380x254 -quality 90 assets/images/webp/logo1-1.webp
magick assets/images/services/logo2-1.png -resize 380x254^ -gravity center -extent 380x254 -quality 90 assets/images/webp/logo2-1.webp
magick assets/images/services/logo3-1.png -resize 380x254^ -gravity center -extent 380x254 -quality 90 assets/images/webp/logo3-1.webp
magick assets/images/services/logo4-1.png -resize 380x254^ -gravity center -extent 380x254 -quality 90 assets/images/webp/logo4-1.webp

# Image de broderie
magick assets/images/services/broderie1bienredim.png -resize 380x254^ -gravity center -extent 380x254 -quality 90 assets/images/webp/broderie1bienredim.webp

# Image de flocage
magick assets/images/services/floquageremid.jpg -resize 380x253^ -gravity center -extent 380x253 -quality 90 assets/images/webp/floquageremid.webp

# Image de flyer
magick assets/images/services/flyeredim1.png -resize 380x254^ -gravity center -extent 380x254 -quality 90 assets/images/webp/flyeredim1.webp

# Image de casquette (redimensionnée à 316x211)
magick assets/images/services/casquette_test.png -resize 316x211^ -gravity center -extent 316x211 -quality 90 assets/images/webp/casquette_test.webp

# Images de sites web (redimensionnées à 384x256)
magick assets/images/realisations/sitedesign.png -resize 384x256^ -gravity center -extent 384x256 -quality 90 assets/images/webp/sitedesign.webp
magick assets/images/realisations/sitedesign2.png -resize 384x256^ -gravity center -extent 384x256 -quality 90 assets/images/webp/sitedesign2.webp

# Image OG pour les réseaux sociaux (optimisée mais gardant la taille originale)
magick assets/images/services/og-image.jpg -quality 85 assets/images/webp/og-image.webp

echo "✅ Conversion terminée ! Toutes les images ont été optimisées."

# Afficher les économies de taille
echo ""
echo "📊 Comparaison des tailles :"
echo "Taille originale vs WebP optimisé :"

for img in assets/images/webp/*.webp; do
    filename=$(basename "$img" .webp)
    
    # Chercher l'image originale (PNG ou JPG)
    if [ -f "assets/images/services/${filename}.png" ]; then
        original="assets/images/services/${filename}.png"
    elif [ -f "assets/images/services/${filename}.jpg" ]; then
        original="assets/images/services/${filename}.jpg"
    elif [ -f "assets/images/realisations/${filename}.png" ]; then
        original="assets/images/realisations/${filename}.png"
    else
        continue
    fi
    
    original_size=$(wc -c < "$original" | tr -d ' ')
    webp_size=$(wc -c < "$img" | tr -d ' ')
    reduction=$((100 - (webp_size * 100 / original_size)))
    
    echo "  ${filename}: -${reduction}% ($(numfmt --to=iec $original_size) → $(numfmt --to=iec $webp_size))"
done

echo ""
echo "🚀 Vos images sont maintenant optimisées pour de meilleures performances SEO !"
echo "💡 Les navigateurs modernes chargeront automatiquement les versions WebP."
echo "📱 Les navigateurs plus anciens utiliseront les images originales en fallback." 