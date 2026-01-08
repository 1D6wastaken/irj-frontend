import { AdvancedFilters } from "../App";
import {SearchRequestBody, FilterOption, apiService, API_CONFIG} from "../config/api";

// Mapping des badges de source vers les labels d'affichage
export const SOURCE_LABELS = {
  'monuments_lieux': 'Monuments & Lieux',
  'mobiliers_images': 'Mobiliers & Images',
  'personnes_morales': 'P. Morales',
  'personnes_physiques': 'P. Physiques'
} as const;

// Cache pour stocker les données des filtres et éviter des requêtes répétées
class FilterCache {
  private static cache = new Map<string, FilterOption[]>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static cacheTimestamps = new Map<string, number>();

  static async get(key: string, fetchFunction: () => Promise<FilterOption[]>): Promise<FilterOption[]> {
    const now = Date.now();
    const timestamp = this.cacheTimestamps.get(key);
    
    // Vérifier si le cache est valide
    if (timestamp && (now - timestamp) < this.CACHE_DURATION && this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Charger les données et les mettre en cache
    try {
      const data = await fetchFunction();
      this.cache.set(key, data);
      this.cacheTimestamps.set(key, now);
      return data;
    } catch (error) {
      // Si erreur et cache existant, retourner le cache même périmé
      if (this.cache.has(key)) {
        return this.cache.get(key)!;
      }
      throw error;
    }
  }

  static clear(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }
}

// Fonction pour transformer les noms en IDs
async function getFilterIds(names: string[], filterType: string): Promise<number[]> {
  if (!names || names.length === 0) return [];

  let filterOptions: FilterOption[] = [];

  try {
    switch (filterType) {
      case 'centuries':
        filterOptions = await FilterCache.get('centuries', () => apiService.getCenturies());
        break;
      case 'themes':
        filterOptions = await FilterCache.get('themes', () => apiService.getThemes());
        break;
      case 'buildingNatures':
        filterOptions = await FilterCache.get('buildingNatures', () => apiService.getBuildingNatures());
        break;
      case 'furnituresNatures':
        filterOptions = await FilterCache.get('furnituresNatures', () => apiService.getFurnituresNatures());
        break;
      case 'conservationStates':
        filterOptions = await FilterCache.get('conservationStates', () => apiService.getConservationStates());
        break;
      case 'materials':
        filterOptions = await FilterCache.get('materials', () => apiService.getMaterials());
        break;
      case 'furnituresTechniques':
        filterOptions = await FilterCache.get('furnituresTechniques', () => apiService.getFurnituresTechniques());
        break;
      case 'legalEntityNatures':
        filterOptions = await FilterCache.get('legalEntityNatures', () => apiService.getLegalEntityNatures());
        break;
      case 'professions':
        filterOptions = await FilterCache.get('professions', () => apiService.getProfessions());
        break;
      case 'travels':
        filterOptions = await FilterCache.get('travels', () => apiService.getTravels());
        break;
      default:
        return [];
    }

    // Transformer les noms en IDs
    const ids: number[] = [];
    names.forEach(name => {
      const option = filterOptions.find(opt => opt.name === name);
      if (option) {
        ids.push(parseInt(option.id));
      }
    });

    return ids;
  } catch (error) {
    console.error(`Erreur lors de la récupération des IDs pour ${filterType}:`, error);
    return [];
  }
}

// Fonction principale pour transformer les filtres
export async function transformFiltersToApiFormat(
  selectedCategories: string[],
  filters: AdvancedFilters
): Promise<SearchRequestBody> {
  const body: SearchRequestBody = {};

  try {
    // Transformation des siècles (commun à toutes les catégories)
    if (filters.centuries && filters.centuries.length > 0) {
      body.centuries = await getFilterIds(filters.centuries, 'centuries');
    }

    // Transformation des themes (commun à toutes les catégories)
    if (filters.themes && filters.themes.length > 0) {
      body.themes = await getFilterIds(filters.themes, 'themes');
    }

    // Transformation des filtres géographiques
    if (filters.location) {
      if (filters.location.countries && filters.location.countries.length > 0) {
        body.countries = filters.location.countries.map(id => parseInt(id));
      }
      if (filters.location.regions && filters.location.regions.length > 0) {
        body.regions = filters.location.regions.map(id => parseInt(id));
      }
      if (filters.location.departments && filters.location.departments.length > 0) {
        body.departments = filters.location.departments.map(id => parseInt(id));
      }
      if (filters.location.communes && filters.location.communes.length > 0) {
        body.cities = filters.location.communes.map(id => parseInt(id));
      }
    }

    // Transformation des filtres spécifiques par catégorie
    for (const category of selectedCategories) {
      switch (category) {
        case 'monuments_lieux':
          body.monuments_lieux = {
              natures: [],
              states: [],
              materials: [],
          };

          if (filters.naturesMonu && filters.naturesMonu.length > 0) {
            body.monuments_lieux.natures = await getFilterIds(filters.naturesMonu, 'buildingNatures');
          }
          if (filters.conservationStatesMonu && filters.conservationStatesMonu.length > 0) {
            body.monuments_lieux.states = await getFilterIds(filters.conservationStatesMonu, 'conservationStates');
          }
          if (filters.materialsMonu && filters.materialsMonu.length > 0) {
            body.monuments_lieux.materials = await getFilterIds(filters.materialsMonu, 'materials');
          }

          break;

        case 'mobiliers_images':
          body.mobiliers_images = {
              natures: [],
              techniques: [],
              states: [],
              materials: [],
          }

          if (filters.naturesMob && filters.naturesMob.length > 0) {
            body.mobiliers_images.natures = await getFilterIds(filters.naturesMob, 'furnituresNatures');
          }
          if (filters.techniques && filters.techniques.length > 0) {
            body.mobiliers_images.techniques = await getFilterIds(filters.techniques, 'furnituresTechniques');
          }
          if (filters.conservationStatesMob && filters.conservationStatesMob.length > 0) {
            body.mobiliers_images.states = await getFilterIds(filters.conservationStatesMob, 'conservationStates');
          }
          if (filters.materialsMob && filters.materialsMob.length > 0) {
            body.mobiliers_images.materials = await getFilterIds(filters.materialsMob, 'materials');
          }

          break;

        case 'personnes_morales':
          body.pers_morales = {
              natures: [],
          }

          if (filters.naturesOrg && filters.naturesOrg.length > 0) {
            body.pers_morales.natures = await getFilterIds(filters.naturesOrg, 'legalEntityNatures');
          }
          break;

        case 'personnes_physiques':
          body.pers_physiques = {
              professions: [],
              travels: [],
          };
            
          if (filters.professions && filters.professions.length > 0) {
            body.pers_physiques.professions = await getFilterIds(filters.professions, 'professions');
          }
          if (filters.transportModes && filters.transportModes.length > 0) {
            body.pers_physiques.travels = await getFilterIds(filters.transportModes, 'travels');
          }
          break;
      }
    }

    return body;
  } catch (error) {
    console.error('Erreur lors de la transformation des filtres:', error);
    return {}; // Retourner un objet vide en cas d'erreur
  }
}

// Fonction utilitaire pour débouncer les requêtes de recherche
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Fonction pour générer l'URL de l'image à partir d'un media
export function getMediaImageUrl(mediaId: string): string {
  return `${API_CONFIG.baseUrl}/media/${mediaId}`;
}