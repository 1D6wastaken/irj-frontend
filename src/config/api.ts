// Classe d'erreur personnalisée pour les erreurs API
class ApiError extends Error {
    status: number;
    data?: any;

    constructor(
        status: number,
        message: string,
        data?: any
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// Configuration de l'API backend
export const API_CONFIG = {
    baseUrl: 'https://test.saintjacquesinfo.eu',
    endpoints: {
        users: '/api/v1/users',
        login: '/api/v1/login',
        forms: '/api/v1/forms',
        auth: '/api/v1/auth',
        search: '/api/v1/search',
        countries: '/api/v1/pays',
        regions: '/api/v1/regions',
        departments: '/api/v1/departments',
        communes: '/api/v1/cities',
        // Nouveaux endpoints pour les filtres dynamiques
        centuries: '/api/v1/centuries',
        buildingNatures: '/api/v1/building_natures',
        conservationStates: '/api/v1/conservation_states',
        materials: '/api/v1/materials',
        furnituresNatures: '/api/v1/furnitures_natures',
        furnituresTechniques: '/api/v1/furnitures_techniques',
        legalEntityNatures: '/api/v1/legal_entity_natures',
        professions: '/api/v1/professions',
        travels: '/api/v1/travels',
        themes: '/api/v1/themes',
        historicalPeriods: '/api/v1/historical_periods',
        draftMonumentsLieux: '/api/v1/draft/monuments_lieux',
        draftMobiliersImages: '/api/v1/draft/mobiliers_images',
        draftPersonnesMorales: '/api/v1/draft/personnes_morales',
        draftPersonnesPhysiques: '/api/v1/draft/personnes_physiques',
        // Endpoints pour les détails des fiches
        monumentsLieux: '/api/v1/monuments_lieux',
        mobiliersImages: '/api/v1/mobiliers_images',
        personnesMorales: '/api/v1/personnes_morales',
        personnesPhysiques: '/api/v1/personnes_physiques',
        contact: '/api/v1/contact',
    }
};

// Interfaces pour les données géographiques
export interface Country {
    id: string;
    name: string;
}

export interface Region {
    id: string;
    name: string;
    pays: {
        id: string;
        name: string;
    };
}

export interface Department {
    id: string;
    name: string;
    region: {
        id: string;
        name: string;
        pays: {
            id: string;
            name: string;
        };
    };
}

export interface Commune {
    id: string;
    name: string;
    department: {
        id: string;
        name: string;
        region: {
            id: string;
            name: string;
            pays: {
                id: string;
                name: string;
            };
        };
    };
}

// Nouvelles interfaces pour les filtres dynamiques
export interface FilterOption {
    id: string;
    name: string;
}

// Interfaces pour l'authentification
export interface LoginResponse {
    token: string;
    token_type: string;
    expires_in: number;
    firstname: string;
}

export interface LoginError {
    message?: string;
    detail?: string;
}

// Interface pour les données JWT décodées
export interface JWTPayload {
    JWT_ID: string;
    JWT_GRADE: 'ADMIN' | 'ACTIVE';

    [key: string]: any; // Autres champs possibles dans le JWT
}

// Interface pour le profil utilisateur complet depuis l'API
export interface UserProfile {
    id: string;
    firstname: string;
    lastname: string;
    mail: string;
    phone?: string;
    organization?: string;
    domain: 'ART' | 'ARCHITECTURE' | 'MEDIEVAL' | 'ARCHEOLOGIE' | 'PATRIMOINE' | 'THEOLOGIE' | 'PELERINAGE' | 'AUTRE';
    motivation: string;
    creation_date?: string; // Format YYYY-MM-DD
}

// Interface pour les contributeurs en attente de validation
export interface PendingUser {
    id: string; // UUID de l'utilisateur en attente
    firstname: string;
    lastname: string;
    mail: string;
    phone?: string; // Peut être vide ou non renseigné
    organization?: string; // Peut être vide ou non renseigné
    domain: 'ART' | 'ARCHITECTURE' | 'MEDIEVAL' | 'ARCHEOLOGIE' | 'PATRIMOINE' | 'THEOLOGIE' | 'PELERINAGE' | 'AUTRE';
    motivation: string;
    creation_date?: string; // Format YYYY-MM-DD, peut être vide ou non renseigné
}

// Interface pour tous les utilisateurs (dashboard admin)
export interface AdminUser {
    id: string; // UUID
    firstname: string;
    lastname: string;
    mail: string;
    mail_confirm?: boolean; // false si absent
    phone?: string;
    organization?: string;
    domain?: string;
    last_login: string; // Format date
    validated_by_firstname?: string;
    validated_by_lastname?: string;
    validated_by_mail?: string;
    grade: 'PENDING' | 'ACTIVE' | 'ADMIN';
    creation_date: string; // Format date
}

// Interface pour les contributions (historique admin)
export interface ContributionEvent {
    date: string; // Format date
    event: 'document_submission' | 'document_update' | 'document_submission_validation' | 'document_submission_rejection' | 'document_update_validation' | 'document_update_rejection';
    category: 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques';
    document_id: number;
    user_id?: string;
    user_firstname?: string;
    user_lastname?: string;
    user_mail?: string;
    admin_id?: string;
    admin_firstname?: string;
    admin_lastname?: string;
    admin_mail?: string;
}

export interface ContributionsResponse {
    total: number;
    events: ContributionEvent[];
}

// Interface pour les fiches en attente de validation
export interface PendingFormMedia {
    id: string;
    title: string;
}

export interface PendingForm {
    id: string;
    title: string;
    creation_date: string;
    authors: string[]; // Obligatoire
    city?: string;
    department?: string;
    region?: string;
    country?: string;
    natures?: string[];
    professions?: string[];
    medias?: PendingFormMedia[];
    centuries?: string[];
    parent_id?: number; // Si présent, c'est une modification soumise à relecture. Sinon, c'est une création
}

export interface HistoryEvent {
    date: string;
    event: 'document_submission' | 'document_update' | 'document_submission_validation' | 'document_submission_rejection' | 'document_update_validation' | 'document_update_rejection';
    category: 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques';
    document_id: string;
}

export interface HistoryResponse {
    events: HistoryEvent[];
    total: number;
}

export const DOMAIN_MAPPING = {
    'ART': 'Histoire de l\'art',
    'ARCHITECTURE': 'Architecture religieuse',
    'MEDIEVAL': 'Histoire médiévale',
    'ARCHEOLOGIE': 'Archéologie',
    'PATRIMOINE': 'Conservation du patrimoine',
    'THEOLOGIE': 'Théologie',
    'PELERINAGE': 'Pèlerinages',
    'AUTRE': 'Autre'
} as const;

// Interfaces pour les requêtes et réponses API existantes
export interface SearchRequestBody {
    centuries?: number[];
    themes?: number[];
    countries?: number[];
    regions?: number[];
    departments?: number[];
    cities?: number[];
    mobiliers_images?: {
        natures?: number[];
        techniques?: number[];
        states?: number[];
        materials?: number[];
    };
    monuments_lieux?: {
        natures?: number[];
        states?: number[];
        materials?: number[];
    };
    pers_morales?: {
        natures?: number[];
    };
    pers_physiques?: {
        professions?: number[];
        travels?: number[];
    };
}

export interface SearchResponse {
    total: number;
    items: SearchItem[];
}

export interface SearchItem {
    source: 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques' | 'monuments_lieux';
    id: string;
    title: string;
    medias?: {
        id: string;
        title: string;
    }[];
    natures?: string[];
    centuries?: string[];
    professions?: string[];
}

// Interfaces pour les détails des fiches
export interface MediaDetail {
    id: string;
    title: string;
}

export interface MonumentLieuDetail {
    id: string;
    title: string;
    description?: string;
    history?: string;
    bibliography?: string;
    geolocalisation?: string;
    creation_date: string;
    update_date: string;
    contributors: string;
    protected?: boolean;
    protection_comment?: string;
    authors: FilterOption[];
    sources?: string;
    city?: FilterOption;
    department?: FilterOption;
    region?: FilterOption;
    country?: FilterOption;
    conservation?: FilterOption[];
    materials?: FilterOption[];
    natures?: FilterOption[];
    medias?: MediaDetail[];
    centuries?: FilterOption[];
    themes?: FilterOption[];
    linked_furniture_images?: number[];
    linked_individuals?: number[];
    linked_legal_entities?: number[];
    parent_id?: number;
}

export interface MobilierImageDetail {
    id: string;
    title: string;
    description: string;
    history?: string;
    bibliography?: string;
    inscriptions?: string;
    creation_date: string;
    update_date: string;
    contributors: string;
    protected?: boolean;
    protection_comment?: string;
    conversation_place?: string
    origin_place?: string
    authors: FilterOption[];
    sources?: string;
    city?: FilterOption;
    department?: FilterOption;
    region?: FilterOption;
    country?: FilterOption;
    conservation?: FilterOption[];
    materials?: FilterOption[];
    natures?: FilterOption[];
    medias?: MediaDetail[];
    centuries?: FilterOption[];
    techniques?: FilterOption[];
    themes?: FilterOption[];
    linked_monuments_places?: number[];
    linked_individuals?: number[];
    linked_legal_entities?: number[];
    parent_id?: number;
}

export interface PersonneMoraleDetail {
    id: string;
    title: string;
    foundation_deed?: boolean;
    history?: string;
    bibliography?: string;
    simple_mention?: boolean;
    process?: string;
    social_involvement?: string;
    objects?: string;
    sources?: string;
    comment?: string;
    creation_date: string;
    update_date: string;
    contributors: string;
    authors: FilterOption[];
    city?: FilterOption;
    department?: FilterOption;
    region?: FilterOption;
    country?: FilterOption;
    natures?: FilterOption[];
    medias?: MediaDetail[];
    centuries?: FilterOption[];
    techniques?: FilterOption[];
    themes?: FilterOption[];
    linked_monuments_places?: number[];
    linked_individuals?: number[];
    linked_furniture_images?: number[];
    parent_id?: number;
}

export interface PersonnePhysiqueDetail {
    id: string;
    firstname: string;
    birthdate?: string;
    death?: string;
    comment?: string;
    attestation?: string;
    bibliography?: string;
    biographical_elements?: string;
    historical_period?: FilterOption[];
    pilgrimage_elements?: string;
    event_nature?: string;
    sources?: string;
    creation_date: string;
    update_date: string;
    contributors: string;
    authors: FilterOption[];
    city?: FilterOption;
    department?: FilterOption;
    region?: FilterOption;
    country?: FilterOption;
    travels?: FilterOption[];
    professions?: FilterOption[];
    medias?: MediaDetail[];
    centuries?: FilterOption[];
    themes?: FilterOption[];
    linked_monuments_places?: number[];
    linked_furniture_images?: number[];
    linked_legal_entities?: number[];
    parent_id?: number;
}

export type DetailResult = MonumentLieuDetail | MobilierImageDetail | PersonneMoraleDetail | PersonnePhysiqueDetail;

// Interface pour les données utilisateur stockées
export interface StoredUserData {
    firstname: string;
    email?: string;
    role?: 'contributeur' | 'admin';
    userId?: string; // JWT_ID
    grade?: 'ADMIN' | 'ACTIVE'; // JWT_GRADE
}

// Utilitaire pour décoder le JWT (simple, sans vérification de signature)
class JWTDecoder {
    static decode(token: string): JWTPayload | null {
        try {
            // Un JWT est composé de 3 parties séparées par des points
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Token JWT invalide');
            }

            // La payload est la seconde partie (index 1)
            const payload = parts[1];

            // Décoder la base64url
            const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

            // Parser le JSON
            const parsedPayload = JSON.parse(decodedPayload);

            return parsedPayload;
        } catch (error) {
            console.error('Erreur lors du décodage du JWT:', error);
            return null;
        }
    }
}

// Utilitaire pour formater les dates
export function formatCreationDate(dateString: string): string {
    const months = [
        'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];

    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
}

// Gestion des tokens et données utilisateur
class TokenManager {
    private static readonly TOKEN_KEY = 'sj_auth_token';
    private static readonly TOKEN_TYPE_KEY = 'sj_token_type';
    private static readonly EXPIRES_KEY = 'sj_token_expires';
    private static readonly USER_DATA_KEY = 'sj_user_data';

    static setToken(token: string, tokenType: string, expiresIn: number): void {
        const expiresAt = Date.now() + (expiresIn * 60 * 60 * 1000); // expiresIn est en heures

        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.TOKEN_TYPE_KEY, tokenType);
        localStorage.setItem(this.EXPIRES_KEY, expiresAt.toString());
    }

    static setUserData(userData: StoredUserData): void {
        localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
    }

    static getUserData(): StoredUserData | null {
        const userData = localStorage.getItem(this.USER_DATA_KEY);
        if (!userData) return null;

        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    static getToken(): { token: string; tokenType: string } | null {
        const token = localStorage.getItem(this.TOKEN_KEY);
        const tokenType = localStorage.getItem(this.TOKEN_TYPE_KEY);
        const expiresAt = localStorage.getItem(this.EXPIRES_KEY);

        if (!token || !tokenType || !expiresAt) {
            return null;
        }

        // Vérifier si le token a expiré
        if (Date.now() > parseInt(expiresAt)) {
            this.clearToken();
            return null;
        }

        return {token, tokenType};
    }

    static clearToken(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.TOKEN_TYPE_KEY);
        localStorage.removeItem(this.EXPIRES_KEY);
        localStorage.removeItem(this.USER_DATA_KEY);
    }

    static isTokenExpired(): boolean {
        const expiresAt = localStorage.getItem(this.EXPIRES_KEY);
        if (!expiresAt) return true;

        return Date.now() > parseInt(expiresAt);
    }

    // Nouvelle méthode pour décoder et extraire les données JWT
    static extractJWTData(token: string): { userId: string; grade: 'ADMIN' | 'ACTIVE' } | null {
        const payload = JWTDecoder.decode(token);
        if (!payload || !payload.JWT_ID || !payload.JWT_GRADE) {
            return null;
        }

        return {
            userId: payload.JWT_ID,
            grade: payload.JWT_GRADE
        };
    }
}

// Service API pour les appels backend
class ApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_CONFIG.baseUrl;
    }

    private async request(endpoint: string, options?: RequestInit) {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultOptions: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Ajouter le token d'authentification si disponible
        const tokenData = TokenManager.getToken();
        if (tokenData) {
            defaultOptions.headers = {
                ...defaultOptions.headers,
                'Authorization': `${tokenData.tokenType} ${tokenData.token}`
            };
        }

        const mergedOptions = {...defaultOptions, ...options};

        try {
            const response = await fetch(url, mergedOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Ne pas tenter de parser le JSON pour les réponses sans contenu
            if (response.status === 201 || response.status === 204) {
                return null;
            }

            // Vérifier si la réponse a du contenu
            const contentLength = response.headers.get('content-length');
            if (contentLength === '0') {
                return null;
            }

            return await response.json();
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }

    // Connexion utilisateur
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await this.request(API_CONFIG.endpoints.login, {
                method: 'POST',
                body: JSON.stringify({email, password}),
            });

            // Stocker le token automatiquement en cas de succès
            TokenManager.setToken(response.token, response.token_type, response.expires_in);

            // Extraire les données JWT (ID et grade)
            const jwtData = TokenManager.extractJWTData(response.token);

            // Stocker les données utilisateur basiques avec les données JWT
            const userData: StoredUserData = {
                firstname: response.firstname,
                email: email,
                userId: jwtData?.userId,
                grade: jwtData?.grade,
                // Conversion du grade JWT vers notre système de rôles
                role: jwtData?.grade === 'ADMIN' ? 'admin' : 'contributeur'
            };
            TokenManager.setUserData(userData);

            return response;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(500, 'Login failed', {detail: 'An unexpected error occurred'});
        }
    }

    // Récupérer le profil utilisateur complet depuis l'API
    async getUserProfile(userId: string): Promise<UserProfile> {
        const endpoint = `${API_CONFIG.endpoints.users}/${userId}`;
        return this.request(endpoint, {method: 'GET'});
    }

    // Mettre à jour le profil utilisateur
    async updateUserProfile(userId: string, updates: {
        firstname: string;
        lastname: string;
        mail: string;
        password?: string;
        old_password?: string;
        phone?: string;
        organization?: string;
        domain: 'ART' | 'ARCHITECTURE' | 'MEDIEVAL' | 'ARCHEOLOGIE' | 'PATRIMOINE' | 'THEOLOGIE' | 'PELERINAGE' | 'AUTRE';
    }): Promise<void> {
        const endpoint = `${API_CONFIG.endpoints.users}/${userId}`;

        // Préparer le body en excluant les champs vides
        const body: any = {
            firstname: updates.firstname,
            lastname: updates.lastname,
            mail: updates.mail,
            domain: updates.domain
        };

        // Ajouter les mots de passe seulement si fournis
        if (updates.password && updates.old_password) {
            body.password = updates.password;
            body.old_password = updates.old_password;
        }

        // Ajouter les champs optionnels seulement si non vides
        if (updates.phone && updates.phone.trim()) {
            body.phone = updates.phone;
        }

        if (updates.organization && updates.organization.trim()) {
            body.organization = updates.organization;
        }

        // Utiliser une approche spécialisée pour le PUT avec gestion du 204
        const url = `${this.baseUrl}${endpoint}`;

        const defaultOptions: RequestInit = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        };

        // Ajouter le token d'authentification si disponible
        const tokenData = TokenManager.getToken();
        if (tokenData) {
            defaultOptions.headers = {
                ...defaultOptions.headers,
                'Authorization': `${tokenData.tokenType} ${tokenData.token}`
            };
        }

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Pour un statut 204, pas de contenu à retourner
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }

    // Supprimer un compte utilisateur
    async deleteUserAccount(userId: string): Promise<void> {
        const endpoint = `${API_CONFIG.endpoints.users}/${userId}`;
        const url = `${this.baseUrl}${endpoint}`;

        const defaultOptions: RequestInit = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        // Ajouter le token d'authentification si disponible
        const tokenData = TokenManager.getToken();
        if (tokenData) {
            defaultOptions.headers = {
                ...defaultOptions.headers,
                'Authorization': `${tokenData.tokenType} ${tokenData.token}`
            };
        }

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Pour un statut 204, pas de contenu à retourner
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }

    // Récupérer la liste des contributeurs en attente de validation
    async getPendingUsers(): Promise<PendingUser[]> {
        const endpoint = API_CONFIG.endpoints.users;
        return this.request(endpoint, {method: 'GET'});
    }

    // Récupérer les fiches en attente de validation pour chaque catégorie (admin seulement)
    async getPendingMonumentsLieux(): Promise<PendingForm[]> {
        const endpoint = API_CONFIG.endpoints.monumentsLieux;
        return this.request(endpoint, {method: 'GET'});
    }

    async getPendingMobiliersImages(): Promise<PendingForm[]> {
        const endpoint = API_CONFIG.endpoints.mobiliersImages;
        return this.request(endpoint, {method: 'GET'});
    }

    async getPendingPersonnesMorales(): Promise<PendingForm[]> {
        const endpoint = API_CONFIG.endpoints.personnesMorales;
        return this.request(endpoint, {method: 'GET'});
    }

    async getPendingPersonnesPhysiques(): Promise<PendingForm[]> {
        const endpoint = API_CONFIG.endpoints.personnesPhysiques;
        return this.request(endpoint, {method: 'GET'});
    }

    // Valider ou rejeter une fiche en attente
    async validateForm(source: 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques', formId: string, action: 'activate' | 'reject'): Promise<void> {
        let endpoint: string;

        switch (source) {
            case 'monuments_lieux':
                endpoint = `${API_CONFIG.endpoints.monumentsLieux}/${formId}`;
                break;
            case 'mobiliers_images':
                endpoint = `${API_CONFIG.endpoints.mobiliersImages}/${formId}`;
                break;
            case 'personnes_morales':
                endpoint = `${API_CONFIG.endpoints.personnesMorales}/${formId}`;
                break;
            case 'personnes_physiques':
                endpoint = `${API_CONFIG.endpoints.personnesPhysiques}/${formId}`;
                break;
            default:
                throw new ApiError(400, 'Invalid form source');
        }

        const url = `${this.baseUrl}${endpoint}`;

        const defaultOptions: RequestInit = {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({action})
        };

        // Ajouter le token d'authentification si disponible
        const tokenData = TokenManager.getToken();
        if (tokenData) {
            defaultOptions.headers = {
                ...defaultOptions.headers,
                'Authorization': `${tokenData.tokenType} ${tokenData.token}`
            };
        }

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Pour un statut 204, pas de contenu à retourner
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }

    // Valider ou rejeter un contributeur en attente
    async validateUser(userId: string, action: 'activate' | 'reject'): Promise<void> {
        const endpoint = `${API_CONFIG.endpoints.users}/${userId}`;
        const url = `${this.baseUrl}${endpoint}`;

        const defaultOptions: RequestInit = {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({action})
        };

        // Ajouter le token d'authentification si disponible
        const tokenData = TokenManager.getToken();
        if (tokenData) {
            defaultOptions.headers = {
                ...defaultOptions.headers,
                'Authorization': `${tokenData.tokenType} ${tokenData.token}`
            };
        }

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Pour un statut 204, pas de contenu à retourner
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }

    async resetPassword(email: string): Promise<void> {
        const url = `${this.baseUrl}/api/v1/password-reset`;

        const defaultOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email})
        }

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Pour un statut 204, pas de contenu à retourner
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }

    // Valider un token de réinitialisation de mot de passe
    async validateResetToken(token: string): Promise<void> {
        const url = `${this.baseUrl}/api/v1/password-reset/${token}`;

        const defaultOptions: RequestInit = {
            method: 'GET',
        };

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Pour un statut 204, pas de contenu à retourner
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }

    async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
        const url = `${this.baseUrl}/api/v1/password-reset/${token}`;

        const defaultOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({password: newPassword})
        };

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Pour un statut 204, pas de contenu à retourner
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }

    async validateEmailToken(token: string): Promise<void> {
        const url = `${this.baseUrl}/api/v1/email/${token}/validate`;

        try {
            const response = await fetch(url, {
                method: 'GET',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Pour un statut 204, pas de contenu à retourner
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }

    // Récupérer les données utilisateur stockées
    getUserData(): StoredUserData | null {
        return TokenManager.getUserData();
    }

    // Déconnexion
    logout(): void {
        TokenManager.clearToken();
    }

    // Vérifier si l'utilisateur est connecté
    isAuthenticated(): boolean {
        return TokenManager.getToken() !== null;
    }

    // Inscription d'un nouveau contributeur
    async createUser(userData: {
        firstname: string;
        lastname: string;
        mail: string;
        password: string;
        phone?: string;
        organization?: string;
        domain: string;
        motivation: string;
    }) {
        return this.request(API_CONFIG.endpoints.users, {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    // Upload d'image
    async uploadImage(imageFile: File, title: string): Promise<{ id: string }> {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('title', title);

        const url = `${this.baseUrl}/api/v1/medias`;

        const defaultOptions: RequestInit = {
            method: 'POST'
        };

        // Ajouter le token d'authentification si disponible
        const tokenData = TokenManager.getToken();
        if (tokenData) {
            defaultOptions.headers = {
                'Authorization': `${tokenData.tokenType} ${tokenData.token}`
            };
        }

        try {
            const response = await fetch(url, {
                ...defaultOptions,
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }

    async submitMobilierImage(formData: any): Promise<void> {
        const url = `${this.baseUrl}/api/v1/mobiliers_images`;

        const defaultOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        };

        // Ajouter le token d'authentification si disponible
        const tokenData = TokenManager.getToken();
        if (tokenData) {
            defaultOptions.headers = {
                ...defaultOptions.headers,
                'Authorization': `${tokenData.tokenType} ${tokenData.token}`
            };
        }

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Pour un statut 201 Created, pas de contenu à retourner
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }

    async submitPersonneMorale(formData: any): Promise<void> {
        const url = `${this.baseUrl}/api/v1/personnes_morales`;

        const defaultOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        };

        // Ajouter le token d'authentification si disponible
        const tokenData = TokenManager.getToken();
        if (tokenData) {
            defaultOptions.headers = {
                ...defaultOptions.headers,
                'Authorization': `${tokenData.tokenType} ${tokenData.token}`
            };
        }

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Pour un statut 201 Created, pas de contenu à retourner
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }

    async submitPersonnePhysique(formData: any): Promise<void> {
        const url = `${this.baseUrl}/api/v1/personnes_physiques`;

        const defaultOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        };

        // Ajouter le token d'authentification si disponible
        const tokenData = TokenManager.getToken();
        if (tokenData) {
            defaultOptions.headers = {
                ...defaultOptions.headers,
                'Authorization': `${tokenData.tokenType} ${tokenData.token}`
            };
        }

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Pour un statut 201 Created, pas de contenu à retourner
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }

    async submitMonumentLieu(formData: any): Promise<void> {
        const url = `${this.baseUrl}/api/v1/monuments_lieux`;

        const defaultOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        };

        // Ajouter le token d'authentification si disponible
        const tokenData = TokenManager.getToken();
        if (tokenData) {
            defaultOptions.headers = {
                ...defaultOptions.headers,
                'Authorization': `${tokenData.tokenType} ${tokenData.token}`
            };
        }

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Pour un statut 201 Created, pas de contenu à retourner
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }

    async updateMobilierImage(id: string, formData: any): Promise<void> {
        const url = `${this.baseUrl}/api/v1/mobiliers_images/${id}`;

        const defaultOptions: RequestInit = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        };

        // Ajouter le token d'authentification si disponible
        const tokenData = TokenManager.getToken();
        if (tokenData) {
            defaultOptions.headers = {
                ...defaultOptions.headers,
                'Authorization': `${tokenData.tokenType} ${tokenData.token}`
            };
        }

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Pour un statut 204 No content, pas de contenu à retourner
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }

    async updateMonumentLieu(id: string, formData: any): Promise<void> {
        const url = `${this.baseUrl}/api/v1/monuments_lieux/${id}`;

        const defaultOptions: RequestInit = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        };

        // Ajouter le token d'authentification si disponible
        const tokenData = TokenManager.getToken();
        if (tokenData) {
            defaultOptions.headers = {
                ...defaultOptions.headers,
                'Authorization': `${tokenData.tokenType} ${tokenData.token}`
            };
        }

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Pour un statut 204 No content, pas de contenu à retourner
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }

    async updatePersonneMorale(id: string, formData: any): Promise<void> {
        const url = `${this.baseUrl}/api/v1/personnes_morales/${id}`;

        const defaultOptions: RequestInit = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        };

        // Ajouter le token d'authentification si disponible
        const tokenData = TokenManager.getToken();
        if (tokenData) {
            defaultOptions.headers = {
                ...defaultOptions.headers,
                'Authorization': `${tokenData.tokenType} ${tokenData.token}`
            };
        }

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Pour un statut 204 No content, pas de contenu à retourner
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }

    async updatePersonnePhysique(id: string, formData: any): Promise<void> {
        const url = `${this.baseUrl}/api/v1/personnes_physiques/${id}`;

        const defaultOptions: RequestInit = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        };

        // Ajouter le token d'authentification si disponible
        const tokenData = TokenManager.getToken();
        if (tokenData) {
            defaultOptions.headers = {
                ...defaultOptions.headers,
                'Authorization': `${tokenData.tokenType} ${tokenData.token}`
            };
        }

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Pour un statut 204 No content, pas de contenu à retourner
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }

    // Recherche avec filtres avancés
    async search(
        query: string,
        body: SearchRequestBody,
        limit = 10,
        page = 1
    ): Promise<SearchResponse> {
        const queryParams = new URLSearchParams({
            q: query,
            limit: limit.toString(),
            page: page.toString()
        });

        const url = `${API_CONFIG.endpoints.search}?${queryParams}`;

        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    // Récupérer les détails d'une fiche selon son type et son ID
    async getRecordDetail(source: 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques', id: string): Promise<DetailResult> {
        let endpoint: string;

        switch (source) {
            case 'monuments_lieux':
                endpoint = `${API_CONFIG.endpoints.monumentsLieux}/${id}`;
                break;
            case 'mobiliers_images':
                endpoint = `${API_CONFIG.endpoints.mobiliersImages}/${id}`;
                break;
            case 'personnes_morales':
                endpoint = `${API_CONFIG.endpoints.personnesMorales}/${id}`;
                break;
            case 'personnes_physiques':
                endpoint = `${API_CONFIG.endpoints.personnesPhysiques}/${id}`;
                break;
            default:
                throw new ApiError(400, 'Invalid record type');
        }

        return this.request(endpoint, {method: 'GET'});
    }

    // Récupérer la liste des pays
    async getCountries(): Promise<Country[]> {
        try {
            const c: Country[] = await this.request(API_CONFIG.endpoints.countries);
            return c.sort((a: Country, b: Country) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error('Erreur lors du chargement des pays:', error);
            return [];
        }
    }

    // Récupérer la liste des régions
    async getRegions(): Promise<Region[]> {
        try {
            const r: Region[] = await this.request(API_CONFIG.endpoints.regions);
            return r.sort((a: Region, b: Region) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error('Erreur lors du chargement des régions:', error);
            return [];
        }
    }

    // Récupérer la liste des départements
    async getDepartments(): Promise<Department[]> {
        try {
            return await this.request(API_CONFIG.endpoints.departments);
        } catch (error) {
            console.error('Erreur lors du chargement des départements:', error);
            // Fallback avec données mock
            return [];
        }
    }

    // Recherche de communes avec query
    async searchCommunes(query: string): Promise<Commune[]> {
        try {
            const queryParams = new URLSearchParams({q: query});
            const url = `${API_CONFIG.endpoints.communes}?${queryParams}`;
            return await this.request(url);
        } catch (error) {
            console.error('Erreur lors de la recherche de communes:', error);
            return [];
        }
    }

    // Récupérer tous les filtres dynamiques disponibles
    async getCenturies(): Promise<FilterOption[]> {
        try {
            return await this.request(API_CONFIG.endpoints.centuries);
        } catch (error) {
            console.error('Erreur lors du chargement des siècles:', error);
            return [];
        }
    }

    async getThemes(): Promise<FilterOption[]> {
        try {
            return await this.request(API_CONFIG.endpoints.themes);
        } catch (error) {
            console.error('Erreur lors du chargement des thèmes:', error);
            return [];
        }
    }

    async getConservationStates(): Promise<FilterOption[]> {
        try {
            return await this.request(API_CONFIG.endpoints.conservationStates);
        } catch (error) {
            console.error('Erreur lors du chargement des états de conservation:', error);
            return [];
        }
    }

    async getMaterials(): Promise<FilterOption[]> {
        try {
            return await this.request(API_CONFIG.endpoints.materials);
        } catch (error) {
            console.error('Erreur lors du chargement des matériaux:', error);
            return [];
        }
    }

    async getBuildingNatures(): Promise<FilterOption[]> {
        try {
            return await this.request(API_CONFIG.endpoints.buildingNatures);
        } catch (error) {
            console.error('Erreur lors du chargement des natures de bâtiments:', error);
            return [];
        }
    }

    async getFurnituresNatures(): Promise<FilterOption[]> {
        try {
            return await this.request(API_CONFIG.endpoints.furnituresNatures);
        } catch (error) {
            console.error('Erreur lors du chargement des natures de mobilier:', error);
            return [];
        }
    }

    async getFurnituresTechniques(): Promise<FilterOption[]> {
        try {
            return await this.request(API_CONFIG.endpoints.furnituresTechniques);
        } catch (error) {
            console.error('Erreur lors du chargement des techniques de mobilier:', error);
            return [];
        }
    }

    async getLegalEntityNatures(): Promise<FilterOption[]> {
        try {
            return await this.request(API_CONFIG.endpoints.legalEntityNatures);
        } catch (error) {
            console.error('Erreur lors du chargement des natures de personnes morales:', error);
            return [];
        }
    }

    async getProfessions(): Promise<FilterOption[]> {
        try {
            return await this.request(API_CONFIG.endpoints.professions);
        } catch (error) {
            console.error('Erreur lors du chargement des professions:', error);
            return [];
        }
    }

    async getTravels(): Promise<FilterOption[]> {
        try {
            return await this.request(API_CONFIG.endpoints.travels);
        } catch (error) {
            console.error('Erreur lors du chargement des moyens de transport:', error);
            return [];
        }
    }

    async getHistoricalPeriods(): Promise<FilterOption[]> {
        try {
            return await this.request(API_CONFIG.endpoints.historicalPeriods);
        } catch (error) {
            console.error('Erreur lors du chargement des périodes historiques:', error);
            return [];
        }
    }

    // Récupérer les brouillons pour chaque catégorie (utilisateur connecté uniquement)
    async getDraftMonumentsLieux(): Promise<PendingForm[]> {
        const endpoint = `${API_CONFIG.endpoints.draftMonumentsLieux}`;
        return this.request(endpoint, {method: 'GET'});
    }

    async getDraftMobiliersImages(): Promise<PendingForm[]> {
        const endpoint = `${API_CONFIG.endpoints.draftMobiliersImages}`;
        return this.request(endpoint, {method: 'GET'});
    }

    async getDraftPersonnesMorales(): Promise<PendingForm[]> {
        const endpoint = `${API_CONFIG.endpoints.draftPersonnesMorales}`;
        return this.request(endpoint, {method: 'GET'});
    }

    async getDraftPersonnesPhysiques(): Promise<PendingForm[]> {
        const endpoint = `${API_CONFIG.endpoints.draftPersonnesPhysiques}`;
        return this.request(endpoint, {method: 'GET'});
    }

    async deleteDraft(
        category: 'monuments_lieux' | 'mobiliers_images' | 'personnes_morales' | 'personnes_physiques',
        draftId: string
    ): Promise<void> {
        const endpoint = `/api/v1/draft/${category}/${draftId}`;
        const url = `${this.baseUrl}${endpoint}`;

        const defaultOptions: RequestInit = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        // Ajouter le token d'authentification si disponible
        const tokenData = TokenManager.getToken();
        if (tokenData) {
            defaultOptions.headers = {
                ...defaultOptions.headers,
                'Authorization': `${tokenData.tokenType} ${tokenData.token}`
            };
        }

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Pour un statut 204, pas de contenu à retourner
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            // Erreur réseau - throw sans logger
            throw new ApiError(0, 'Network error', { detail: 'Unable to connect to the server' });
        }
    }

     async getUserHistory(userId: string, limit?: number, page?: number): Promise<HistoryResponse> {
        const queryParams = new URLSearchParams();
        if (limit) queryParams.append('limit', limit.toString());
        if (page) queryParams.append('page', page.toString());

        const endpoint = `/api/v1/history/${userId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

        return this.request(endpoint, { method: 'GET' });
    }

    // Récupérer tous les utilisateurs (dashboard admin)
    async getAllUsers(): Promise<AdminUser[]> {
        const endpoint = '/api/v1/admin/users';
        return this.request(endpoint, { method: 'GET' });
    }

    // Récupérer toutes les contributions (admin uniquement)
    async getAllContributions(limit?: number, page?: number): Promise<ContributionsResponse> {
        const queryParams = new URLSearchParams();
        if (limit) queryParams.append('limit', limit.toString());
        if (page) queryParams.append('page', page.toString());

        const endpoint = `/api/v1/admin/contributions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        return this.request(endpoint, { method: 'GET' });
    }

    async postContact(subject: string, message: string, email: string): Promise<void> {
        const url = `${this.baseUrl}${API_CONFIG.endpoints.contact}`;

        const defaultOptions: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({subject, message, email})
        };

        const tokenData = TokenManager.getToken();
        if (tokenData) {
            defaultOptions.headers = {
                ...defaultOptions.headers,
                'Authorization': `${tokenData.tokenType} ${tokenData.token}`
            };
        }

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`, errorData);
            }

            // Pour un statut 204, pas de contenu à retourner
            return;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('API request failed:', error);
            throw new ApiError(0, 'Network error', {detail: 'Unable to connect to the server'});
        }
    }
}

// Instance globale du service API
export const apiService = new ApiService();

// Export de la classe ApiError pour utilisation externe
export {ApiError};