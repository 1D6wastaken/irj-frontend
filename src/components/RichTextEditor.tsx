import React, { useState } from 'react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    FileCode,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    List,
    ListOrdered,
    CheckSquare,
    Link as LinkIcon,
    Eye,
    EyeOff
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
    label?: string | React.ReactNode;
    required?: boolean;
}

export function RichTextEditor({
                                   value,
                                   onChange,
                                   placeholder = '',
                                   className = '',
                                   minHeight = '200px',
                                   label,
                                   required = false
                               }: RichTextEditorProps) {
    const [showPreview, setShowPreview] = useState(true);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        const textToInsert = selectedText || placeholder;

        const newValue =
            value.substring(0, start) +
            before +
            textToInsert +
            after +
            value.substring(end);

        onChange(newValue);

        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + before.length + textToInsert.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const insertLineMarkdown = (prefix: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // Find the start of the current line
        const beforeCursor = value.substring(0, start);
        const lineStart = beforeCursor.lastIndexOf('\n') + 1;

        // Find the end of the current line
        const afterCursor = value.substring(end);
        const lineEndOffset = afterCursor.indexOf('\n');
        const lineEnd = lineEndOffset === -1 ? value.length : end + lineEndOffset;

        const lineText = value.substring(lineStart, lineEnd);
        const newLine = prefix + (lineText.startsWith(prefix) ? lineText.substring(prefix.length) : lineText);

        const newValue =
            value.substring(0, lineStart) +
            newLine +
            value.substring(lineEnd);

        onChange(newValue);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length);
        }, 0);
    };

    const toolbarButtons = [
        {
            icon: Bold,
            title: 'Gras (Ctrl+B)',
            action: () => insertMarkdown('**', '**', 'texte en gras')
        },
        {
            icon: Italic,
            title: 'Italique (Ctrl+I)',
            action: () => insertMarkdown('_', '_', 'texte en italique')
        },
        {
            icon: Underline,
            title: 'Souligné',
            action: () => insertMarkdown('<u>', '</u>', 'texte souligné')
        },
        {
            icon: Strikethrough,
            title: 'Barré',
            action: () => insertMarkdown('~', '~', 'texte barré')
        },
        {
            icon: Code,
            title: 'Code inline',
            action: () => insertMarkdown('`', '`', 'code')
        },
        {
            icon: FileCode,
            title: 'Bloc de code',
            action: () => insertMarkdown('\n```\n', '\n```\n', 'code block')
        },
        {
            icon: Heading1,
            title: 'Titre 1',
            action: () => insertLineMarkdown('# ')
        },
        {
            icon: Heading2,
            title: 'Titre 2',
            action: () => insertLineMarkdown('## ')
        },
        {
            icon: Heading3,
            title: 'Titre 3',
            action: () => insertLineMarkdown('### ')
        },
        {
            icon: Quote,
            title: 'Citation',
            action: () => insertLineMarkdown('> ')
        },
        {
            icon: List,
            title: 'Liste à puce',
            action: () => insertLineMarkdown('- ')
        },
        {
            icon: ListOrdered,
            title: 'Liste numérotée',
            action: () => insertLineMarkdown('1. ')
        },
        {
            icon: CheckSquare,
            title: 'Case à cocher',
            action: () => insertLineMarkdown('- [ ] ')
        },
        {
            icon: LinkIcon,
            title: 'Lien',
            action: () => insertMarkdown('[', '](url)', 'texte du lien')
        }
    ];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'b') {
                e.preventDefault();
                insertMarkdown('**', '**', 'texte en gras');
            } else if (e.key === 'i') {
                e.preventDefault();
                insertMarkdown('_', '_', 'texte en italique');
            }
        }

        // Handle tab key for code indentation
        if (e.key === 'Tab') {
            e.preventDefault();
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            const newValue = value.substring(0, start) + '  ' + value.substring(end);
            onChange(newValue);

            setTimeout(() => {
                textarea.setSelectionRange(start + 2, start + 2);
            }, 0);
        }
    };

    return (
        <div className={`flex flex-col ${className}`}>
            {label && (
                <label className="block mb-2 font-medium">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
                    {toolbarButtons.map((button, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={button.action}
                            title={button.title}
                            className="p-2 hover:bg-gray-200 rounded transition-colors"
                        >
                            <button.icon className="w-4 h-4 text-gray-700" />
                        </button>
                    ))}

                    <div className="ml-auto">
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            title={showPreview ? 'Masquer l\'aperçu' : 'Afficher l\'aperçu'}
                            className="p-2 hover:bg-gray-200 rounded transition-colors"
                        >
                            {showPreview ? (
                                <EyeOff className="w-4 h-4 text-gray-700" />
                            ) : (
                                <Eye className="w-4 h-4 text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Editor/Preview */}
                <div className="flex">
                    {/* Editor */}
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className={`p-4 focus:outline-none resize-none font-mono text-sm ${showPreview ? 'w-1/2 border-r border-gray-300' : 'w-full'}`}
                        style={{ minHeight }}
                    />

                    {/* Preview */}
                    {showPreview && (
                        <div
                            className="w-1/2 p-4 overflow-auto prose prose-sm max-w-none bg-gray-50"
                            style={{ minHeight }}
                        >
                            <ReactMarkdown
                                components={{
                                    // Custom rendering for underline tags
                                    u: ({ children }) => <u>{children}</u>,
                                    // Custom rendering for strikethrough
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
                                    // Style headings
                                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
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
                                    // Style links
                                    a: ({ href, children }) => (
                                        <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                            {children}
                                        </a>
                                    ),
                                    // Style paragraphs
                                    p: ({ children }) => <p className="my-2">{children}</p>
                                }}
                            >
                                {value || '*Aucun contenu à prévisualiser*'}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}