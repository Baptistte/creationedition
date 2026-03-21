/**
 * Google Indexing API — Demande d'indexation pour toutes les pages
 *
 * Prérequis :
 *   1. Créer un projet Google Cloud → activer "Indexing API"
 *   2. Créer un compte de service → télécharger la clé JSON
 *   3. Dans Google Search Console → Paramètres → Utilisateurs et autorisations
 *      → Ajouter le compte de service (email) en tant que PROPRIÉTAIRE DÉLÉGUÉ
 *   4. Placer le fichier JSON de la clé dans : scripts/google-service-account.json
 *   5. npm install google-auth-library
 */

import { GoogleAuth } from "google-auth-library";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Configuration ────────────────────────────────────────────────────────────

const SERVICE_ACCOUNT_FILE = join(__dirname, "google-service-account.json");
const INDEXING_API_ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish";

// Délai entre chaque requête pour éviter le rate limiting (ms)
const DELAY_MS = 200;

// ─── Liste de toutes les URLs à indexer ───────────────────────────────────────

const URLS = [
  // Pages principales
  "https://creationeditionbroderie.com/",
  "https://creationeditionbroderie.com/a-propos/",
  "https://creationeditionbroderie.com/realisations/",
  "https://creationeditionbroderie.com/contact/",
  "https://creationeditionbroderie.com/blog/",

  // Services
  "https://creationeditionbroderie.com/services/creation-graphique-digitale/",
  "https://creationeditionbroderie.com/services/creation-graphique-digitale/creation-logo-identite-visuelle/",
  "https://creationeditionbroderie.com/services/creation-graphique-digitale/supports-imprimes-print/",
  "https://creationeditionbroderie.com/services/creation-graphique-digitale/creation-site-internet-frejus/",
  "https://creationeditionbroderie.com/services/broderie-marquage-textile/",
  "https://creationeditionbroderie.com/services/broderie-marquage-textile/broderie-personnalisee/",
  "https://creationeditionbroderie.com/services/broderie-marquage-textile/flocage-marquage-textile/",
  "https://creationeditionbroderie.com/services/broderie-marquage-textile/vetements-travail-personnalises/",
  "https://creationeditionbroderie.com/services/yachting/",

  // Pages légales
  "https://creationeditionbroderie.com/cgv/",
  "https://creationeditionbroderie.com/mentions-legales/",
  "https://creationeditionbroderie.com/politique-de-confidentialite/",

  // Articles — Graphique / Identité visuelle
  "https://creationeditionbroderie.com/blog/articles/guide-supports-imprimes.html",
  "https://creationeditionbroderie.com/blog/articles/identite-visuelle-forte.html",
  "https://creationeditionbroderie.com/blog/articles/charte-graphique-pourquoi-2025.html",
  "https://creationeditionbroderie.com/blog/articles/graphiste-freelance-vs-agence-frejus.html",
  "https://creationeditionbroderie.com/blog/articles/creation-logo-artisan-var-2026.html",
  "https://creationeditionbroderie.com/blog/articles/couleurs-logo-signification-guide.html",
  "https://creationeditionbroderie.com/blog/articles/graphiste-cote-azur-pourquoi-local.html",
  "https://creationeditionbroderie.com/blog/articles/carte-de-visite-professionnelle-conseils.html",
  "https://creationeditionbroderie.com/blog/articles/logo-ia-vs-graphiste-professionnel.html",
  "https://creationeditionbroderie.com/blog/articles/creer-logo-professionnel-entreprise-var-frejus.html",
  "https://creationeditionbroderie.com/blog/articles/impression-flyers-frejus-guide-complet.html",
  "https://creationeditionbroderie.com/blog/articles/tendances-graphisme-flyers-automne-2025.html",
  "https://creationeditionbroderie.com/blog/articles/creation-site-fleurs-nila-choix-techniques.html",
  "https://creationeditionbroderie.com/blog/articles/referencement-ia-comment-etre-recommande.html",
  "https://creationeditionbroderie.com/blog/articles/typographie-logo-guide-choix.html",
  "https://creationeditionbroderie.com/blog/articles/erreurs-creation-logo-eviter.html",
  "https://creationeditionbroderie.com/blog/articles/packaging-personnalise-image-produit.html",
  "https://creationeditionbroderie.com/blog/articles/tendances-identite-visuelle-2026.html",
  "https://creationeditionbroderie.com/blog/articles/cout-identite-visuelle-complete-2026.html",
  "https://creationeditionbroderie.com/blog/articles/print-vs-digital-strategie-communication.html",
  "https://creationeditionbroderie.com/blog/articles/signaletique-commerciale-frejus-guide.html",
  "https://creationeditionbroderie.com/blog/articles/guide-identite-visuelle-coherente-entreprise.html",
  "https://creationeditionbroderie.com/blog/articles/canva-vs-graphiste-professionnel-logo.html",
  "https://creationeditionbroderie.com/blog/articles/elements-charte-graphique-professionnelle.html",
  "https://creationeditionbroderie.com/blog/articles/refonte-logo-moderniser-identite-visuelle.html",
  "https://creationeditionbroderie.com/blog/articles/psychologie-formes-logo-cercles-angles-symboles.html",
  "https://creationeditionbroderie.com/blog/articles/flyer-ou-brochure-quel-support-choisir.html",
  "https://creationeditionbroderie.com/blog/articles/impression-offset-vs-numerique-supports-print.html",
  "https://creationeditionbroderie.com/blog/articles/carte-de-visite-2026-utile-ou-depassee.html",
  "https://creationeditionbroderie.com/blog/articles/signaletique-entreprise-guide-complet.html",
  "https://creationeditionbroderie.com/blog/articles/roll-up-kakemono-totem-guide-evenement.html",
  "https://creationeditionbroderie.com/blog/articles/tendances-design-2026-petites-entreprises.html",
  "https://creationeditionbroderie.com/blog/articles/packaging-personnalise-identite-visuelle-produit.html",
  "https://creationeditionbroderie.com/blog/articles/communication-visuelle-restaurant-2026.html",

  // Articles — Broderie & Textile
  "https://creationeditionbroderie.com/blog/articles/broderie-vetements-travail-entreprise.html",
  "https://creationeditionbroderie.com/blog/articles/flocage-textile-evenementiel-equipe.html",
  "https://creationeditionbroderie.com/blog/articles/broderie-vs-flocage-dtf-guide-choix.html",
  "https://creationeditionbroderie.com/blog/articles/broderie-restaurant-hotellerie-var.html",
  "https://creationeditionbroderie.com/blog/articles/broderie-casquettes-bonnets-personnalises.html",
  "https://creationeditionbroderie.com/blog/articles/entretien-textiles-brodes-guide.html",
  "https://creationeditionbroderie.com/blog/articles/cadeaux-entreprise-brodes-fidelisation.html",
  "https://creationeditionbroderie.com/blog/articles/roll-up-kakemono-salon-professionnel.html",
  "https://creationeditionbroderie.com/blog/articles/broderie-uniforme-scolaire-ecoles.html",
  "https://creationeditionbroderie.com/blog/articles/tendances-broderie-2024.html",
  "https://creationeditionbroderie.com/blog/articles/brochure-commerciale-guide-conception.html",
  "https://creationeditionbroderie.com/blog/articles/choisir-fils-broderie-matieres-finitions.html",
  "https://creationeditionbroderie.com/blog/articles/numerisation-logo-broderie-machine-etapes.html",
  "https://creationeditionbroderie.com/blog/articles/broderie-coton-polyester-polaire-guide-tissus.html",
  "https://creationeditionbroderie.com/blog/articles/quantites-minimales-broderie-flocage-petite-grande-serie.html",
  "https://creationeditionbroderie.com/blog/articles/tee-shirts-personnalises-evenements-comparatif.html",
  "https://creationeditionbroderie.com/blog/articles/erreurs-personnalisation-vetements-entreprise.html",
  "https://creationeditionbroderie.com/blog/articles/broderie-rse-personnalisation-textile-eco-responsable.html",
  "https://creationeditionbroderie.com/blog/articles/entretien-lavage-vetements-brodes-conseils.html",
  "https://creationeditionbroderie.com/blog/articles/entretien-textiles-personnalises-broderie-flocage.html",
  "https://creationeditionbroderie.com/blog/articles/commande-vetements-travail-personnalises-guide-entreprise.html",
  "https://creationeditionbroderie.com/blog/articles/broderie-casquette-chapeau-bonnets-guide-logo.html",
  "https://creationeditionbroderie.com/blog/articles/cadeaux-entreprise-brodes-idees-fidelisation.html",
  "https://creationeditionbroderie.com/blog/articles/cadeaux-entreprise-brodes-originaux-var.html",

  // Articles — Yachting
  "https://creationeditionbroderie.com/blog/articles/yacht-crew-uniform-embroidery-french-riviera.html",
  "https://creationeditionbroderie.com/blog/articles/personnalisation-textile-yachting-cote-azur.html",
  "https://creationeditionbroderie.com/blog/articles/yacht-linen-embroidery-towels-sheets.html",
  "https://creationeditionbroderie.com/blog/articles/linge-de-bord-personnalise-serviettes-draps-peignoirs.html",
  "https://creationeditionbroderie.com/blog/articles/uniformes-equipage-yacht-standards-personnalisation.html",
  "https://creationeditionbroderie.com/blog/articles/tenues-techniques-equipage-superyacht.html",
  "https://creationeditionbroderie.com/blog/articles/monaco-yacht-show-cannes-festival-communication-visuelle.html",
  "https://creationeditionbroderie.com/blog/articles/broderie-maritime-vetements-mer-fils-durables.html",
  "https://creationeditionbroderie.com/blog/articles/yacht-charter-branding-identite-visuelle-flotte.html",

  // Articles — Web / Digital / SEO
  "https://creationeditionbroderie.com/blog/articles/site-web-vitrine-efficace-2026.html",
  "https://creationeditionbroderie.com/blog/articles/seo-local-artisan-google-business.html",
  "https://creationeditionbroderie.com/blog/articles/reseaux-sociaux-artisans-guide-2026.html",
  "https://creationeditionbroderie.com/blog/articles/seo-local-artisans-commercants-guide-2026.html",
  "https://creationeditionbroderie.com/blog/articles/accessibilite-web-site-artisan-guide.html",
  "https://creationeditionbroderie.com/blog/articles/reseaux-sociaux-vs-site-web-artisan.html",
  "https://creationeditionbroderie.com/blog/articles/optimiser-site-web-mobile.html",
  "https://creationeditionbroderie.com/blog/articles/pages-indispensables-site-web-professionnel.html",
  "https://creationeditionbroderie.com/blog/articles/communication-saisonniere-station-balneaire.html",

  // Nouveaux articles — Var Local / Stratégie Communication
  "https://creationeditionbroderie.com/blog/articles/artisans-var-image-de-marque-confiance.html",
  "https://creationeditionbroderie.com/blog/articles/budget-communication-artisan-pme-guide.html",
  "https://creationeditionbroderie.com/blog/articles/choisir-agence-communication-var-criteres.html",
  "https://creationeditionbroderie.com/blog/articles/communication-associations-sportives-culturelles-var.html",
  "https://creationeditionbroderie.com/blog/articles/google-business-profile-guide-artisans-var.html",
  "https://creationeditionbroderie.com/blog/articles/mesurer-roi-communication-outils-metriques.html",
  "https://creationeditionbroderie.com/blog/articles/ouvrir-boutique-frejus-guide-communication.html",
  "https://creationeditionbroderie.com/blog/articles/plan-communication-annuel-pme-artisan.html",
  "https://creationeditionbroderie.com/blog/articles/rediger-textes-site-web-convertir-copywriting.html",
  "https://creationeditionbroderie.com/blog/articles/salons-evenements-professionnels-var-preparation.html",
  "https://creationeditionbroderie.com/blog/articles/site-vitrine-vs-ecommerce-artisan-pme.html",
  "https://creationeditionbroderie.com/blog/articles/temoignages-clients-avis-google-marketing.html",
  "https://creationeditionbroderie.com/blog/articles/vitesse-chargement-site-web-clients.html",
];

// ─── Utilitaires ──────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function formatStatus(i, total, url, status, message) {
  const pad = String(i).padStart(3);
  const icon = status === "ok" ? "✅" : status === "skip" ? "⏭️ " : "❌";
  const short = url.replace("https://creationeditionbroderie.com", "");
  console.log(`[${pad}/${total}] ${icon} ${short} — ${message}`);
}

// ─── Script principal ─────────────────────────────────────────────────────────

async function main() {
  // Vérifier que le fichier de clé existe
  let keyFile;
  try {
    keyFile = JSON.parse(readFileSync(SERVICE_ACCOUNT_FILE, "utf8"));
  } catch {
    console.error("\n❌ Fichier de clé introuvable :", SERVICE_ACCOUNT_FILE);
    console.error("\nSuis les étapes dans les commentaires en haut du script.\n");
    process.exit(1);
  }

  // Authentification
  const auth = new GoogleAuth({
    credentials: keyFile,
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });
  const client = await auth.getClient();

  console.log(`\n🚀 Demande d'indexation pour ${URLS.length} URLs...\n`);

  const results = { ok: 0, error: 0 };

  for (let i = 0; i < URLS.length; i++) {
    const url = URLS[i];

    try {
      const { token } = await client.getAccessToken();

      const response = await fetch(INDEXING_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url,
          type: "URL_UPDATED",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const latency = data.urlNotificationMetadata?.latestUpdate?.notifyTime ?? "";
        formatStatus(i + 1, URLS.length, url, "ok", `soumis${latency ? ` (notifyTime: ${latency})` : ""}`);
        results.ok++;
      } else {
        const err = await response.json().catch(() => ({ error: { message: response.statusText } }));
        const msg = err?.error?.message ?? response.statusText;

        // 429 = quota dépassé
        if (response.status === 429) {
          console.warn(`\n⚠️  Quota atteint à l'URL ${i + 1}. Pause 60s...\n`);
          await sleep(60_000);
          i--; // retry
          continue;
        }

        formatStatus(i + 1, URLS.length, url, "error", `HTTP ${response.status} — ${msg}`);
        results.error++;
      }
    } catch (err) {
      formatStatus(i + 1, URLS.length, url, "error", err.message);
      results.error++;
    }

    if (i < URLS.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n─────────────────────────────────`);
  console.log(`✅ Succès  : ${results.ok}`);
  console.log(`❌ Erreurs : ${results.error}`);
  console.log(`─────────────────────────────────\n`);
}

main();
