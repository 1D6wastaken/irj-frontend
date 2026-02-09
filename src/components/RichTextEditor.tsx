import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Code,
    FileCode,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    List,
    ListOrdered,
    Link as LinkIcon,
    Undo,
    Redo,
    X
} from 'lucide-react';

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
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [selectedText, setSelectedText] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3]
                }
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 hover:underline cursor-pointer'
                }
            })
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'tiptap-editor-content focus:outline-none p-4',
                style: `min-height: ${minHeight}`
            }
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        }
    }, []); // Tableau de dépendances vide pour éviter les réinitialisations

    // Synchroniser le contenu quand value change de l'extérieur
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    const addLink = () => {
        // Si un lien existe déjà, le retirer
        if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
            return;
        }

        // Récupérer le texte sélectionné
        const { from, to } = editor.state.selection;
        const selected = editor.state.doc.textBetween(from, to, '');

        setSelectedText(selected);
        setLinkUrl('https://');
        setLinkText('');
        setShowLinkDialog(true);
    };

    const handleInsertLink = () => {
        if (!linkUrl || linkUrl === 'https://' || linkUrl.trim() === '') {
            return;
        }

        // Si du texte est sélectionné, créer un lien dessus
        if (selectedText && selectedText.trim() !== '') {
            editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href: linkUrl })
                .run();
        } else {
            // Si rien n'est sélectionné, insérer le texte avec le lien
            if (linkText && linkText.trim() !== '') {
                editor
                    .chain()
                    .focus()
                    .insertContent(`<a href="${linkUrl}">${linkText}</a> `)
                    .run();
            }
        }

        // Réinitialiser et fermer le dialogue
        setShowLinkDialog(false);
        setLinkUrl('');
        setLinkText('');
        setSelectedText('');
    };

    const handleCancelLink = () => {
        setShowLinkDialog(false);
        setLinkUrl('');
        setLinkText('');
        setSelectedText('');
        editor.chain().focus().run();
    };

    const toolbarButtons = [
        {
            icon: Bold,
            title: 'Gras (Ctrl+B)',
            action: () => editor.chain().focus().toggleBold().run(),
            isActive: editor.isActive('bold')
        },
        {
            icon: Italic,
            title: 'Italique (Ctrl+I)',
            action: () => editor.chain().focus().toggleItalic().run(),
            isActive: editor.isActive('italic')
        },
        {
            icon: UnderlineIcon,
            title: 'Souligné (Ctrl+U)',
            action: () => editor.chain().focus().toggleUnderline().run(),
            isActive: editor.isActive('underline')
        },
        {
            icon: Strikethrough,
            title: 'Barré',
            action: () => editor.chain().focus().toggleStrike().run(),
            isActive: editor.isActive('strike')
        },
        {
            icon: Code,
            title: 'Code inline',
            action: () => editor.chain().focus().toggleCode().run(),
            isActive: editor.isActive('code')
        },
        {
            icon: FileCode,
            title: 'Bloc de code',
            action: () => editor.chain().focus().toggleCodeBlock().run(),
            isActive: editor.isActive('codeBlock')
        },
        { divider: true },
        {
            icon: Heading1,
            title: 'Titre 1',
            action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            isActive: editor.isActive('heading', { level: 1 })
        },
        {
            icon: Heading2,
            title: 'Titre 2',
            action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            isActive: editor.isActive('heading', { level: 2 })
        },
        {
            icon: Heading3,
            title: 'Titre 3',
            action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            isActive: editor.isActive('heading', { level: 3 })
        },
        { divider: true },
        {
            icon: Quote,
            title: 'Citation',
            action: () => editor.chain().focus().toggleBlockquote().run(),
            isActive: editor.isActive('blockquote')
        },
        {
            icon: List,
            title: 'Liste à puce',
            action: () => editor.chain().focus().toggleBulletList().run(),
            isActive: editor.isActive('bulletList')
        },
        {
            icon: ListOrdered,
            title: 'Liste numérotée',
            action: () => editor.chain().focus().toggleOrderedList().run(),
            isActive: editor.isActive('orderedList')
        },
        { divider: true },
        {
            icon: LinkIcon,
            title: 'Lien',
            action: addLink,
            isActive: editor.isActive('link')
        },
        { divider: true },
        {
            icon: Undo,
            title: 'Annuler (Ctrl+Z)',
            action: () => editor.chain().focus().undo().run(),
            isActive: false
        },
        {
            icon: Redo,
            title: 'Rétablir (Ctrl+Shift+Z)',
            action: () => editor.chain().focus().redo().run(),
            isActive: false
        }
    ];

    return (
        <div className={`flex flex-col ${className}`}>
            {/* Styles CSS scopés uniquement pour cet éditeur */}
            <style>{`
        .tiptap-editor-content h1 {
          font-size: 2em !important;
          font-weight: bold !important;
          margin-top: 0.67em !important;
          margin-bottom: 0.67em !important;
          line-height: 1.2 !important;
        }

        .tiptap-editor-content h2 {
          font-size: 1.5em !important;
          font-weight: bold !important;
          margin-top: 0.75em !important;
          margin-bottom: 0.75em !important;
          line-height: 1.3 !important;
        }

        .tiptap-editor-content h3 {
          font-size: 1.17em !important;
          font-weight: bold !important;
          margin-top: 0.83em !important;
          margin-bottom: 0.83em !important;
          line-height: 1.4 !important;
        }

        .tiptap-editor-content ul {
          list-style-type: disc !important;
          padding-left: 1.5em !important;
          margin: 1em 0 !important;
        }

        .tiptap-editor-content ol {
          list-style-type: decimal !important;
          padding-left: 1.5em !important;
          margin: 1em 0 !important;
        }

        .tiptap-editor-content li {
          margin: 0.25em 0 !important;
        }

        .tiptap-editor-content ul ul,
        .tiptap-editor-content ol ol,
        .tiptap-editor-content ul ol,
        .tiptap-editor-content ol ul {
          margin: 0.25em 0 !important;
        }

        .tiptap-editor-content blockquote {
          border-left: 4px solid #d1d5db !important;
          padding-left: 1em !important;
          margin: 1em 0 !important;
          font-style: italic !important;
          color: #6b7280 !important;
        }

        .tiptap-editor-content code {
          background-color: #f3f4f6 !important;
          padding: 0.125em 0.25em !important;
          border-radius: 0.25em !important;
          font-family: 'Courier New', Courier, monospace !important;
          font-size: 0.875em !important;
        }

        .tiptap-editor-content pre {
          background-color: #f3f4f6 !important;
          padding: 1em !important;
          border-radius: 0.5em !important;
          overflow-x: auto !important;
          margin: 1em 0 !important;
        }

        .tiptap-editor-content pre code {
          background-color: transparent !important;
          padding: 0 !important;
          font-size: 0.875em !important;
        }

        .tiptap-editor-content a {
          color: #2563eb !important;
          text-decoration: underline !important;
          cursor: pointer !important;
        }

        .tiptap-editor-content a:hover {
          color: #1d4ed8 !important;
        }

        .tiptap-editor-content strong {
          font-weight: bold !important;
        }

        .tiptap-editor-content em {
          font-style: italic !important;
        }

        .tiptap-editor-content u {
          text-decoration: underline !important;
        }

        .tiptap-editor-content s {
          text-decoration: line-through !important;
        }

        .tiptap-editor-content p {
          margin: 0.5em 0 !important;
        }

        .tiptap-editor-content p:first-child {
          margin-top: 0 !important;
        }

        .tiptap-editor-content p:last-child {
          margin-bottom: 0 !important;
        }

        .tiptap-editor-content p.is-editor-empty:first-child::before {
          color: #adb5bd !important;
          content: attr(data-placeholder) !important;
          float: left !important;
          height: 0 !important;
          pointer-events: none !important;
        }
      `}</style>

            {label && (
                <label className="block mb-2 font-medium">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
                    {toolbarButtons.map((button, index) => {
                        if ('divider' in button) {
                            return (
                                <div key={`divider-${index}`} className="w-px h-6 bg-gray-300 mx-1" />
                            );
                        }

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={button.action}
                                title={button.title}
                                className={`p-2 hover:bg-gray-200 rounded transition-colors ${
                                    button.isActive ? 'bg-gray-300' : ''
                                }`}
                            >
                                <button.icon className="w-4 h-4 text-gray-700" />
                            </button>
                        );
                    })}
                </div>

                {/* Editor */}
                <EditorContent
                    editor={editor}
                    placeholder={placeholder}
                />
            </div>

            {/* Helper text */}
            <div className="mt-2 text-xs text-gray-500">
                Éditeur de texte enrichi. Utilisez la barre d'outils ou les raccourcis clavier (Ctrl+B, Ctrl+I, etc.).
            </div>

            {/* Link dialog */}
            {showLinkDialog && (
                <div
                    className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
                    onClick={handleCancelLink}
                >
                    <div
                        className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Ajouter un lien</h3>
                            <button
                                type="button"
                                className="text-gray-500 hover:text-gray-700"
                                onClick={handleCancelLink}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {selectedText && selectedText.trim() !== '' && (
                            <div className="mb-4 p-3 bg-gray-100 rounded">
                                <span className="text-sm text-gray-600">Texte sélectionné : </span>
                                <span className="text-sm font-medium">{selectedText}</span>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL du lien <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://exemple.com"
                                autoFocus
                            />
                        </div>

                        {(!selectedText || selectedText.trim() === '') && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Texte du lien <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={linkText}
                                    onChange={(e) => setLinkText(e.target.value)}
                                    placeholder="Texte à afficher"
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                onClick={handleCancelLink}
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                onClick={handleInsertLink}
                                disabled={
                                    !linkUrl ||
                                    linkUrl === 'https://' ||
                                    linkUrl.trim() === '' ||
                                    ((!selectedText || selectedText.trim() === '') && (!linkText || linkText.trim() === ''))
                                }
                            >
                                Insérer le lien
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}