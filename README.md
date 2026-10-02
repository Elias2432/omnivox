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

## Lancer l’application

**Le plus simple :** double-cliquer sur **Start O** sur le bureau (ou
`Start O.bat` dans ce dossier) — un terminal ouvre le QR code.

- **Start O** — mode tunnel : fonctionne même si le téléphone ne voit pas le PC
- **Start O (LAN)** — mode réseau local, plus rapide sur le même Wi-Fi
- Si le téléphone ne se connecte pas sur le LAN : clic droit sur
  **Enable LAN mode (Run as admin).bat** → Exécuter en tant qu’administrateur
  (passe le réseau Windows en « Privé » et ouvre le pare-feu pour Node)
- Scanner le QR avec l’appareil photo de l’iPhone (**Expo Go** requis)

Manuellement :

```bash
npx expo start --tunnel    # ou: npx expo start
```

## Vérifications

```bash
npx tsc --noEmit                 # typecheck
npx expo lint                    # eslint
npx expo export --platform ios   # bundle de production
npx expo-doctor                  # 21/21
```

## Pile technique

Expo SDK 57 · React Native 0.86 · Expo Router (NativeTabs) · TypeScript ·
react-native-webview

Documentation complète : `Omnivox-App-Project-Documentation.md` dans ce dossier.
