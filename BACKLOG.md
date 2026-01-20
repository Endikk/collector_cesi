# 📋 Product Backlog - Collector

Ce document recense les User Stories (US) pour le développement de la plateforme Collector.

## 🚀 Sprint 1 : POC (Implémenté)
*Objectif : Valider l'architecture technique et permettre le flux de base "Vente".*

| ID | User Story | Critères d'Acceptation | Statut |
| :--- | :--- | :--- | :--- |
| **US-01** | En tant que **Visiteur**, je veux **voir les objets en vente** pour découvrir le catalogue. | - La page d'accueil affiche une grille d'objets.<br>- Chaque carte affiche : Titre, Prix, Vendeur. | ✅ Fait |
| **US-02** | En tant que **Visiteur**, je veux **m'inscrire** pour pouvoir vendre des objets. | - Formulaire (Nom, Email, MDP).<br>- Validation des champs requis.<br>- MDP hashé en base. | ✅ Fait |
| **US-03** | En tant que **Vendeur Connecté**, je veux **publier une annonce** pour vendre un objet. | - Formulaire protégé (accès refusé si non connecté).<br>- Champs : Titre, Description, Prix, Image URL.<br>- Redirection vers l'accueil après succès. | ✅ Fait |
| **US-04** | En tant que **Vendeur**, je veux **me déconnecter** pour sécuriser ma session. | - Bouton déconnexion.<br>- Session invalidée côté client. | ✅ Fait |

## 🔮 Sprint 2 : Consolidation (À venir)
*Objectif : Améliorer la robustesse et l'expérience utilisateur.*

| ID | User Story | Priorité |
| :--- | :--- | :--- |
| **US-05** | En tant qu'**Acheteur**, je veux rechercher des objets par nom. | Haute |
| **US-06** | En tant qu'**Utilisateur**, je veux uploader une image (fichier réel) plutôt qu'une URL. | Haute |
| **US-07** | En tant qu'**Admin**, je veux modérer (supprimer) des annonces inappropriées. | Moyenne |

## 🛡️ Exigences Techniques (Non-functionnel)
- **Sécurité** : Hashage des mots de passe (Fait).
- **Tests** : Couverture unitaire des composants critiques (NavBar) (Fait).
- **CI/CD** : Pipeline de build automatisé (Fait).
