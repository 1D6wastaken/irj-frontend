import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

interface HtmlContentProps {
    content: string;
    className?: string;
}

/**
 * Composant pour afficher du contenu avec support HTML, Markdown et codes d'échappement
 * Utilisé pour les champs de texte provenant de l'API et du RichTextEditor
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
            /_[^_\s][^_]*_/m.test(processed) || // Italique _texte_
            /~[^~\s][^~]*~/m.test(processed) || // Barré ~texte~
            /`[^`]+`/m.test(processed) || // Code inline `code`
            /^#{1,6}\s/m.test(processed) || // Titres # ## ###
            /```/m.test(processed) || // Blocs de code
            /\[.+\]\(.+\)/m.test(processed) || // Liens [texte](url)
            /^\s*[-*+]\s+\S/m.test(processed) || // Listes à puces
            /^\s*\d+\.\s+\S/m.test(processed) || // Listes numérotées
            /^\s*>\s+/m.test(processed) || // Citations
            /^\s*-\s+\[\s*[xX\s]?\s*\]\s+/m.test(processed) // Checkboxes
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
            <div className={`html-content prose prose-sm max-w-none ${className}`}>
                <ReactMarkdown
                    components={{
                        // Custom rendering for underline tags
                        u: ({ children }) => <u>{children}</u>,
                        // Custom rendering for strikethrough with tilde
                        del: ({ children }) => <span className="line-through">{children}</span>,
                        // Handle checkboxes
                        input: (props) => (
                            <input
                                type="checkbox"
                                checked={props.checked}
                                disabled
                                className="mr-2"
                            />
                        ),
                        // Personnalisation des liens
                        a: ({ href, children }) => (
                            <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                {children}
                            </a>
                        ),
                        // Style headings
                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>,
                        // Style quotes
                        blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
                                {children}
                            </blockquote>
                        ),
                        // Style code blocks (pre contient code)
                        pre: ({ children }) => (
                            <pre className="bg-gray-100 p-4 rounded my-4 overflow-x-auto">
                                {children}
                            </pre>
                        ),
                        // Style code inline et code dans pre
                        code: ({ children, className }) => {
                            // Si le code a une className, c'est probablement dans un bloc de code
                            const isCodeBlock = className && className.includes('language-');

                            if (isCodeBlock) {
                                return <code className="font-mono text-sm">{children}</code>;
                            }

                            // Code inline
                            return (
                                <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
                                    {children}
                                </code>
                            );
                        },
                        // Style lists
                        ul: ({ children }) => <ul className="list-disc list-inside my-4">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside my-4">{children}</ol>,
                        li: ({ children }) => <li className="my-1">{children}</li>,
                        // Style paragraphs
                        p: ({ children }) => <p className="my-2">{children}</p>
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