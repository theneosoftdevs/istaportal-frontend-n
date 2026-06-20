# Fino - Systeme de Gestion Universitaire (Backend)

Fino est une API de gestion universitaire robuste et modulaire developpee en Go avec le framework Fiber v3. Elle est concue pour gerer l'integralite du cycle de vie academique, des inscriptions a la publication des resultats.

---

## Architecture du Projet

Le projet suit une architecture multicouche pour favoriser la maintenabilite et la separation des responsabilites :

- **`cmd/api/`** : Point d'entree de l'application. Initialise le serveur et les configurations.
- **`internal/routes/`** : Definition de l'arbre des routes et association aux handlers.
- **`internal/handlers/`** : Controleurs qui traitent les requetes HTTP, valident les entrees et retournent les reponses.
- **`internal/services/`** : Logique metier complexe (ex: gestion des sessions, generation de JWT).
- **`internal/repository/`** : Couche d'acces aux donnees pour les requetes complexes ou reutilisables.
- **`internal/models/`** : Definitions des structures de donnees GORM et types TypeScript correspondants.
- **`internal/middleware/`** : Securite, authentification JWT et verification des roles (RBAC).

---

## Systeme de Securite & RBAC

L'acces est controle par un systeme de Controle d'Acces Base sur les Roles (RBAC).

### Roles et Hierarchie
| Role | Description |
| :--- | :--- |
| `rectorat` | Administrateur global. |
| `secretariat_general` | Gestion administrative de haut niveau. |
| `secretariat_faculte` | Gestionnaire d'une faculte specifique. |
| `apparitorat` | Gestionnaire des inscriptions et de la logistique. |
| `section` | Responsable de la gestion pedagogique (cours/UE). |
| `teacher` | Enseignant (encodage des points, acces aux cours). |
| `student` | Etudiant (consultation de notes, horaire). |

### Authentification
1. **JWT** : Un token est genere lors du login (valide 7 jours).
2. **Sessions** : Chaque connexion cree une session active en base de donnees (`sessions`), permettant de revoquer un acces a distance.
3. **Double Protection** : Le token peut etre envoye via le header `Authorization: Bearer <token>` ou via un cookie securise.

---

## Modeles de Donnees & Types TypeScript

Pour faciliter l'implementation dans une UI React, voici les interfaces essentielles :

### Noyau Utilisateur
```typescript
export interface User {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: 'M' | 'F';
  email: string;
  role: { id: number; nom: string };
  is_active: boolean;
}
```

### Profils Metiers
```typescript
export interface StudentProfile {
  id: string;
  user_id: string;
  matricule: string;
  birth_date: string;
  phone_number: string;
  faculty_id: string;
  user?: User;
  faculty?: Faculty;
}

export interface Teacher {
  id: string;
  user_id: string;
  matricule: string;
  title: string;
  faculty_id: string;
  user?: User;
}
```

### Structure Academique
```typescript
export interface Faculty {
  id: string;
  name: string;
  code: string;
}

export interface Promotion {
  id: string;
  name: string;
  code: string;
  faculty_id: string;
}

export interface TeachingUnit { // Unite d'Enseignement
  id: string;
  code: string;
  name: string;
  semester: 1 | 2;
  total_credits: number;
  courses?: Course[];
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  unit_id: string;
}
```

---

## API Reference (Endpoints)

### 1. Authentification (`/api/auth`)
- `POST /login` : Authentification (Retourne user + token).
- `POST /register` : Creation de compte (Reserve admin/staff).
- `POST /logout` : Deconnexion de la session actuelle.

### 2. Utilisateur Connecte (`/api/me`)
- `GET /profile` : Details de l'utilisateur actuel.
- `GET /sessions` : Liste des connexions actives.
- `POST /sessions/logout-all` : Deconnexion de tous les appareils.
- `GET /notifications` : Liste des alertes personnelles.

### 3. Gestion Academique (`/api/academics`)
- **Facultes** : `GET /faculties`, `POST /faculties`, `PUT /faculties/:id`.
- **Promotions** : `GET /promotions`, `POST /promotions`.
- **Cours & UE** : `GET /courses`, `POST /courses`.
- **Salles** : `GET /salles`, `POST /salles`.
- **Horaires** : `GET /schedules`, `POST /schedules`.
- **Notes** :
    - `POST /grades` : Encodage (Teacher).
    - `GET /averages/students/:student_id` : Moyenne annuelle.

### 4. Profils (`/api/profiles`)
- `POST /students` : Enregistrer un etudiant (Genere matricule S-XXXX).
- `GET /students/:user_id` : Voir le dossier etudiant complet.
- `POST /teachers` : Creer un profil enseignant (Matricule T-XXXX).

---

## Implementation dans React (Frontend)

### Configuration du Client API (Axios)
Il est recommande d'utiliser une instance Axios centralisee pour gerer les credentials et le token.

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true // Necessaire pour les sessions/cookies
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fino_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Exemple : Login & Stockage
```javascript
const handleLogin = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('fino_token', response.data.token);
    // Rediriger vers le dashboard
  } catch (error) {
    console.error("Erreur de connexion", error.response.data.error);
  }
};
```

### Exemple : Recuperer les notes d'un etudiant
```javascript
const fetchGrades = async (studentId, historyId) => {
  const response = await api.get(`/academics/averages/students/${studentId}`, {
    params: { history_id: historyId }
  });
  return response.data;
};
```

---

## Installation & Lancement

1. **Environnement** : Copier `exemple.env` en `.env` et remplir les variables.
2. **Base de donnees** :
   ```bash
   go run ./cmd/api migrate         # Appliquer les migrations
   go run ./cmd/api migrate:fresh   # RESET complet (Prudence !)
   ```
3. **Demarrage** :
   ```bash
   go run ./cmd/api/main.go
   ```

---

**Developpe avec passion pour l'excellence academique.**
