# PhiloNodes – Six Minds, One Quote 

## Aperçu du Projet

**PhiloNodes** est un **système distribué de recommandation de citations philosophiques**.

Il se compose d'une **Extension Chrome** (Frontend) et d'un **Backend Python** hébergeant **6 Nœuds Philosophes** autonomes. Ces nœuds communiquent via sockets TCP pour **voter** et sélectionner la citation la plus pertinente selon un **protocole de consensus distribué**.

**But :** Fournir à l'utilisateur des citations pertinentes basées sur son contexte de navigation, choisies par un "débat" entre différentes écoles philosophiques. 

## Installation et Démarrage

### 1. Préparation de l'Environnement (Backend Python)

Ouvrez le terminal de VS Code ou votre ligne de commande dans le répertoire racine du projet.

#### Créer et Activer l'Environnement Virtuel :


python -m venv venv
venv\Scripts\activate
Installer les Dépendances :
(Note : La deuxième commande utilise un index PyPI alternatif pour une installation rapide et fiable.)



pip install -r requirements.txt 
pip install -r requirements.txt --no-cache-dir --default-timeout=300 -i [https://pypi.tuna.tsinghua.edu.cn/simple](https://pypi.tuna.tsinghua.edu.cn/simple)
### 2. Lancement du Backend Distribué (Nœuds)
Dans un second terminal (assurez-vous que le venv y est également activé) :


venv\Scripts\activate
Se déplacer dans le répertoire du backend :



cd backend
Lancer les 6 Nœuds Philosophes :



launch_all_nodes
### 3. Installation de l'Extension Chrome (Frontend)
Ouvrez Chrome et naviguez vers : chrome://extensions/

Activez le Mode Développeur (Developer Mode).

Cliquez sur Charger l'extension non empaquetée (Load unpacked).

Sélectionnez le dossier extension.

## Utilisation et Supervision
Test d'Usage : Une fois les nœuds lancés et l'extension installée, effectuez une recherche sur Google (ex: "knowledge"). L'extension affichera la citation retenue par le consensus.

Tableau de Bord : Pour visualiser le statut des nœuds et le processus de vote en temps réel :

Ouvrir le fichier dashboard/dashboard.html dans votre navigateur.