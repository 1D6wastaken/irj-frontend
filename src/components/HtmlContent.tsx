import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

interface HtmlContentProps {
    content: string;
    className?: string;
}

/**
 * Composant pour afficher du contenu avec support HTML, Markdown et codes d'échappement
 * Utilisé pour les champs de texte provenant de l'API
 */
export function HtmlContent({ content, className = '' }: HtmlContentProps) {
    // Détection et traitement du contenu
    const processedContent = useMemo(() => {
        if (!content) return { type: 'text', content: '', original: '' };

        // Debug: afficher le contenu brut
        if (typeof window !== 'undefined' && window.location.search.includes('debug=html')) {
            console.log('HtmlContent - Contenu original:', {
                raw: content,
                chars: content.split('').map(c => c.charCodeAt(0)),
                hasBackslashN: content.includes('\\n'),
                hasRealNewline: content.includes('\n')
            });
        }

        // Décoder les codes d'échappement (\n, \t, etc.)
        // On gère à la fois les cas où c'est déjà un vrai saut de ligne
        // et les cas où c'est la chaîne littérale \n
        let processed = content
            .replace(/\\n/g, '\n')  // Convertir \n en saut de ligne
            .replace(/\\t/g, '\t')   // Convertir \t en tabulation
            .replace(/\\r/g, '\r');  // Convertir \r en retour chariot

        // Détection du type de contenu
        // Si le contenu contient des balises HTML, on le traite comme du HTML
        const hasHtmlTags = /<[^>]+>/g.test(processed);

        // Si le contenu contient des marqueurs Markdown typiques sans balises HTML
        // On rend la détection plus stricte pour éviter les faux positifs
        const hasMarkdown = !hasHtmlTags && (
            /\*\*[^*]+\*\*/m.test(processed) || // Gras **texte**
            /\*[^*\s][^*]*\*/m.test(processed) || // Italique *texte*
            /^#{1,6}\s/m.test(processed) || // Titres # ## ###
            /```/m.test(processed) || // Blocs de code
            /\[.+\]\(.+\)/m.test(processed) || // Liens [texte](url)
            /^\s*[-*+]\s+\S/m.test(processed) || // Listes à puces
            /^\s*\d+\.\s+\S/m.test(processed) // Listes numérotées
        );

        const detectedType = hasHtmlTags ? 'html' : hasMarkdown ? 'markdown' : 'text';

        if (typeof window !== 'undefined' && window.location.search.includes('debug=html')) {
            console.log('HtmlContent - Après traitement:', {
                type: detectedType,
                processed,
                hasHtmlTags,
                hasMarkdown
            });
        }

        if (hasHtmlTags) {
            return { type: 'html', content: processed, original: content };
        } else if (hasMarkdown) {
            return { type: 'markdown', content: processed, original: content };
        } else {
            // Si ni HTML ni Markdown, on convertit les sauts de ligne en <br />
            return { type: 'text', content: processed, original: content };
        }
    }, [content]);

    if (processedContent.type === 'markdown') {
        return (
            <div className={`html-content ${className}`}>
                <ReactMarkdown
                    components={{
                        // Personnalisation des composants si nécessaire
                        a: ({ node, ...props }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" />
                        ),
                    }}
                >
                    {processedContent.content}
                </ReactMarkdown>
            </div>
        );
    }

    if (processedContent.type === 'html') {
        // Pour le HTML, on doit aussi convertir les sauts de ligne en <br />
        const htmlWithBreaks = processedContent.content.replace(/\n/g, '<br />');
        return (
            <div
                className={`html-content ${className}`}
                dangerouslySetInnerHTML={{ __html: htmlWithBreaks }}
            />
        );
    }

    // Type 'text' - conversion des sauts de ligne en <br />
    const lines = processedContent.content.split('\n');
    return (
        <div className={`html-content ${className}`}>
            {lines.map((line, index) => (
                <React.Fragment key={index}>
                    {line}
                    {index < lines.length - 1 && <br />}
                </React.Fragment>
            ))}
        </div>
    );
}