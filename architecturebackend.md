# Architecture du Backend (ISTA-GOMA)

Ce document décrit l'architecture technique, la structure du projet et la conception de l'API pour le backend du portail ISTA-GOMA.

## 1. Stack Technique
- **Langage** : Go (Golang)
- **Framework Web** : [Gin Gonic](https://gin-gonic.com/)
- **ORM** : [GORM](https://gorm.io/)
- **Base de Données** : PostgreSQL
- **Authentification** : JWT (JSON Web Tokens)
- **Validation** : go-playground/validator (intégré à Gin)
- **Documentation** : Swag (Swagger/OpenAPI)

## 2. Structure du Projet (Clean Architecture)
Le projet suit une organisation par couches pour séparer les responsabilités :

```text
/
├── cmd/
│   └── api/
│       └── main.go           # Point d'entrée de l'application
├── internal/
│   ├── api/
│   │   ├── handler/          # Contrôleurs Gin (Parsing requêtes, appel services)
│   │   ├── middleware/       # JWT, RBAC, Logger, CORS
│   │   └── router/           # Définition des routes et groupes
│   ├── service/              # Logique métier (Calculs, validations complexes)
│   ├── repository/           # Accès aux données (Requêtes GORM)
│   ├── model/                # Entités GORM (Schéma DB)
│   ├── dto/                  # Data Transfer Objects (Req/Res structures)
│   └── config/               # Chargement des variables d'env et config
├── pkg/                      # Utilitaires réutilisables (Auth, Utils, Logger)
├── migrations/               # Fichiers de migration SQL
├── .env                      # Configuration locale
└── README.md
```

## 3. Schéma de Base de Données (Entités)

Les entités suivent la structure définie dans le frontend (`types.ts`) :

- **User** : `id`, `email`, `password_hash`, `first_name`, `last_name`, `role`, `ref_id` (lié à Student ou Teacher).
- **Faculty** : `id`, `name`, `code`, `dean_id`.
- **Promotion** : `id`, `name`, `faculty_id`, `level`.
- **Student** : `id`, `matricule`, `first_name`, `last_name`, `promotion_id`, `faculty_id`, `status`.
- **Teacher** : `id`, `matricule`, `first_name`, `last_name`, `title`, `faculty_id`.
- **Course** : `id`, `code`, `name`, `credits`, `faculty_id`, `promotion_id`, `teacher_id`, `hours`.
- **Grade** : `id`, `student_id`, `course_id`, `score`, `status`, `session`, `type`.
- **ScheduleSlot** : `id`, `course_id`, `day`, `start_time`, `end_time`, `room_id`.
- **Announcement** : `id`, `title`, `body`, `author_id`, `audience`, `priority`, `scope`, `target_id`.

## 4. API Routes (Mapping avec le UI)

L'API sera versionnée en `/api/v1`. Toutes les réponses suivront l'enveloppe :
`{ "success": boolean, "data": T, "message": string, "error": string }`.

### Authentification
- `POST /v1/auth/login` : Authentification et retour du token JWT + User.
- `GET  /v1/auth/me` : Récupère les infos de l'utilisateur connecté (via token).
- `POST /v1/auth/logout` : Invalidation de session (si redis utilisé).
- `POST /v1/auth/forgot-password` : Envoi d'un email de récupération.
- `POST /v1/auth/reset-password` : Réinitialisation via token.
- `POST /v1/auth/activate` : Activation du compte avec nouveau mot de passe.

### Académique
- `GET/POST /v1/faculties` : Liste et création de facultés.
- `GET/PUT/DELETE /v1/faculties/:id` : Gestion individuelle.
- `GET /v1/promotions` : Liste des promotions (filtre `facultyId`).
- `GET/POST /v1/courses` : Liste et création de cours.
- `PATCH /v1/courses/:id/teacher` : Assigner un enseignant à un cours.
- `GET/POST /v1/rooms` : Gestion des salles et auditoires.
- `GET/POST /v1/schedules` : Gestion des emplois du temps.

### Utilisateurs & Rôles
- `GET/POST /v1/students` : Liste et création d'étudiants (filtres par promotion/faculté).
- `PATCH /v1/students/:id/status` : Changer le statut (actif, suspendu, etc.).
- `GET/POST /v1/teachers` : Liste et création d'enseignants.
- `GET /v1/teachers/titles` : Liste des titres disponibles.

### Évaluations & Notes
- `GET /v1/grades` : Liste des notes (filtres par étudiant, cours, promotion).
- `POST /v1/grades` : Upsert (création/mise à jour) d'une note.
- `PATCH /v1/grades/:id/status` : Validation d'une note.

### Recours (Appeals)
- `GET /v1/appeals` : Liste des recours.
- `POST /v1/appeals` : Soumettre un nouveau recours.
- `PATCH /v1/appeals/:id/resolve` : Répondre à un recours.

### Ressources & Devoirs
- `GET/POST /v1/assignments` : Devoirs par cours.
- `GET/POST /v1/submissions` : Soumissions d'étudiants.
- `PATCH /v1/submissions/:id/grade` : Noter une soumission.
- `GET/POST /v1/resources` : Supports de cours (PDF, liens).

### Communication
- `GET/POST /v1/announcements` : Annonces globales ou ciblées.
- `GET /v1/notifications` : Notifications de l'utilisateur connecté.
- `PATCH /v1/notifications/:id/read` : Marquer comme lu.

## 5. Sécurité & Middleware
1. **JWT Auth** : Middleware vérifiant le header `Authorization: Bearer <token>`.
2. **RBAC (Role Based Access Control)** : Middleware vérifiant que `user.role` a accès à la route (ex: seul l'Apparitorat peut créer des étudiants).
3. **CORS** : Autoriser le frontend (Vite) à communiquer avec l'API.
4. **Rate Limiting** : Protection contre les attaques par force brute sur le login.

## 6. Format des Réponses (Standard)
```go
type ApiEnvelope struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Message string      `json:"message,omitempty"`
    Error   string      `json:"error,omitempty"`
}
```

## 7. Migration des données
Au démarrage initial, le backend pourra charger les données de `data.json` pour peupler la base de données PostgreSQL (Seeding).
