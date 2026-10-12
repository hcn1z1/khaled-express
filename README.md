# Khaled Express (خالد إكسبريس)

Système complet et opérationnel de transport et messagerie de colis entre les deux agences fixes d'**Alger (Alger Centre)** et **El Eulma (Sétif)**.

---

## 🏗️ Architecture du Projet

Le système se compose de 3 applications interconnectées :

1. **Portail Client Web (Next.js 14 / Tailwind CSS)** :
   - Interface bilingue **Français & Arabe** avec gestion native du **RTL** (Right-to-Left).
   - Suivi public en temps réel avec stepper interactif (5 étapes de statut).
   - Inscription et connexion client avec numéro de téléphone et mot de passe.
   - Création de demandes de transfert en ligne (statut `REQUESTED` - En attente de dépôt).
   - Isolation stricte des données : les clients ne voient que leurs propres colis.

2. **Application Desktop Opérateurs & Administration (React + Vite + Rust/Tauri)** :
   - Application de bureau native pour les agences, connectée aux douchettes et imprimantes.
   - **Station Scanner de Code-barres** compatible lecteurs USB/Bluetooth (Code 128) avec contrôle strict des transitions de garde (Custody validation).
   - **3 documents d'impression distincts** avec prévisualisation directe et sélection de langue (FR / AR) :
     - **Ticket thermique 80 mm** avec code-barres Code 128.
     - **Bon de dépôt (Intake)** pour l'expéditeur.
     - **Bon de retrait & décharge (Pickup)** pour le destinataire.
   - **Écran Finances & Trésorerie (Admin uniquement)** :
     - Total encaissé (somme des règlements liés aux colis).
     - Total dépensé (carburant, entretien, loyers, fournitures).
     - Solde net en Dinars Algériens (DZD).
     - Verrouillage strict : les modérateurs reçoivent un code HTTP 403 Forbidden et un écran d'accès interdit.
   - **Assistant IA Opérationnel (Lecture seule)** :
     - Recherche en langage naturel et résumés des files d'attente (flux Alger ↔ El Eulma).
     - Intégration serveur Gemini (`/api/ai/assistant/`) avec moteur NLP déterministe de secours.
     - Aucune modification de données (Read-Only garanti).
   - **Journal des SMS Sortants (Mock Outbox)** :
     - Consultation des SMS de notification déclenchés à l'arrivée du colis à l'agence de destination.
     - Clé d'idempotence empêchant tout doublon lors des réessais de scan.

3. **Backend API REST (Django 5 / PostgreSQL / Redis / Celery)** :
   - Authentification par Token DRF et modèle utilisateur personnalisé (`core.User`).
   - Règles métier strictes : transferts uniquement entre les agences d'Alger et El Eulma.
   - Handoff autorisé même si le montant est impayé (`UNPAID`).
   - Saisie différée des règlements par l'administrateur.

---

## 🔑 Rôles et Comptes de Test Pré-configurés

La base de données est initialisée avec les comptes suivants :

| Rôle | Nom | Téléphone | Mot de passe | Agence rattachée | Permissions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Administrateur** | Khaled Admin Principal | `0555000001` | `admin1234` | Siège / Global | Accès total : colis, fixation des frais libres, finances, encaissements, dépenses. |
| **Modérateur** | Karim Opérateur Alger | `0555000002` | `staff1234` | Alger Centre (`ALGIERS`) | Gestion colis, scans, impression. **Finances interdites (403)**. |
| **Modérateur** | Yacine Opérateur Eulma | `0555000003` | `staff1234` | El Eulma (`EL_EULMA`) | Gestion colis, scans, impression. **Finances interdites (403)**. |
| **Client** | Amine Bouzid | `0661123456` | `client1234` | N/A | Espace client, création de transferts, suivi de ses propres colis uniquement. |
| **Client** | Fatima Zohra Mansouri | `0770987654` | `client1234` | N/A | Espace client (Arabe par défaut). |

---

## 🚀 Démarrage Rapide

### Option A : Déploiement Complet avec Docker Compose (Recommandé)

Lance PostgreSQL, Redis, Django API, Celery Worker et Next.js en un seul ordre :

```bash
docker compose up --build
```

- **Site Web Client** : [http://localhost:3000](http://localhost:3000)
- **API REST Django** : [http://localhost:8000/api/](http://localhost:8000/api/)
- **Administration Django** : [http://localhost:8000/admin/](http://localhost:8000/admin/)

---

### Option B : Exécution Locale (Développement)

#### 1. Backend Django & Base de Données
```bash
# Activer l'environnement virtuel
.venv\Scripts\activate

# Appliquer les migrations et initialiser les données
python backend/manage.py migrate
python backend/manage.py seed_data

# Lancer le serveur backend
python backend/manage.py runserver 0.0.0.0:8000
```

#### 2. Portail Client Web (Next.js)
```bash
cd customer-web
npm install
npm run dev
# Accessible sur http://localhost:3000
```

#### 3. Application Staff (React / Vite / Tauri)
```bash
cd staff-desktop
npm install

# Aperçu Web :
npm run dev
# Accessible sur http://localhost:5173

# Application Desktop Native (Tauri) :
npm run tauri dev
```

---

## 🧪 Plan de Tests et Vérifications Automatisées

### 1. Suite de Tests Unitaires Django
Exécute les 11 cas de tests couvrant le modèle de données, les droits d'accès, la garde et les calculs comptables :
```bash
.venv\Scripts\python.exe backend/manage.py test core parcels finance notifications ai_assistant
```
*Résultat : **11 tests passés avec succès (OK)***.

### 2. Script de Vérification End-to-End (E2E)
Teste le cycle complet en conditions réelles :
```bash
.venv\Scripts\python.exe scripts/test_e2e_verification.py
```
Vérifications testées :
1. Restreinte stricte des agences (Alger et El Eulma uniquement).
2. Création de demande en ligne par le client (`REQUESTED`).
3. Isolation des données clients (ne voit pas les colis des autres).
4. Génération du code-barres Code 128 (PNG et SVG).
5. Étape de garde 1 : Scan Intake (`RECEIVED_AT_ORIGIN`).
6. Rejet immédiat de tout saut d'étape illégal (ex: Arrivée avant expédition).
7. Étape de garde 2 : Scan Dispatch (`DISPATCHED`).
8. Étape de garde 3 : Scan Arrivée (`RECEIVED_AT_DESTINATION`) + file SMS.
9. Idempotence : réessai de scan ne duplique pas le SMS.
10. Remise au destinataire autorisée même impayé (`DELIVERED` avec statut `UNPAID`).
11. Sécurité financière : Modérateur bloqué en HTTP 403 sur les finances et modification des frais.
12. Enregistrement d'un paiement ultérieur par l'administrateur : mise à jour du total reçu (DZD).
13. Enregistrement d'une dépense d'exploitation : mise à jour du total dépensé (DZD).
14. Assistant IA : réponses et résumés sans modification de données (Read-Only).

---

## 📦 Documents Imprimables Disponibles

Dans l'application staff, pour chaque colis, cliquez sur l'icône correspondante :
1. **Ticket thermique 80 mm** : format ticket de caisse avec code-barres Code 128, noms, téléphones, agences départ/arrivée et tarif en DZD.
2. **Bon de dépôt Expéditeur** : format reçu officiel avec détails complets et cases de double signature.
3. **Bon de retrait Destinataire** : certificat de remise et décharge pour la traçabilité des réceptions.
Chaque bon peut être basculé instantanément entre le français et l'arabe.
