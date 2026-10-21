# 🍓 PHÉNIX GUY — Pterodactyl / Node.js

Bot WhatsApp expérimental basé sur Baileys. Le menu est intégré au dépôt (`assets/menu.svg`) et converti en JPEG automatiquement : aucune image séparée à ajouter.

## Fichiers
- `index.js` : bot et commandes
- `assets/menu.svg` : illustration originale intégrée au menu
- `package.json` : dépendances et démarrage
- `Dockerfile` : démarrage Docker si l'hébergeur le prend en charge
- `.gitignore` : exclut la session et les dépendances

## Hébergement Pterodactyl
1. Téléverse tous les fichiers du ZIP dans un dépôt GitHub.
2. Crée un serveur Node.js 20+ dans ton panel, ou choisis une image Node.js 20.
3. Commande d'installation : `npm install`
4. Commande de démarrage : `npm start`
5. Ajoute les variables d'environnement :
   - `OWNER_NUMBER` = ton numéro WhatsApp avec indicatif, chiffres uniquement (ex. `242XXXXXXXXX`)
   - `CHANNEL_URL` = lien complet de ta chaîne WhatsApp
   - `AUTH_DIR` = `/home/container/auth_info` (optionnel, si ce chemin est persistant)
6. Démarre le serveur et lis la console. Si un QR apparaît, ouvre WhatsApp > Paramètres > Appareils connectés > Connecter un appareil, puis scanne le QR.
7. Envoie `🍓menu` au compte lié pour tester.

## Très important
- Le stockage de `auth_info` doit être persistant entre les redémarrages. Ne publie jamais ce dossier, le QR ou les identifiants de session.
- Baileys est une bibliothèque non officielle qui utilise le protocole WhatsApp Web. Le fonctionnement peut changer et l'utilisation peut présenter un risque pour le compte. Pour un bot professionnel/public à grande échelle, privilégie l'API officielle WhatsApp Business.
- Certaines entrées du registre des 150 commandes répondent avec une aide informative, et ne sont pas des fonctions avancées. Les commandes de modération qui changent les paramètres du groupe exigent que le bot soit admin. Teste dans un groupe de test avant usage.
- Le menu inclut le lien de chaîne en texte. L'apparence exacte des aperçus/boutons dépend du client WhatsApp.
- Ne partage pas ton numéro privé dans le dépôt public. Configure-le dans le panel comme variable d'environnement.
