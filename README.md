# Omnivox (non officiel)

Application iPhone qui reproduit l’**Omnivox Mobile officiel** : en-tête orange,
5 onglets **Accueil · Mio · Léa · Services · Avis**, écrans natifs (boîte Mio,
grille Léa, notes, services, avis) branchés sur le vrai portail de votre cégep.

**Non officielle. Non affiliée à Skytech Communications.** Vos identifiants ne
sont saisis que sur la page de connexion officielle du portail et ne sont jamais
conservés par l’application.

## Fonctionnalités

- **Accueil** — écran « Omnivox » orange : événements, communautés avec pastilles
  rouges, actualités, horaire du jour, tuiles d’accès rapide
- **Mio** — boîte de réception native (recherche, pastilles non lues) avec
  repli automatique sur le portail si l’analyse HTML échoue
- **Léa** — grille de statistiques (Communiqués, Documents, Travaux, Notes, …)
  avec compteurs, sélecteurs Session/Classes
- **Notes** — notes finales par cours, couleur du portail, moyenne du groupe
- **Services** — bandeaux « Quoi de neuf? » / « Services Omnivox », état
  désactivé des services
- **Avis** — « Donnez-nous votre avis » + Mon dossier
- **Session unique** — connectez-vous une fois, tout le reste est connecté
- **Notifications locales** — nouveaux Mio, notes, documents, travaux
- **Téléchargements hors ligne** — PDF/fichiers interceptés, transférés par
  morceaux, visionneuse/partage/suppression
- **Horaire, Nouvelles, Documents de cours** dans le visualiseur du portail

## Lancer l’application (développement)

**Le plus simple :** double-cliquer sur **Start O** sur le bureau (ou
`Start O.bat` dans ce dossier) — un menu propose :

1. **Tunnel** (défaut) — fonctionne même si le téléphone ne voit pas le PC
2. **LAN** — réseau local, plus rapide sur le même Wi-Fi
3. **Corriger le LAN** — élève en administrateur, passe le réseau Windows en
   « Privé », ouvre le pare-feu pour Node, puis démarre en LAN
4. **Visualiser** — ouvre l’application dans un navigateur sur ce PC (voir plus bas)

Scanner le QR avec l’appareil photo de l’iPhone (**Expo Go** requis).

Manuellement :

```bash
npx expo start --tunnel    # ou: npx expo start
```

## Aperçu sur le PC (Visualiser)

L’option **[4] Visualiser** du menu Start O démarre le serveur Expo puis ouvre
`Visualiser.html` : l’app s’affiche dans un cadre iPhone sur votre bureau,
navigable à la souris (onglets, badges, écrans). Sans iPhone, sans comptes :

- **Données de démonstration** — Mio, Léa, horaire, notes… sont peuplés de
  contenus fictifs (`src/lib/demo.ts`) ; le portail réel n’est **jamais** touché
  par cet aperçu et aucun identifiant n’est saisi
- Fichiers exclus au web : les `.web.tsx` (sonde, portail, visualiseur de
  fichiers) remplacent les WebViews natives ; l’iPhone utilise les fichiers
  d’origine — le bundle iOS ne change pas
- Boutons de la page cadre : **Recharger**, **Ouvrir dans un onglet** (plein
  écran), **Rafraîchir le cadre**

## Installer l’app sur l’iPhone (Sideloadly)

L’app est compilée **sans signature** sur GitHub Actions (gratuit pour un
dépôt public), puis signée gratuitement avec votre identifiant Apple par
**Sideloadly** :

1. Télécharger l’IPA : GitHub Actions → exécution réussie → artefact
   `Omnivox-ipa` → `Omnivox.ipa` (ou `build\Omnivox.ipa` localement)
2. Brancher l’iPhone en USB, ouvrir **Sideloadly**, glisser l’IPA, saisir
   l’identifiant Apple, cliquer **Start**
3. Sur l’iPhone : Réglages → Général → Gestion et supervision des appareils
   → faire confiance au certificat du développeur

Compte Apple gratuit : expiration après **7 jours** (rafraîchie
automatiquement tant que Sideloadly reste ouvert), **3 apps** maximum.

## Vérifications

```bash
npx tsc --noEmit                  # typecheck
npx expo lint                     # eslint
npx expo export --platform ios    # bundle iOS de production
npx expo export --platform web    # bundle du Visualiser PC
npx expo-doctor                   # 21/21
```

## Pile technique

Expo SDK 57 · React Native 0.86 · Expo Router (NativeTabs) · TypeScript ·
react-native-webview

Documentation complète : `Omnivox-App-Project-Documentation.md` dans ce dossier.
