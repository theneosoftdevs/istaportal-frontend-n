# Guide d'Intégration Frontend Fino API

Ce document fournit toutes les informations techniques nécessaires pour connecter une application ReactJS au backend Fino sans avoir à analyser le code Golang.

---

## 1. Architecture & Sécurité

### Authentification (JWT & Sessions)
L'authentification repose sur un système de **JWT (JSON Web Token)** couplé à une gestion de sessions en base de données.
- **Expiration** : Le token est valide pendant 7 jours.
- **Stockage** : Il est recommandé de stocker le token dans le `localStorage` ou dans un cookie sécurisé.
- **En-têtes** : Toutes les requêtes protégées doivent inclure le header `Authorization: Bearer <votre_token>`.
- **Sessions** : Chaque connexion crée une session. Le backend vérifie l'existence de la session en base à chaque requête pour permettre la déconnexion forcée (révocation de token).

### RBAC (Contrôle d'Accès Basé sur les Rôles)
Le système utilise les rôles suivants (par ordre de privilèges décroissants) :
1. `rectorat` : Administrateur global.
2. `secretariat_general` : Gestion administrative de haut niveau.
3. `secretariat_faculte` : Gestionnaire d'une faculté spécifique (accès filtré par sa faculté).
4. `apparitorat` : Gestionnaire des inscriptions et de la logistique.
5. `section` : Responsable pédagogique.
6. `teacher` : Enseignant.
7. `student` : Étudiant.

---

## 2. Modèles de Données (Interfaces TypeScript)

```typescript
// --- Types de base ---
export type Gender = 'M' | 'F';
export type EvaluationType = 'interrogation' | 'tp' | 'examen';
export type AcademicStatus = 'admis' | 'redoublant' | 'en_cours';
export type SalleType = 'auditoire' | 'labo' | 'salle decoference';
export type ResourceType = 'pdf' | 'syllabus' | 'video' | 'link';

// --- Entités ---

export interface Role {
  id: number;
  nom: string;
}

export interface User {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: Gender;
  email: string;
  role_id: number;
  role?: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Faculty {
  id: string;
  name: string;
  code: string;
  secretariat_faculte_id?: string; // ID de l'utilisateur secrétaire
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  faculty_id: string;
  faculty?: Faculty;
  level: number;
}

export interface AcademicYear {
  id: string;
  display_name: string; // ex: "2024-2025"
  is_active: boolean;
  start_date: string;
  end_date: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  matricule: string;
  birth_date: string;
  phone_number: string;
  faculty_id: string;
  faculty?: Faculty;
  user?: User;
  academic_year_id?: string;
}

export interface TeacherProfile {
  id: string;
  user_id: string;
  matricule: string;
  title: string;
  faculty_id: string;
  faculty?: Faculty;
  user?: User;
}

export interface TeachingUnit {
  id: string;
  code: string;
  name: string;
  promotion_id: string;
  semester: number; // 1 ou 2
  credit: number;
  courses?: Course[];
}

export interface Course {
  id: string;
  unit_id: string;
  code: string;
  name: string;
  credits: number;
  promotion_id: string;
  teacher_id?: string;
  teacher?: TeacherProfile;
}

export interface AcademicHistory {
  id: string;
  student_id: string;
  promotion_id: string;
  promotion?: Promotion;
  academic_year_id: string;
  academic_year?: AcademicYear;
  status: AcademicStatus;
}

export interface Evaluation {
  id: string;
  course_id: string;
  history_ref_id: string;
  title: string;
  type: EvaluationType;
  max_score: number;
  weight: number; // Pourcentage
  course?: Course;
  academic_year?: string; // Chargé dynamiquement
}

export interface Grade {
  id: string;
  evaluation_id: string;
  student_id: string;
  score_obtained: number;
  graded_by: string; // User ID
  is_published: boolean;
}

export interface Salle {
  id: string;
  name: string;
  capacity: number;
  type: SalleType;
  section?: string;
  description?: string;
}

export interface Schedule {
  id: string;
  course_id: string;
  course?: Course;
  salle_id: string;
  salle?: Salle;
  promotion_id: string;
  teacher_id?: string;
  teacher?: TeacherProfile;
  day: string;
  end_day?: string;
  start_time: string; // Format "HH:mm"
  end_time: string;   // Format "HH:mm"
}

export interface Notification {
  id: number;
  user_id: string;
  type: string;
  delivery_format: 'annonce' | 'notification';
  data: any;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface CourseResource {
  id: string;
  course_id: string;
  course?: Course;
  teacher_id?: string;
  title: string;
  description?: string;
  resource_type: ResourceType;
  url: string;
}
```

---

## 3. Référence API

Base URL : `http://votre-serveur:8080/api`

### 3.1 Authentification (`/auth`)

| Méthode | URL | Description | Accès | Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Connexion utilisateur | Public | `{ email, password }` |
| `POST` | `/auth/register` | Création de compte | Admin | `{ first_name, last_name, gender, email, role? }` |
| `POST` | `/auth/logout` | Déconnexion session actuelle | Protégé | - |

**Note sur `register`** :
- Le mot de passe par défaut est `123456789`.
- Le rôle est automatiquement déterminé par le créateur sauf si `rectorat`.
- Si `apparitorat` crée -> rôle `student`.
- Si `section`/`secretariat_faculte` crée -> rôle `teacher`.

### 3.2 Utilisateur Courant (`/me`)

| Méthode | URL | Description | Accès | Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/me/profile` | Profil complet de l'utilisateur | Protégé | - |
| `GET` | `/me/sessions` | Liste des sessions actives | Protégé | - |
| `POST` | `/me/sessions/logout-all` | Fermer toutes les sessions | Protégé | - |
| `GET` | `/me/notifications` | Notifications personnelles | Protégé | `?unread=true` |
| `PATCH` | `/me/notifications/:id/read` | Marquer comme lu | Protégé | - |

### 3.3 Académique (`/academics`)

#### Facultés
- `GET /academics/faculties` : Liste des facultés.
- `GET /academics/faculties/:id` : Détails d'une faculté.
- `POST /academics/faculties` : Créer une faculté (`{ name, code }`).
- `PUT /academics/faculties/:id` : Modifier une faculté.
- `DELETE /academics/faculties/:id` : Supprimer une faculté.

#### Promotions
- `GET /academics/promotions` : Liste des promotions. Filtre: `?faculty_id=...`
- `GET /academics/promotions/:id` : Détails d'une promotion.
- `GET /academics/promotions/:id/histories` : Historique des étudiants passés par cette promotion.
- `POST /academics/promotions` : Créer une promotion (`{ name, code, faculty_id }`).
- `POST /academics/promotions/transition` : Migration de masse des étudiants.
  - Body: `{ current_year, next_year, transitions: [{ student_id, next_promotion_id, status }] }`
- `GET /academics/promotions/available/:student_id` : Promotions éligibles pour un étudiant.
- `PUT /academics/promotions/:id` : Modifier une promotion.
- `DELETE /academics/promotions/:id` : Supprimer une promotion.

#### Cours
- `GET /academics/courses` : Liste des cours.
- `GET /academics/courses/:id` : Détails d'un cours.
- `POST /academics/courses` : Créer un cours (`{ unit_id, name, credits, promotion_id, teacher_id? }`).
- `PUT /academics/courses/:id` : Modifier un cours.
- `DELETE /academics/courses/:id` : Supprimer un cours.

#### Évaluations
- `GET /academics/evaluations/:id` : Détails d'une évaluation.
- `GET /academics/evaluations/history/:history_id` : Évaluations liées à un historique étudiant spécifique.
- `POST /academics/evaluations` : Créer une évaluation.
  - Body: `{ course_id, history_ref_id, title, type, max_score, weight }`
- `PUT /academics/evaluations/:id` : Modifier une évaluation.
- `DELETE /academics/evaluations/:id` : Supprimer une évaluation.

#### Notes & Moyennes
- `POST /academics/grades` : Créer une note.
  - Body: `{ evaluation_id, student_id, score_obtained }`
- `GET /academics/grades/evaluations/:evaluation_id` : Toutes les notes d'une évaluation.
- `GET /academics/grades/students/:student_id` : Toutes les notes (publiées) d'un étudiant.
- `PUT /academics/grades/:grade_id` : Modifier une note.
- `POST /academics/grades/publish` : Publier des notes en masse.
  - Body: `{ grade_ids: [] }`
- `GET /academics/averages/students/:student_id` : Bulletin complet (MGT par semestre et annuel).
  - Query: `?history_id=...` (Obligatoire)
- `GET /academics/averages/reports/:student_id` : Alias de l'endpoint précédent.
- `GET /academics/averages/promotions/:promotion_id` : Rapport global des moyennes d'une promotion.
  - Query: `?history_id=...`

#### Années Académiques
- `GET /academics/academic-years` : Liste de toutes les années académiques.
- `GET /academics/academic-years/active` : Récupérer l'année en cours.
- `POST /academics/academic-years` : Créer une année académique (`{ display_name, start_date, end_date }`).
- `POST /academics/academic-years/:id/activate` : Activer une année spécifique.
- `DELETE /academics/academic-years/:id` : Supprimer une année.

#### Salles & Horaires
- `GET /academics/salles` : Liste des salles.
- `POST /academics/salles` : Créer une salle (`{ name, capacity, type, section?, description? }`).
- `GET /academics/schedules` : Liste des horaires.
- `POST /academics/schedules` : Créer une entrée d'horaire.
  - Body: `{ course_id, salle_id, promotion_id, teacher_id, day, start_time, end_time }`

### 3.4 Profils (`/profiles`)

| Méthode | URL | Description | Accès |
| :--- | :--- | :--- | :--- |
| `POST` | `/profiles/students` | Créer un profil étudiant | Admin |
| `GET` | `/profiles/students` | Liste de tous les profils étudiants | Staff |
| `GET` | `/profiles/students/promotions` | Liste étudiants + promotion actuelle | Staff |
| `GET` | `/profiles/students/histories` | Historique complet de tous les étudiants | Staff |
| `GET` | `/profiles/students/:user_id` | Dossier étudiant complet | Staff |
| `PUT` | `/profiles/students/:user_id` | Modifier dossier | Admin |
| `GET` | `/profiles/teachers` | Liste des enseignants | Staff |
| `GET` | `/profiles/teachers/:user_id` | Détails d'un enseignant | Staff |
| `PUT` | `/profiles/teachers/:user_id` | Modifier enseignant | Admin |

### 3.5 Espace Étudiant (`/student`)

Routes réservées aux utilisateurs ayant le rôle `student`.
- `GET /student/profile` : Profil + Historique complet.
- `GET /student/lessons` : Notes publiées regroupées par cours.
- `GET /student/timetable` : Emploi du temps de sa promotion actuelle.
- `GET /student/resources` : Supports de cours disponibles.

---

## 4. Flux Métier Clés

### 4.1 Inscription d'un Étudiant
1. Appeler `POST /api/auth/register` (Crée le compte `User`).
2. Appeler `POST /api/profiles/students` avec l'ID utilisateur obtenu.
   - Le système génère automatiquement un matricule `S-XXXX`.
   - Il crée une entrée dans `AcademicHistory` avec le statut `en_cours`.

### 4.2 Encodage des Points
1. L'enseignant récupère ses cours via `GET /api/academics/courses`.
2. Il crée une évaluation via `POST /api/academics/evaluations`.
3. Il soumet les notes via `POST /api/academics/grades`.
4. Les notes restent invisibles pour l'étudiant jusqu'à l'appel de `POST /api/academics/grades/publish`.

---

## 5. Recommandations Frontend (React)

### Client API (Axios)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true // Important pour les cookies de session
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gestion globale des erreurs 401 (Token expiré)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Gestion de l'État
- **Utilisateurs & Auth** : Utilisez un Context Provider (`AuthContext`) pour stocker les infos de l'utilisateur connecté et son rôle.
- **Chargement** : Implémentez des "Skeletons" pour les listes (étudiants, cours) car les jointures backend peuvent être volumineuses.
- **Permissions** : Créez un composant `<Can role={['admin', 'teacher']}>` pour masquer les éléments de l'UI selon le rôle.

### Validation
Bien que le backend valide les données (Go tags), effectuez une pré-validation côté client (ex: Formik/Yup) pour améliorer l'expérience utilisateur, notamment sur les formats d'email et les longueurs de champs.
