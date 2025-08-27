import { useState, useEffect, useRef } from "react";
import { ChevronDown, X, Search, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { apiService, Country, Region, Department, Commune } from "../../config/api";

interface LocationFilters {
  countries?: string[];
  regions?: string[];
  departments?: string[];
  communes?: string[];
}

interface LocationFilterProps {
  value: LocationFilters;
  onChange: (filters: LocationFilters) => void;
}

export function LocationFilter({ value, onChange }: LocationFilterProps) {
  // États pour les données
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [communes, setCommunesResults] = useState<Commune[]>([]);
  
  // États pour la sélection
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<Region[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);
  const [selectedCommunes, setSelectedCommunes] = useState<Commune[]>([]);
  
  // États pour l'interface
  const [openCountries, setOpenCountries] = useState(false);
  const [openRegions, setOpenRegions] = useState(false);
  const [openDepartments, setOpenDepartments] = useState(false);
  const [communeSearch, setCommuneSearch] = useState('');
  const [showCommuneResults, setShowCommuneResults] = useState(false);
  const [isSearchingCommunes, setIsSearchingCommunes] = useState(false);
  
  // Ref pour le debounce
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Chargement initial des données
  useEffect(() => {
    loadCountries();
    loadRegions();
    loadDepartments();
  }, []);

  // Synchronisation avec les valeurs externes
  useEffect(() => {
    if (value.countries) {
      const selected = countries.filter(c => value.countries!.includes(c.id));
      setSelectedCountries(selected);
    }
  }, [value.countries, countries]);

  useEffect(() => {
    if (value.regions) {
      const selected = regions.filter(r => value.regions!.includes(r.id));
      setSelectedRegions(selected);
    }
  }, [value.regions, regions]);

  useEffect(() => {
    if (value.departments) {
      const selected = departments.filter(d => value.departments!.includes(d.id));
      setSelectedDepartments(selected);
    }
  }, [value.departments, departments]);

  useEffect(() => {
    if (value.communes) {
      // Charger les communes sélectionnées si nécessaire
      // Pour le moment, on assume qu'elles sont déjà disponibles
    }
  }, [value.communes]);

  const loadCountries = async () => {
    try {
      const data = await apiService.getCountries();
      setCountries(data);
    } catch (error) {
      console.error('Erreur chargement pays:', error);
    }
  };

  const loadRegions = async () => {
    try {
      const data = await apiService.getRegions();
      setRegions(data);
    } catch (error) {
      console.error('Erreur chargement régions:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await apiService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Erreur chargement départements:', error);
    }
  };

  const searchCommunes = async (query: string) => {
    if (query.length < 2) {
      setCommunesResults([]);
      return;
    }

    setIsSearchingCommunes(true);
    try {
      const data = await apiService.searchCommunes(query);
      setCommunesResults(data);
    } catch (error) {
      console.error('Erreur recherche communes:', error);
      setCommunesResults([]);
    } finally {
      setIsSearchingCommunes(false);
    }
  };

  // Debounce pour la recherche de communes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchCommunes(communeSearch);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [communeSearch]);

  // Filtrage des régions selon les pays sélectionnés
  const getFilteredRegions = () => {
    if (selectedCountries.length === 0) {
      return regions;
    }
    const countryIds = selectedCountries.map(c => c.id);
    return regions.filter(region => countryIds.includes(region.pays.id));
  };

  // Filtrage des départements selon les régions/pays sélectionnés
  const getFilteredDepartments = () => {
    if (selectedRegions.length > 0) {
      const regionIds = selectedRegions.map(r => r.id);
      return departments.filter(dept => regionIds.includes(dept.region.id));
    } else if (selectedCountries.length > 0) {
      const countryIds = selectedCountries.map(c => c.id);
      return departments.filter(dept => countryIds.includes(dept.region.pays.id));
    }
    return departments;
  };

  // Gestion de la sélection des pays
  const handleCountryChange = (country: Country, checked: boolean) => {
    let newSelected: Country[];
    
    if (checked) {
      newSelected = [...selectedCountries, country];
    } else {
      newSelected = selectedCountries.filter(c => c.id !== country.id);
      // Supprimer aussi les régions et départements liés
      const newRegions = selectedRegions.filter(r => r.pays.id !== country.id);
      const newDepartments = selectedDepartments.filter(d => d.region.pays.id !== country.id);
      setSelectedRegions(newRegions);
      setSelectedDepartments(newDepartments);
      
      onChange({
        ...value,
        regions: newRegions.map(r => r.id),
        departments: newDepartments.map(d => d.id)
      });
    }
    
    setSelectedCountries(newSelected);
    onChange({
      ...value,
      countries: newSelected.map(c => c.id)
    });
  };

  // Gestion de la sélection des régions
  const handleRegionChange = (region: Region, checked: boolean) => {
    let newSelected: Region[];
    
    if (checked) {
      newSelected = [...selectedRegions, region];
    } else {
      newSelected = selectedRegions.filter(r => r.id !== region.id);
      // Supprimer aussi les départements liés
      const newDepartments = selectedDepartments.filter(d => d.region.id !== region.id);
      setSelectedDepartments(newDepartments);
      
      onChange({
        ...value,
        departments: newDepartments.map(d => d.id)
      });
    }
    
    setSelectedRegions(newSelected);
    onChange({
      ...value,
      regions: newSelected.map(r => r.id)
    });
  };

  // Gestion de la sélection des départements
  const handleDepartmentChange = (department: Department, checked: boolean) => {
    const newSelected = checked 
      ? [...selectedDepartments, department]
      : selectedDepartments.filter(d => d.id !== department.id);
    
    setSelectedDepartments(newSelected);
    onChange({
      ...value,
      departments: newSelected.map(d => d.id)
    });
  };

  // Gestion de la sélection des communes
  const handleCommuneSelect = (commune: Commune) => {
    if (selectedCommunes.find(c => c.id === commune.id)) {
      return; // Déjà sélectionnée
    }
    
    const newSelected = [...selectedCommunes, commune];
    setSelectedCommunes(newSelected);
    onChange({
      ...value,
      communes: newSelected.map(c => c.id)
    });
    
    setCommuneSearch('');
    setShowCommuneResults(false);
  };

  // Suppression d'une commune sélectionnée
  const removeCommuneSelection = (commune: Commune) => {
    const newSelected = selectedCommunes.filter(c => c.id !== commune.id);
    setSelectedCommunes(newSelected);
    onChange({
      ...value,
      communes: newSelected.map(c => c.id)
    });
  };

  // Effacer toutes les sélections
  const clearAll = () => {
    setSelectedCountries([]);
    setSelectedRegions([]);
    setSelectedDepartments([]);
    setSelectedCommunes([]);
    onChange({});
  };

  const getTotalSelections = () => {
    return selectedCountries.length + selectedRegions.length + 
           selectedDepartments.length + selectedCommunes.length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Localisation</span>
          {getTotalSelections() > 0 && (
            <Badge variant="secondary" className="text-xs">
              {getTotalSelections()}
            </Badge>
          )}
        </div>
        {getTotalSelections() > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Effacer tout
          </Button>
        )}
      </div>

      {/* Pays */}
      <div className="relative">
        <Button 
          variant="outline" 
          className="w-full justify-between"
          onClick={() => setOpenCountries(!openCountries)}
        >
          <span className="truncate">
            {selectedCountries.length === 0 
              ? 'Sélectionner des pays'
              : selectedCountries.length === 1
              ? selectedCountries[0].name
              : `${selectedCountries.length} pays sélectionnés`
            }
          </span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
        
        {openCountries && (
          <Card className="absolute top-full left-0 right-0 z-10 mt-1">
            <CardContent className="p-2 max-h-64 overflow-auto">
              {countries.map((country) => (
                <div key={country.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded">
                  <Checkbox
                    id={`country-${country.id}`}
                    checked={selectedCountries.some(c => c.id === country.id)}
                    onCheckedChange={(checked) => handleCountryChange(country, checked === true)}
                  />
                  <label
                    htmlFor={`country-${country.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {country.name}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tags des pays sélectionnés */}
        {selectedCountries.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedCountries.map((country) => (
              <Badge key={country.id} variant="secondary" className="flex items-center gap-1">
                {country.name}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => handleCountryChange(country, false)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Régions */}
      <div className="relative">
        <Button 
          variant="outline" 
          className="w-full justify-between"
          onClick={() => setOpenRegions(!openRegions)}
        >
          <span className="truncate">
            {selectedRegions.length === 0 
              ? 'Sélectionner des régions'
              : selectedRegions.length === 1
              ? selectedRegions[0].name
              : `${selectedRegions.length} régions sélectionnées`
            }
          </span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
        
        {openRegions && (
          <Card className="absolute top-full left-0 right-0 z-10 mt-1">
            <CardContent className="p-2 max-h-64 overflow-auto">
              {getFilteredRegions().map((region) => (
                <div key={region.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded">
                  <Checkbox
                    id={`region-${region.id}`}
                    checked={selectedRegions.some(r => r.id === region.id)}
                    onCheckedChange={(checked) => handleRegionChange(region, checked === true)}
                  />
                  <label
                    htmlFor={`region-${region.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {region.name}
                    <span className="text-xs text-muted-foreground block">
                      {region.pays.name}
                    </span>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tags des régions sélectionnées */}
        {selectedRegions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedRegions.map((region) => (
              <Badge key={region.id} variant="secondary" className="flex items-center gap-1">
                {region.name}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => handleRegionChange(region, false)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Départements */}
      <div className="relative">
        <Button 
          variant="outline" 
          className="w-full justify-between"
          onClick={() => setOpenDepartments(!openDepartments)}
        >
          <span className="truncate">
            {selectedDepartments.length === 0 
              ? 'Sélectionner des départements'
              : selectedDepartments.length === 1
              ? selectedDepartments[0].name
              : `${selectedDepartments.length} départements sélectionnés`
            }
          </span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
        
        {openDepartments && (
          <Card className="absolute top-full left-0 right-0 z-10 mt-1">
            <CardContent className="p-2 max-h-64 overflow-auto">
              {getFilteredDepartments().map((department) => (
                <div key={department.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded">
                  <Checkbox
                    id={`dept-${department.id}`}
                    checked={selectedDepartments.some(d => d.id === department.id)}
                    onCheckedChange={(checked) => handleDepartmentChange(department, checked === true)}
                  />
                  <label
                    htmlFor={`dept-${department.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {department.name}
                    <span className="text-xs text-muted-foreground block">
                      {department.region.name}, {department.region.pays.name}
                    </span>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tags des départements sélectionnés */}
        {selectedDepartments.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedDepartments.map((department) => (
              <Badge key={department.id} variant="secondary" className="flex items-center gap-1">
                {department.name}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => handleDepartmentChange(department, false)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Communes */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des communes..."
            value={communeSearch}
            onChange={(e) => {
              setCommuneSearch(e.target.value);
              setShowCommuneResults(e.target.value.length >= 2);
            }}
            onFocus={() => {
              if (communeSearch.length >= 2) {
                setShowCommuneResults(true);
              }
            }}
            className="pl-10"
          />
        </div>
        
        {showCommuneResults && (
          <Card className="absolute top-full left-0 right-0 z-10 mt-1">
            <CardContent className="p-2 max-h-64 overflow-auto">
              {isSearchingCommunes && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Recherche en cours...
                </div>
              )}
              {!isSearchingCommunes && communes.length === 0 && communeSearch.length >= 2 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Aucune commune trouvée
                </div>
              )}
              {!isSearchingCommunes && communes.map((commune) => (
                <div
                  key={commune.id}
                  onClick={() => handleCommuneSelect(commune)}
                  className="p-2 hover:bg-accent rounded cursor-pointer"
                >
                  <div className="font-medium">{commune.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {commune.department.name}, {commune.department.region.name}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tags des communes sélectionnées */}
        {selectedCommunes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedCommunes.map((commune) => (
              <Badge key={commune.id} variant="secondary" className="flex items-center gap-1">
                <span className="truncate max-w-32">{commune.name}</span>
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removeCommuneSelection(commune)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Fermer les dropdowns quand on clique ailleurs */}
      {(openCountries || openRegions || openDepartments || showCommuneResults) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setOpenCountries(false);
            setOpenRegions(false);
            setOpenDepartments(false);
            setShowCommuneResults(false);
          }}
        />
      )}
    </div>
  );
}