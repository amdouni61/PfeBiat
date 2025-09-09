# 2024 - 2025
# Ingénierie Logicielle et Systèmes d'Information

## TaskFlow - Système de Gestion de Tâches Moderne
### Développement d'une Application Web de Gestion d'Activités Ponctuelles au sein de BIAT IT

---

**Réalisé par:** [VOTRE NOM ET PRÉNOM]  
**Encadrant ESPRIT:** [NOM DE L'ENCADRANT ACADÉMIQUE]  
**Encadrant Entreprise:** [NOM DE L'ENCADRANT CHEZ BIAT IT]  
**BIAT IT**

---

## REMERCIEMENTS

Nous plaçons avant tout notre reconnaissance en Dieu, source de courage et de persévérance, qui nous a soutenus tout au long de ce projet.

Nous adressons nos remerciements les plus sincères à **[Nom de l'encadrant académique]**, notre encadrante/encadrant académique, pour son accompagnement constant, ses précieux conseils et sa disponibilité sans faille.

Nous exprimons également notre gratitude à **[Nom du responsable technique]**, pour son expertise pointue et ses observations constructives qui ont enrichi notre travail.

Un grand merci à **[Nom de l'encadrant professionnel]** pour son encadrement attentif, ses directives claires et son soutien indéfectible, qui nous ont guidés vers la réussite.

Nous sommes reconnaissants à toute l'équipe de **BIAT IT** pour son professionnalisme, ses retours pertinents et le temps qu'elle nous a consacré.

Nos pensées vont aussi à toute l'équipe de BIAT IT, dont l'accueil chaleureux et les conseils avisés ont été essentiels à l'avancement de ce projet.

Nous remercions par ailleurs les membres du jury pour leur rigueur et leurs suggestions éclairées, qui ont contribué à renforcer la qualité de ce mémoire.

Enfin, nous tenons à témoigner notre gratitude à toutes les personnes, citées ou non, qui ont, de près ou de loin, participé à la réalisation de ce travail.

---

## DÉDICACE

**À MES TRÈS CHERS PARENTS**

Aucun mot ne suffit à traduire l'immensité de l'amour que j'éprouve pour vous, ni la reconnaissance profonde que je vous dois pour tous les sacrifices consentis afin de m'offrir une éducation et un cadre de vie propices à mon épanouissement. Vos encouragements m'ont guidé vers cette voie, et vos remarques m'ont poussé à me surpasser. Puissé-je être à la hauteur de la confiance que vous avez placée en moi ! Par ce modeste travail, je vous offre l'expression de ma gratitude éternelle et de mon amour infini. Puissiez-vous, chers parents, bénéficier de santé, de bonheur et de longues années, éclairant encore longtemps le chemin de vos enfants.

**À MES CHÈRES SŒURS ET MES FRÈRES**

Je n'ai pas de mots assez forts pour décrire l'affection et la tendresse que je vous porte. Que l'amour fraternel soit à jamais le lien qui nous unit ! Je vous souhaite réussite et bonheur à chaque étape de votre vie. Merci pour votre soutien précieux et votre présence indéfectible tout au long de ce projet. Que la joie et l'entraide demeurent nos guides communs.

**À TOUS CEUX QUI ME SONT CHERS**

Je dédie ce travail, ainsi que ma reconnaissance la plus profonde, à tous ceux qui me sont chers et dont je n'ai pas pu nommer le soutien, j'adresse également ces quelques lignes en témoignage de ma gratitude.

---

## RÉSUMÉ

À l'issue de ce travail, nous avons développé une application web à la fois modulable et ergonomique pour optimiser la gestion des tâches au sein de BIAT IT. Elle prend en charge la création, l'assignation et le suivi des tâches avec validation hiérarchique, intègre un système d'authentification sécurisé avec Active Directory, et génère automatiquement des rapports exploitables. Nous y avons ajouté des fonctionnalités de communication temps réel via WebSocket et un système de notifications avancé. Fondée sur une architecture Angular 16 et Spring Boot 3.1.4 et organisée en sprints Scrum, cette plateforme assure une grande souplesse d'évolution et une maintenance facilitée, remplaçant efficacement le système manuel de timesheets précédemment utilisé.

## ABSTRACT

In this initiative, we developed a modular, intuitive web platform for optimizing task management within BIAT IT. It handles task creation, assignment, and tracking with hierarchical validation, integrates secure authentication with Active Directory, and automatically produces actionable reports. The platform includes real-time communication features via WebSocket and an advanced notification system. Built on Angular 16 and Spring Boot 3.1.4 architecture and delivered through iterative Scrum sprints, this solution offers high flexibility, seamless scalability, and simplified maintenance, effectively replacing the previously used manual timesheet system.

---

## Table des matières

**1. Introduction générale** ......................................................... 1

**2. Contexte général du projet** .................................................... 3
- 2.1 Introduction ................................................................. 4
- 2.2 Présentation de l'organisme d'accueil ........................................ 4
  - 2.2.1 Description de BIAT IT .................................................. 4
  - 2.2.2 Activités de l'entreprise .............................................. 4
  - 2.2.3 Organigramme de l'entreprise d'accueil ................................. 5
- 2.3 Étude de l'existant ......................................................... 5
  - 2.3.1 Description de l'existant .............................................. 5
  - 2.3.2 Critique de l'existant ................................................. 6
  - 2.3.3 Tableau comparatif des outils .......................................... 8
  - 2.3.4 Problématique .......................................................... 8
  - 2.3.5 Solution proposée ...................................................... 9
- 2.4 Approche méthodologique et modélisation ..................................... 9
  - 2.4.1 Adoption du framework Scrum ............................................ 9
  - 2.4.2 Méthodes traditionnelles versus approches agiles ....................... 11
  - 2.4.3 Usage de UML pour la conception ........................................ 12
- 2.5 Conclusion ................................................................. 12

**3. Sprint 0 : Préparation des bases du projet** .................................. 13
- 3.1 Introduction ............................................................... 14
- 3.2 Spécifications des besoins ................................................. 14
- 3.3 Diagramme de cas d'utilisation globale ..................................... 16
- 3.4 Diagramme de classe ........................................................ 17
- 3.5 Structure et découpage du projet avec SCRUM ................................ 17
- 3.6 Le Product Backlog ......................................................... 19
- 3.7 Architecture ............................................................... 21
- 3.8 Environnement de travail ................................................... 24
- 3.9 Conclusion ................................................................. 35

**4. Sprint 1 : Authentification et gestion des utilisateurs** ..................... 36
**5. Sprint 2 : Gestion des tâches et calendrier** ................................. 43
**6. Sprint 3 : Système de validation hiérarchique** ............................... 54
**7. Sprint 4 : Communication et notifications** ................................... 66
**8. Sprint 5 : Reporting et analytics** ........................................... 78
**9. Conclusion générale** ......................................................... 89

---

## 1. INTRODUCTION GÉNÉRALE

Ces dernières années, la gestion efficace des tâches et des activités au sein des entreprises est devenue un enjeu majeur pour maintenir la productivité et assurer un suivi rigoureux des projets. Pour les organisations comme BIAT IT, spécialisée dans les solutions technologiques bancaires, il est essentiel d'optimiser les processus internes de gestion des activités ponctuelles. Un système de gestion manuel peut en effet générer des désorganisations, dégrader l'efficacité opérationnelle, voire provoquer des retards dans les livraisons de projets.

C'est dans ce contexte que BIAT IT, filiale technologique de la Banque Internationale Arabe de Tunisie, a souligné l'importance d'un outil centralisé pour gérer efficacement les tâches de ses équipes. Elle souhaite notamment :

- Centraliser la création et le suivi des tâches avec une interface intuitive
- Implémenter un système de validation hiérarchique avec commentaires  
- Développer des fonctionnalités de reporting et d'analyse des performances
- Intégrer un système d'authentification sécurisé avec Active Directory
- Créer une plateforme de communication temps réel entre les équipes

L'interface doit rester intuitive : en quelques clics, l'équipe peut créer des tâches, les assigner, suivre leur progression et récupérer des rapports exhaustifs. Par ailleurs, chaque utilisateur bénéficie d'une vue personnalisée de ses tâches et responsabilités, pour une consultation rapide de ses activités en cours.

Pour satisfaire ces exigences, nous avons mis au point TaskFlow, une application web modulaire qui couvre l'ensemble de la gestion des tâches (création, assignation, validation, suivi). Dotée d'une interface moderne développée avec Angular 16, elle s'appuie sur un backend Spring Boot 3.1.4 robuste, intègre les métriques clés (temps de traitement, taux de validation, charge de travail) et produit des rapports prêts à l'emploi.

Le présent document retrace le déroulement complet du projet : des spécifications initiales de BIAT IT à la réalisation technique de la solution. Nous détaillerons le choix des technologies (Angular, Spring Boot, MySQL, WebSocket), l'architecture retenue et l'intégration du système de notifications et de reporting.

En offrant à BIAT IT un moyen rapide et fiable de gérer les activités de ses équipes, cette plateforme renforce la transparence opérationnelle, améliore la collaboration et accélère les processus de validation.

**Plan du rapport :**

1. **Contexte général du projet et méthodologie** : présentation de l'entreprise BIAT IT, analyse des besoins et choix technologiques.
2. **Sprint 0 – Analyse et Spécification des besoins** : identification des acteurs, description des besoins fonctionnels et non-fonctionnels, backlog et architecture.
3. **Sprint 1 – Authentification et gestion des utilisateurs** : mise en place de l'authentification JWT, intégration Active Directory, gestion des rôles.
4. **Sprint 2 – Gestion des tâches et calendrier** : création, modification, suppression des tâches, vue calendrier, système de filtres.
5. **Sprint 3 – Système de validation hiérarchique** : workflow de validation, gestion des commentaires, notifications.
6. **Sprint 4 – Communication et notifications** : chat temps réel, notifications push, système d'alertes.
7. **Sprint 5 – Reporting et analytics** : génération de rapports, statistiques, export PDF, tableaux de bord.
8. **Conclusion générale** : bilan du projet, difficultés rencontrées et perspectives d'évolution.

---

## Chapitre 2
# Contexte général du projet

### 2.1 Introduction

Dans ce premier chapitre, nous débuterons par présenter l'organisme d'accueil, BIAT IT, et détaillerons ses principales activités. Nous enchaînerons avec une étude de l'existant, accompagnée d'une description critique mettant en avant les points forts et les limites du système actuel. À l'issue de cette analyse, nous formulerons la problématique et exposerons la solution que nous proposons pour y répondre. Enfin, nous décrirons la méthodologie agile adoptée pour conduire ce projet.

### 2.2 Présentation de l'organisme d'accueil

#### 2.2.1 Description de BIAT IT

BIAT IT est la filiale technologique de la Banque Internationale Arabe de Tunisie, créée pour répondre aux besoins croissants de digitalisation du secteur bancaire tunisien. Depuis sa création, l'entreprise s'est imposée par des solutions innovantes dans les domaines de la banque digitale, des systèmes d'information bancaires, et des solutions de paiement électronique. Elle compte aujourd'hui plus de 200 collaborateurs et gère l'ensemble de l'infrastructure technologique de la BIAT.

#### 2.2.2 Activités de l'entreprise

Dans cette partie, nous présentons les principales activités de BIAT IT :

- **Développement d'applications bancaires** : Conception, développement et maintenance des applications core banking, solutions de paiement mobile et plateformes de banque en ligne.
- **Infrastructure et sécurité** : Gestion des centres de données, mise en place de solutions de cybersécurité et supervision des systèmes critiques.
- **Projets de transformation digitale** : Accompagnement de la BIAT dans sa transformation numérique, développement d'APIs bancaires et intégration de solutions fintech.
- **Maintenance et support** : Support technique 24/7, maintenance évolutive et corrective des systèmes existants.
- **Innovation technologique** : Veille technologique, prototypage de solutions innovantes (IA, blockchain, IoT) et participation aux projets de recherche et développement.

#### 2.2.3 Organigramme de l'entreprise d'accueil

<!-- TODO: Insérer l'organigramme de BIAT IT -->

### 2.3 Étude de l'existant

Dans cette partie, nous entamons une étude de l'existant suivie d'une partie critique et une illustration de la solution envisagée.

#### 2.3.1 Description de l'existant

Actuellement, BIAT IT utilise un système manuel de gestion des tâches basé sur des timesheets Excel et des emails pour le suivi des activités. Ce processus implique :

- **Création manuelle des tâches** : Les responsables créent des fichiers Excel individuels pour chaque projet
- **Distribution par email** : Les tâches sont envoyées aux collaborateurs via des emails avec pièces jointes
- **Suivi dispersé** : Chaque équipe maintient ses propres tableaux de suivi
- **Validation informelle** : Les validations se font par échanges d'emails sans traçabilité formelle
- **Reporting manuel** : Les rapports sont compilés manuellement en fin de période

Ce système, bien qu'opérationnel, présente des limitations importantes qui impactent l'efficacité globale de l'organisation.

#### 2.3.2 Critique de l'existant

Après une analyse approfondie de la problématique et de l'objectif du projet, nous exposerons dans cette partie une investigation détaillée de la situation actuelle :

**Limites du système actuel :**

- **Manque de centralisation** : Les informations sont dispersées dans multiples fichiers Excel, rendant difficile la vue d'ensemble des projets
- **Absence de traçabilité** : Aucun historique des modifications ou des validations n'est conservé
- **Processus de validation inefficace** : Les validations par email sont lentes et peuvent être perdues
- **Reporting complexe** : La génération de rapports nécessite une compilation manuelle chronophage
- **Risques de perte de données** : Les fichiers locaux peuvent être perdus ou corrompus
- **Collaboration limitée** : Pas de communication intégrée entre les équipes
- **Absence de notifications** : Aucun système d'alerte automatique pour les échéances

#### 2.3.3 Tableau comparatif des outils

| Critère | Système Actuel (Excel) | Jira | Trello | TaskFlow (Proposé) |
|---------|------------------------|------|--------|-------------------|
| Facilité d'utilisation | ⚠️ | ❌ | ✅ | ✅ |
| Centralisation | ❌ | ✅ | ✅ | ✅ |
| Validation hiérarchique | ❌ | ⚠️ | ❌ | ✅ |
| Intégration AD | ❌ | ⚠️ | ❌ | ✅ |
| Reporting avancé | ❌ | ✅ | ⚠️ | ✅ |
| Communication intégrée | ❌ | ⚠️ | ❌ | ✅ |
| Coût | Gratuit | Payant | Freemium | Développé en interne |
| Personnalisation | ⚠️ | ✅ | ⚠️ | ✅ |

#### 2.3.4 Problématique

Les limitations du système actuel engendrent plusieurs problématiques majeures :

- **Perte de productivité** : Le temps consacré à la gestion administrative des tâches au détriment du développement
- **Manque de visibilité managériale** : Difficulté pour les managers d'avoir une vue globale des projets et des charges de travail
- **Risques opérationnels** : Possibilité d'oubli de tâches critiques ou de non-respect des échéances
- **Communication défaillante** : Informations importantes perdues dans les échanges d'emails
- **Absence de métriques** : Impossibilité de mesurer les performances et d'identifier les axes d'amélioration

Il nous faut donc concevoir une plateforme de gestion des tâches qui soit à la fois intuitive, centralisée et offrant des fonctionnalités avancées de collaboration et de reporting.

#### 2.3.5 Solution proposée

À l'issue de notre diagnostic et conscients des défis à relever, nous avons développé **TaskFlow**, une plateforme web de gestion des tâches bâtie sur une architecture moderne Angular + Spring Boot. Pensée pour être simple d'usage tout en assurant une haute qualité, elle mise sur une interface ergonomique qui centralise l'ensemble du processus de gestion des tâches.

Concrètement, elle permet de :

- **Créer et gérer les tâches** : Interface intuitive pour la création, modification et suppression des tâches
- **Implémenter un workflow de validation** : Système hiérarchique avec commentaires et notifications
- **Centraliser les communications** : Chat intégré et système de notifications push
- **Générer des rapports automatiques** : Tableaux de bord et exports PDF
- **Intégrer l'authentification d'entreprise** : Connexion via Active Directory
- **Suivre les performances** : Métriques et statistiques en temps réel

Cette solution centralise l'ensemble du cycle de gestion des tâches, simplifie les processus et garantit un suivi exhaustif des activités.

### 2.4 Approche méthodologique et modélisation

#### 2.4.1 Adoption du framework Scrum

Pour mener à bien ce projet, nous avons opté pour Scrum : un cadre de travail combinant agilité et rigueur organisationnelle, favorisant l'engagement du client et la synergie au sein de l'équipe.

**Principes clés de Scrum :**

Scrum tire son nom de la « mêlée » au rugby et s'appuie sur des itérations courtes et des points quotidiens pour garder l'équipe alignée. Le cycle débute par la constitution d'un « Product Backlog », liste priorisée de toutes les fonctionnalités envisagées. Avant chaque sprint, on sélectionne les éléments les plus importants pour élaborer le « Sprint Backlog », puis l'équipe se concentre, de façon itérative, sur ces items afin de fournir, à la fin de la période (généralement 2 à 4 semaines), un incrément opérationnel.

**Rôles et responsabilités dans Scrum :**

- **Product Owner** : Responsable technique BIAT IT - définit la vision produit, priorise le backlog et valide les livraisons
- **Scrum Master** : Encadrant professionnel - garantit le respect des pratiques Scrum et facilite la communication  
- **Équipe de développement** : Stagiaire PFE - auto-organisée, transforme les items du backlog en incréments de valeur

**Concepts Scrum appliqués :**

- **Sprint** : Période de 2 semaines de réalisation d'un incrément
- **Product Backlog** : Liste évolutive des exigences et fonctionnalités TaskFlow
- **Sprint Backlog** : Sélection des items prioritaires pour chaque sprint
- **Daily Scrum** : Point quotidien pour synchroniser et lever les obstacles
- **Sprint Review** : Démonstration des fonctionnalités aux parties prenantes BIAT IT
- **Rétrospective** : Bilan interne pour identifier les axes d'amélioration

#### 2.4.2 Méthodes traditionnelles versus approches agiles

Le choix d'un modèle de développement doit tenir compte de la nature et de la taille du projet. Dans le contexte de TaskFlow, les exigences initiales étaient susceptibles d'évoluer selon les retours des utilisateurs BIAT IT, rendant l'approche itérative particulièrement adaptée.

Les méthodes Agile, et Scrum en particulier, favorisent :
- La collaboration étroite avec les utilisateurs finaux
- Les livraisons fréquentes de fonctionnalités
- L'adaptation continue aux besoins métier
- La réduction des risques par validation incrémentale

#### 2.4.3 Usage de UML pour la conception

Notre démarche de conception s'appuie sur les principes de la programmation orientée objet et utilise UML (Unified Modeling Language) comme langage de modélisation standard. Pour notre projet TaskFlow, nous avons utilisé :

- **Diagrammes de cas d'usage** : Pour identifier les interactions utilisateurs-système
- **Diagrammes de classes** : Pour modéliser la structure des données
- **Diagrammes de séquence** : Pour décrire les interactions temporelles
- **Diagrammes de composants** : Pour l'architecture technique

### 2.5 Conclusion

Dans ce chapitre, nous avons présenté le contexte du projet TaskFlow, décrit l'entreprise BIAT IT, analysé l'existant et exposé la méthode (Scrum, UML) ainsi que la solution retenue. Dans le chapitre suivant, nous nous pencherons plus en détail sur les besoins fonctionnels et non-fonctionnels, puis nous examinerons de près l'architecture de l'application.

---

*[Le document continue avec les autres chapitres suivant exactement la même structure que votre exemple...]*

<!-- TODO: Compléter les chapitres suivants en suivant le même format -->
<!-- MODIFIER: Personnaliser les informations spécifiques à votre projet -->
<!-- COMPLÉTER: Ajouter vos captures d'écran dans les sections appropriées -->

---

**Note :** Ce rapport suit exactement la structure et le style de votre exemple. Vous devrez :
1. Remplacer les informations entre crochets par vos données personnelles
2. Ajouter vos captures d'écran d'interface dans les sections appropriées  
3. Compléter les diagrammes UML spécifiques à TaskFlow
4. Personnaliser les remerciements et dédicaces selon vos souhaits