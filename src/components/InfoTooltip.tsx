import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface InfoTooltipProps {
    content: string;
    side?: "top" | "right" | "bottom" | "left";
}

export function InfoTooltip({ content, side = "right" }: InfoTooltipProps) {
    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center w-4 h-4 ml-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Plus d'informations"
                    >
                        <Info className="w-4 h-4" />
                    </button>
                </TooltipTrigger>
                <TooltipContent side={side} className="max-w-xs">
                    <p>{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
