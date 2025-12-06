/**
 * SearchableSelect - Composant de sélection unique avec recherche intégrée
 *
 * Utilise les composants shadcn Command et Popover pour créer une liste déroulante
 * avec fonctionnalité de recherche textuelle intégrée (sélection unique).
 *
 * @example
 * ```tsx
 * const [selectedCountry, setSelectedCountry] = useState<string>('');
 *
 * <SearchableSelect
 *   options={[
 *     { id: '1', name: 'France' },
 *     { id: '2', name: 'Espagne', description: 'País europeo' },
 *   ]}
 *   selectedValue={selectedCountry}
 *   onChange={setSelectedCountry}
 *   placeholder="Sélectionner un pays"
 *   searchPlaceholder="Rechercher un pays..."
 *   emptyMessage="Aucun pays trouvé"
 * />
 * ```
 */

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "./ui/button";
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

interface SearchableSelectProps {
    options: SelectOption[];
    selectedValue: string; // ID sélectionné
    onChange: (selectedId: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    onClear?: () => void; // Fonction optionnelle pour effacer la sélection
}

export function SearchableSelect({
                                     options,
                                     selectedValue,
                                     onChange,
                                     placeholder = "Sélectionner...",
                                     searchPlaceholder = "Rechercher...",
                                     emptyMessage = "Aucun résultat",
                                     disabled = false,
                                 }: SearchableSelectProps) {
    const [open, setOpen] = useState(false);

    // Obtenir l'option sélectionnée
    const selectedOption = options.find(opt => opt.id === selectedValue);

    const handleSelect = (optionId: string) => {
        onChange(optionId);
        setOpen(false);
    };

    const getButtonText = () => {
        if (selectedOption) {
            return selectedOption.name;
        }
        return placeholder;
    };

    return (
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
                    />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = selectedValue === option.id;
                                // Créer une valeur unique pour la recherche
                                const uniqueValue = `${option.id}-${option.name}`;
                                return (
                                    <CommandItem
                                        key={option.id}
                                        value={uniqueValue}
                                        keywords={[option.name, option.description || '']}
                                        onSelect={() => handleSelect(option.id)}
                                        className={`cursor-pointer ${
                                            isSelected
                                                ? 'bg-accent/50 border-l-2 border-l-primary font-medium'
                                                : ''
                                        }`}
                                    >
                                        <Check
                                            className={`mr-2 h-4 w-4 ${
                                                isSelected ? "opacity-100" : "opacity-0"
                                            }`}
                                        />
                                        <div className="flex-1">
                                            <div className={isSelected ? 'font-medium' : ''}>{option.name}</div>
                                            {option.description && (
                                                <div className="text-xs text-muted-foreground">{option.description}</div>
                                            )}
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
