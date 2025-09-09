import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Users, User, Trophy, Church, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { AdvancedFilters } from "../App";
import { LocationFilter } from "./filters/LocationFilter";
import { DynamicFilters } from "./filters/DynamicFilters";
import { categories } from "../constants/filters";
import { apiService, SearchItem } from "../config/api";
import { transformFiltersToApiFormat, debounce, SOURCE_LABELS } from "../utils/searchUtils";

interface SearchSectionProps {
  onSearch: (query: string, categories: string[], filters: AdvancedFilters) => void;
  onViewDetail?: (resultId: string, source?: string) => void;
}

export function SearchSection({ onSearch, onViewDetail }: SearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<AdvancedFilters>({});
  
  // États pour l'autocomplétion
  const [autocompleteResults, setAutocompleteResults] = useState<SearchItem[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false);
  const [selectedAutocompleteIndex, setSelectedAutocompleteIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Gestion des filtres de localisation avec le nouveau composant
  const handleLocationChange = (locationFilters: { countries?: string[]; regions?: string[]; departments?: string[]; communes?: string[]; }) => {
    setPendingFilters(prev => ({
      ...prev,
      location: locationFilters
    }));
  };

  const toggleArrayFilter = (key: keyof AdvancedFilters, value: string) => {
    setPendingFilters(prev => {
      const currentArray = (prev[key] as string[]) || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return {
        ...prev,
        [key]: newArray.length > 0 ? newArray : undefined
      };
    });
  };

  // Fonction de recherche autocomplete avec debounce
  const performAutocompleteSearch = debounce(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
      return;
    }

    setIsLoadingAutocomplete(true);
    
    try {
      // Transformer les filtres pour l'API
      const searchBody = await transformFiltersToApiFormat(selectedCategories, pendingFilters);
      
      // Faire la recherche avec limit=3 pour l'autocomplétion
      const response = await apiService.search(query, searchBody, 3, 1);
      
      setAutocompleteResults(response.items);
      setShowAutocomplete(response.items.length > 0);
      setSelectedAutocompleteIndex(-1);
    } catch (error) {
      console.error('Erreur lors de la recherche autocomplete:', error);
      setAutocompleteResults([]);
      setShowAutocomplete(false);
    } finally {
      setIsLoadingAutocomplete(false);
    }
  }, 300);

  // Effet pour déclencher l'autocomplétion
  useEffect(() => {
    performAutocompleteSearch(searchQuery);
  }, [searchQuery, selectedCategories]);

  // Gestion des clics en dehors de l'autocomplétion
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    const query = searchQuery.trim() || "";
    setShowAutocomplete(false);
    onSearch(query, selectedCategories, pendingFilters);
  };

  const handleAutocompleteSelect = (item: SearchItem) => {
    setShowAutocomplete(false);
    setSearchQuery('');
    if (onViewDetail) {
      onViewDetail(item.id, item.source);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!showAutocomplete) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    // Navigation dans l'autocomplétion
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedAutocompleteIndex(prev => 
        prev < autocompleteResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedAutocompleteIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedAutocompleteIndex >= 0 && selectedAutocompleteIndex < autocompleteResults.length) {
        handleAutocompleteSelect(autocompleteResults[selectedAutocompleteIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
      setSelectedAutocompleteIndex(-1);
    }
  };

  const hasActiveFilters = () => {
    // Vérifier les filtres de localisation
    if (pendingFilters.location) {
      const { countries, regions, departments, communes } = pendingFilters.location;
      if (countries?.length || regions?.length || departments?.length || communes?.length) {
        return true;
      }
    }
    
    // Vérifier les autres filtres
    return Object.keys(pendingFilters).some(key => {
      if (key === 'location') return false; // Déjà vérifié au-dessus
      const value = pendingFilters[key as keyof AdvancedFilters];
      return Array.isArray(value) && value.length > 0;
    });
  };

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className=" mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Recherches détaillées
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Explorez toute la base de données pour découvrir les caractéristiques détaillées connues de chaque élément répertorié dans la base.<br/>
              Le choix des caractéristiques souhaitées est fait en actionnant des filtres qui indiquent le nom de la catégorie et les valeurs enregistrées.
          </p>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-border">
            {/* Barre de recherche principale */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Rechercher des monuments, objets, personnes... (optionnel)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onFocus={() => {
                    if (autocompleteResults.length > 0) {
                      setShowAutocomplete(true);
                    }
                  }}
                  className="pl-12 py-4 text-lg border-input bg-input-background rounded-xl"
                />
                
                {/* Autocomplétion */}
                {showAutocomplete && (
                  <div
                    ref={autocompleteRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50 max-h-90 overflow-y-auto"
                  >
                    {isLoadingAutocomplete ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Recherche en cours...
                      </div>
                    ) : (
                      <>
                        {autocompleteResults.map((item, index) => {
                           const categoryInfo = categories.find(cat => cat.id === item.source);

                            return <div
                                key={item.id}
                                className={`p-3 border-b border-border last:border-b-0 cursor-pointer transition-colors ${
                                    index === selectedAutocompleteIndex
                                        ? 'bg-accent'
                                        : 'hover:bg-accent/50'
                                }`}
                                onClick={() => handleAutocompleteSelect(item)}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="secondary" className={`text-xs ${categoryInfo ? categoryInfo.color : ''}`}>
                                            <MapPin className="w-3 h-3 mr-1"/>
                                            {SOURCE_LABELS[item.source]}
                                        </Badge>
                                    </div>
                                    <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {item.natures?.slice(0, 2).map((nature) => (
                                            <Badge key={nature} variant="outline" className="text-xs">
                                                {nature}
                                            </Badge>
                                        ))}
                                        {item.centuries?.slice(0, 1).map((century) => (
                                            <Badge key={century} variant="outline" className="text-xs">
                                                {century}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        }    )}
                        <div className="p-2 bg-muted/30 text-center">
                          <button
                            onClick={handleSearch}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            Voir tous les résultats pour "{searchQuery}"
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <Button 
                onClick={handleSearch}
                className="px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
              >
                Rechercher
              </Button>
            </div>
            
            {/* Filtres par catégorie */}
            <div className="text-left mb-6">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Filtrer par catégorie (optionnel) :
              </p>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => {
                  const IconComponent = category.id === 'monuments_lieux' ? Church :
                                       category.id === 'mobiliers_images' ? Trophy :
                                       category.id === 'personnes_morales' ? Users : User;
                  const isSelected = selectedCategories.includes(category.id);

                  return (
                    <Badge
                      key={category.id}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 transition-all duration-200 ${
                        isSelected 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : 'hover:bg-accent hover:text-accent-foreground'
                      }`}
                      onClick={() => toggleCategory(category.id)}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {category.name}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Filtres avancés */}
            <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    Filtres avancés
                    {hasActiveFilters() && (
                      <Badge variant="secondary" className="ml-2">
                        Actifs
                      </Badge>
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-4 space-y-6">
                {/* Filtres de localisation avec le nouveau composant */}
                <div className="border border-border rounded-lg p-4">
                  <LocationFilter 
                    value={pendingFilters.location || {}}
                    onChange={handleLocationChange}
                  />
                </div>

                {/* Filtres dynamiques (siècles + filtres par catégorie) */}
                <DynamicFilters
                  selectedCategories={selectedCategories}
                  pendingFilters={pendingFilters}
                  onToggleArrayFilter={toggleArrayFilter}
                />

                {/* Bouton de recherche en bas des filtres */}
                <div className="flex justify-center pt-6 border-t border-border">
                  <Button 
                    onClick={handleSearch}
                    className="px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Lancer la recherche
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </section>
  );
}