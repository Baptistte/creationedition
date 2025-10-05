// Fonction Netlify pour gérer les DEVIS (version complète)
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Vérifier le JWT
function verifyToken(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Token manquant');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, process.env.JWT_SECRET);
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Vérification de l'authentification
    verifyToken(event.headers.authorization || event.headers.Authorization);

    const databaseUrl = process.env.DATABASE_URL || 
                       process.env.NEON_DATABASE_URL || 
                       process.env.NETLIFY_DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL non configurée');
    }

    const sql = neon(databaseUrl);

    // GET : Liste des devis avec infos client et lignes
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      const devisId = params.id;
      
      // Si ID spécifique, retourner un devis avec ses lignes
      if (devisId) {
        const devisData = await sql`
          SELECT 
            d.*,
            c.nom,
            c.prenom,
            c.email,
            c.telephone,
            c.entreprise,
            c.adresse,
            c.code_postal,
            c.ville
          FROM devis d
          LEFT JOIN clients c ON d.client_id = c.id
          WHERE d.id = ${parseInt(devisId)}
        `;

        if (devisData.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Devis non trouvé' }),
          };
        }

        const lignes = await sql`
          SELECT * FROM lignes_devis 
          WHERE devis_id = ${parseInt(devisId)}
          ORDER BY ordre, id
        `;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            devis: devisData[0],
            lignes: lignes 
          }),
        };
      }

      // Sinon, liste complète
      const clientId = params.client_id;
      const statut = params.statut;
      
      let query = `
        SELECT 
          d.*,
          c.nom,
          c.prenom,
          c.email,
          c.telephone,
          c.entreprise,
          (SELECT COUNT(*) FROM lignes_devis WHERE devis_id = d.id) as nb_lignes
        FROM devis d
        LEFT JOIN clients c ON d.client_id = c.id
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      if (clientId) {
        queryParams.push(parseInt(clientId));
        query += ` AND d.client_id = $${queryParams.length}`;
      }
      
      if (statut) {
        queryParams.push(statut);
        query += ` AND d.statut = $${queryParams.length}`;
      }
      
      query += ` ORDER BY d.created_at DESC`;
      
      const devisList = await sql(query, queryParams);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: devisList }),
      };
    }

    // POST : Créer un nouveau devis
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      const {
        client_id,
        titre,
        description,
        date_validite,
        taux_tva,
        remise_pourcentage,
        conditions_paiement,
        notes_internes,
        notes_client,
        lignes
      } = data;

      if (!client_id || !titre) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Client et titre requis' }),
        };
      }

      // Générer le numéro de devis automatique
      const numeroResult = await sql`SELECT generer_numero_devis() as numero`;
      const numero_devis = numeroResult[0].numero;

      // Créer le devis
      const devisResult = await sql`
        INSERT INTO devis (
          client_id, numero_devis, titre, description,
          statut, date_validite, taux_tva, remise_pourcentage,
          conditions_paiement, notes_internes, notes_client,
          montant_ht, montant_tva, montant_ttc,
          created_at, updated_at
        )
        VALUES (
          ${client_id},
          ${numero_devis},
          ${titre},
          ${description || null},
          'brouillon',
          ${date_validite || null},
          ${taux_tva || 20.00},
          ${remise_pourcentage || 0},
          ${conditions_paiement || null},
          ${notes_internes || null},
          ${notes_client || null},
          0, 0, 0,
          NOW(), NOW()
        )
        RETURNING *
      `;

      const nouveauDevis = devisResult[0];

      // Ajouter les lignes si présentes
      if (lignes && lignes.length > 0) {
        for (let i = 0; i < lignes.length; i++) {
          const ligne = lignes[i];
          const montant_ht = (ligne.quantite || 0) * (ligne.prix_unitaire_ht || 0);
          
          await sql`
            INSERT INTO lignes_devis (
              devis_id, ordre, type_ligne, designation, description,
              quantite, unite, prix_unitaire_ht, montant_ht, taux_tva
            )
            VALUES (
              ${nouveauDevis.id},
              ${i + 1},
              ${ligne.type_ligne || 'produit'},
              ${ligne.designation},
              ${ligne.description || null},
              ${ligne.quantite || 1},
              ${ligne.unite || 'unité'},
              ${ligne.prix_unitaire_ht || 0},
              ${montant_ht},
              ${ligne.taux_tva || taux_tva || 20.00}
            )
          `;
        }

        // Recalculer les totaux
        await recalculerTotaux(sql, nouveauDevis.id);
      }

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ 
          success: true, 
          devis: nouveauDevis,
          message: `Devis ${numero_devis} créé avec succès`
        }),
      };
    }

    // PUT : Modifier un devis
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body);
      const { id, lignes, ...updateData } = data;

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID requis' }),
        };
      }

      const updates = [];
      const values = [];
      let paramCount = 1;

      const fields = [
        'client_id', 'titre', 'description', 'statut', 
        'date_envoi', 'date_reponse', 'date_validite',
        'taux_tva', 'remise_pourcentage', 'remise_montant',
        'conditions_paiement', 'notes_internes', 'notes_client'
      ];

      fields.forEach(field => {
        if (updateData[field] !== undefined) {
          updates.push(`${field} = $${paramCount}`);
          values.push(updateData[field]);
          paramCount++;
        }
      });

      // Si changement de statut à "envoye", ajouter date_envoi
      if (updateData.statut === 'envoye' && !updateData.date_envoi) {
        updates.push(`date_envoi = NOW()`);
      }

      // Si changement de statut à "accepte" ou "refuse", ajouter date_reponse
      if ((updateData.statut === 'accepte' || updateData.statut === 'refuse') && !updateData.date_reponse) {
        updates.push(`date_reponse = NOW()`);
      }

      if (updates.length > 0) {
        updates.push(`updated_at = NOW()`);
        values.push(id);

        const query = `
          UPDATE devis 
          SET ${updates.join(', ')}
          WHERE id = $${paramCount}
          RETURNING *
        `;

        await sql(query, values);
      }

      // Mettre à jour les lignes si fournies
      if (lignes !== undefined) {
        // Supprimer les anciennes lignes
        await sql`DELETE FROM lignes_devis WHERE devis_id = ${id}`;

        // Ajouter les nouvelles lignes
        if (lignes.length > 0) {
          for (let i = 0; i < lignes.length; i++) {
            const ligne = lignes[i];
            const montant_ht = (ligne.quantite || 0) * (ligne.prix_unitaire_ht || 0);
            
            await sql`
              INSERT INTO lignes_devis (
                devis_id, ordre, type_ligne, designation, description,
                quantite, unite, prix_unitaire_ht, montant_ht, taux_tva
              )
              VALUES (
                ${id},
                ${i + 1},
                ${ligne.type_ligne || 'produit'},
                ${ligne.designation},
                ${ligne.description || null},
                ${ligne.quantite || 1},
                ${ligne.unite || 'unité'},
                ${ligne.prix_unitaire_ht || 0},
                ${montant_ht},
                ${ligne.taux_tva || 20.00}
              )
            `;
          }
        }

        // Recalculer les totaux
        await recalculerTotaux(sql, id);
      }

      // Récupérer le devis mis à jour
      const devisUpdated = await sql`SELECT * FROM devis WHERE id = ${id}`;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, devis: devisUpdated[0] }),
      };
    }

    // DELETE : Supprimer un devis
    if (event.httpMethod === 'DELETE') {
      const { id } = event.queryStringParameters || {};

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID requis' }),
        };
      }

      // Les lignes seront supprimées automatiquement (CASCADE)
      await sql`DELETE FROM devis WHERE id = ${parseInt(id)}`;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Devis supprimé' }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' }),
    };

  } catch (error) {
    console.error('Erreur devis:', error);
    return {
      statusCode: error.message === 'Token manquant' ? 401 : 500,
      headers,
      body: JSON.stringify({
        error: error.message === 'Token manquant' ? 'Non autorisé' : 'Erreur serveur',
        details: error.message,
      }),
    };
  }
};

// Fonction utilitaire pour recalculer les totaux d'un devis
async function recalculerTotaux(sql, devisId) {
  const devisData = await sql`SELECT * FROM devis WHERE id = ${devisId}`;
  if (devisData.length === 0) return;

  const devis = devisData[0];
  
  // Calculer la somme des lignes
  const lignes = await sql`
    SELECT SUM(montant_ht) as total_ht
    FROM lignes_devis
    WHERE devis_id = ${devisId}
  `;

  let montant_ht = parseFloat(lignes[0]?.total_ht || 0);

  // Appliquer la remise
  if (devis.remise_pourcentage > 0) {
    const remise = montant_ht * (devis.remise_pourcentage / 100);
    montant_ht -= remise;
    
    await sql`
      UPDATE devis 
      SET remise_montant = ${remise}
      WHERE id = ${devisId}
    `;
  }

  // Calculer la TVA
  const montant_tva = montant_ht * (devis.taux_tva / 100);
  const montant_ttc = montant_ht + montant_tva;

  // Mettre à jour le devis
  await sql`
    UPDATE devis 
    SET 
      montant_ht = ${montant_ht},
      montant_tva = ${montant_tva},
      montant_ttc = ${montant_ttc},
      updated_at = NOW()
    WHERE id = ${devisId}
  `;
}
