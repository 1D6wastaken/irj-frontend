/**
 * SearchableMultiSelect - Composant de sélection multiple avec recherche intégrée
 *
 * Utilise les composants shadcn Command et Popover pour créer une liste déroulante
 * avec fonctionnalité de recherche textuelle intégrée.
 *
 * Fonctionnalités :
 * - Recherche en temps réel dans les options
 * - Sélection multiple avec checkmarks
 * - Affichage des éléments sélectionnés en badges
 * - Support pour descriptions secondaires
 * - Personnalisation du rendu des options
 *
 * @example
 * ```tsx
 * const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
 *
 * <SearchableMultiSelect
 *   options={[
 *     { id: '1', name: 'France' },
 *     { id: '2', name: 'Espagne', description: 'País europeo' },
 *   ]}
 *   selectedValues={selectedCountries}
 *   onChange={setSelectedCountries}
 *   placeholder="Sélectionner des pays"
 *   searchPlaceholder="Rechercher un pays..."
 *   emptyMessage="Aucun pays trouvé"
 * />
 * ```
 */

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "./ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./ui/popover";

export interface SelectOption {
    id: string;
    name: string;
    description?: string; // Description optionnelle affichée sous le nom
}

interface SearchableMultiSelectProps {
    options: SelectOption[];
    selectedValues: string[]; // Array d'IDs sélectionnés
    onChange: (selectedIds: string[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    maxDisplayed?: number; // Nombre max de badges affichés avant de résumer
    renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode; // Rendu personnalisé d'une option
    disabled?: boolean;
}

export function SearchableMultiSelect({
                                          options,
                                          selectedValues,
                                          onChange,
                                          placeholder = "Sélectionner...",
                                          searchPlaceholder = "Rechercher...",
                                          emptyMessage = "Aucun résultat",
                                          maxDisplayed = 3,
                                          renderOption,
                                          disabled = false,
                                      }: SearchableMultiSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    // Obtenir les options sélectionnées
    const selectedOptions = options.filter(opt => selectedValues.includes(opt.id));

    const handleSelect = (optionId: string) => {
        const newSelected = selectedValues.includes(optionId)
            ? selectedValues.filter(id => id !== optionId)
            : [...selectedValues, optionId];

        onChange(newSelected);
    };

    const handleRemove = (optionId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        onChange(selectedValues.filter(id => id !== optionId));
    };

    const getButtonText = () => {
        if (selectedOptions.length === 0) {
            return placeholder;
        }
        if (selectedOptions.length === 1) {
            return selectedOptions[0].name;
        }
        return `${selectedOptions.length} sélectionnés`;
    };

    // Rendu par défaut d'une option
    const defaultRenderOption = (option: SelectOption, isSelected: boolean) => (
        <>
            <Check
                className={`mr-2 h-4 w-4 ${
                    isSelected ? "opacity-100" : "opacity-0"
                }`}
            />
            <div className="flex-1">
                <div>{option.name}</div>
                {option.description && (
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                )}
            </div>
        </>
    );

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                        disabled={disabled}
                        name={placeholder}
                    >
                        <span className="truncate">{getButtonText()}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                        <CommandInput
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onValueChange={setSearchValue}
                        />
                        <CommandList>
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => {
                                    const isSelected = selectedValues.includes(option.id);
                                    return (
                                        <CommandItem
                                            key={option.id}
                                            value={option.name}
                                            onSelect={() => handleSelect(option.id)}
                                            className="cursor-pointer"
                                        >
                                            {renderOption
                                                ? renderOption(option, isSelected)
                                                : defaultRenderOption(option, isSelected)
                                            }
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Badges des éléments sélectionnés */}
            {selectedOptions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {selectedOptions.slice(0, maxDisplayed).map((option) => (
                        <Badge
                            key={option.id}
                            variant="secondary"
                            className="flex items-center gap-1"
                        >
                            <span className="truncate max-w-32">{option.name}</span>
                            <X
                                className="w-3 h-3 cursor-pointer hover:text-destructive"
                                onClick={(e) => handleRemove(option.id, e)}
                            />
                        </Badge>
                    ))}
                    {selectedOptions.length > maxDisplayed && (
                        <Badge variant="secondary">
                            +{selectedOptions.length - maxDisplayed} autres
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
