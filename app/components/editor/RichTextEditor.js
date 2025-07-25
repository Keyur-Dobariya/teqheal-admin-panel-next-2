'use client';

import {useState, useRef, useEffect, useCallback} from 'react';
import {Search, Replace} from 'lucide-react';
import EditorToolbar from './EditorToolbar';
import {Send} from "../../utils/icons";
import {SendOutlined} from "@ant-design/icons";
import {Button} from "antd";

const RichTextEditor = ({customEnabledFunctions, isShowSendButton = true, onContentChange}) => {
    const [content, setContent] = useState('');
    const [htmlOutput, setHtmlOutput] = useState('');
    const [showHtml, setShowHtml] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fontSize, setFontSize] = useState('16');
    const [fontFamily, setFontFamily] = useState('Arial');
    const [textColor, setTextColor] = useState('#000000');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [showFindReplace, setShowFindReplace] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [activeFormats, setActiveFormats] = useState({});

    const [enabledFunctions, setEnabledFunctions] = useState({
        // Header
        headerShow: true,
        showStatusBar: true,
        settings: true,
        findReplace: true,
        showHtml: true,
        fullScreen: true,

        // Text formatting
        bold: true,
        italic: true,
        underline: true,
        strikethrough: true,
        subscript: true,
        superscript: true,

        // Alignment
        alignLeft: true,
        alignCenter: true,
        alignRight: true,
        alignJustify: true,

        // Lists and indentation
        bulletList: true,
        numberedList: true,
        indent: true,
        outdent: true,

        // Block elements
        headings: true,
        blockquote: true,
        horizontalRule: true,
        codeBlock: true,

        // Media and links
        link: true,
        image: true,
        upload: true,
        table: true,

        // History
        undo: true,
        redo: true,
        clearAll: true,
        clearFormat: true,

        // Styling
        fontFamily: true,
        fontSize: true,
        textColor: true,
        backgroundColor: true,

        // Export
        saveHtml: true,
        copyHtml: true
    });

    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (customEnabledFunctions) {
            setEnabledFunctions((prevState) => ({
                ...prevState,
                ...customEnabledFunctions,
            }));
        }
    }, [customEnabledFunctions]);

    // Check which formatting options are currently active
    const checkFormatState = useCallback(() => {
        if (!editorRef.current) return;

        const formats = {
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            strikeThrough: document.queryCommandState('strikeThrough'),
            subscript: document.queryCommandState('subscript'),
            superscript: document.queryCommandState('superscript'),
            justifyLeft: document.queryCommandState('justifyLeft'),
            justifyCenter: document.queryCommandState('justifyCenter'),
            justifyRight: document.queryCommandState('justifyRight'),
            justifyFull: document.queryCommandState('justifyFull'),
            insertUnorderedList: document.queryCommandState('insertUnorderedList'),
            insertOrderedList: document.queryCommandState('insertOrderedList'),
        };

        setActiveFormats(formats);
    }, []);

    // Update HTML output and word count
    useEffect(() => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML.trim();
            setHtmlOutput(html);

            // Calculate word and character count
            const text = editorRef.current.innerText || '';
            const words = text.trim() ? text.trim().split(/\s+/).length : 0;
            const chars = text.length;
            setWordCount(words);
            setCharCount(chars);
        }
    }, [content]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'b':
                        e.preventDefault();
                        executeCommand('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        executeCommand('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        executeCommand('underline');
                        break;
                    case 'z':
                        if (e.shiftKey) {
                            e.preventDefault();
                            executeCommand('redo');
                        } else {
                            e.preventDefault();
                            executeCommand('undo');
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        executeCommand('redo');
                        break;
                    case 's':
                        e.preventDefault();
                        saveContent();
                        break;
                    case 'f':
                        e.preventDefault();
                        setShowFindReplace(!showFindReplace);
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showFindReplace]);

    const executeCommand = useCallback((command, value = null) => {
        // Focus the editor first
        if (editorRef.current) {
            editorRef.current.focus();
        }

        // Special handling for list commands
        if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
            // Check if we're already in a list
            const isInList = document.queryCommandState(command);

            if (isInList) {
                // If already in this type of list, remove it
                document.execCommand(command, false, null);
            } else {
                // If not in this type of list, apply it
                // First remove any existing list formatting
                if (document.queryCommandState('insertUnorderedList')) {
                    document.execCommand('insertUnorderedList', false, null);
                }
                if (document.queryCommandState('insertOrderedList')) {
                    document.execCommand('insertOrderedList', false, null);
                }
                // Then apply the new list format
                document.execCommand(command, false, null);
            }
        } else {
            // Regular command execution
            document.execCommand(command, false, value);
        }

        if (editorRef.current) {
            const content = editorRef.current.innerHTML.trim();
            if (content === '' || content === '<br>') {
                setContent('');
            } else {
                setContent(content);
            }
        }

        // Check format state after command execution
        setTimeout(checkFormatState, 10);
    }, [checkFormatState]);

    const handleContentChange = useCallback(() => {
        if (editorRef.current) {
            const content = editorRef.current.innerHTML.trim();
            if (content === '' || content === '<br>') {
                setContent('');
            } else {
                setContent(content);
            }
        }
        // Check format state when content changes
        setTimeout(checkFormatState, 10);
    }, [checkFormatState]);

    // Add event listeners for selection change and key events
    useEffect(() => {
        const handleSelectionChange = () => {
            checkFormatState();
        };

        const handleKeyUp = () => {
            checkFormatState();
        };

        const handleMouseUp = () => {
            checkFormatState();
        };

        document.addEventListener('selectionchange', handleSelectionChange);

        if (editorRef.current) {
            editorRef.current.addEventListener('keyup', handleKeyUp);
            editorRef.current.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            if (editorRef.current) {
                editorRef.current.removeEventListener('keyup', handleKeyUp);
                editorRef.current.removeEventListener('mouseup', handleMouseUp);
            }
        };
    }, [checkFormatState]);

    const insertTable = useCallback(() => {
        const rows = prompt('Number of rows:', '3');
        const cols = prompt('Number of columns:', '3');
        if (rows && cols && parseInt(rows) > 0 && parseInt(cols) > 0) {
            let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
            for (let i = 0; i < parseInt(rows); i++) {
                tableHTML += '<tr>';
                for (let j = 0; j < parseInt(cols); j++) {
                    tableHTML += '<td style="padding: 8px; border: 1px solid #ccc; min-width: 100px;">Cell</td>';
                }
                tableHTML += '</tr>';
            }
            tableHTML += '</table>';
            executeCommand('insertHTML', tableHTML);
        }
    }, [executeCommand]);

    const insertLink = useCallback(() => {
        const url = prompt('Enter URL:');
        if (url) {
            const text = prompt('Enter link text:', url);
            if (text) {
                executeCommand('insertHTML', `<a href="${url}" target="_blank" style="color: #0066cc; text-decoration: underline;">${text}</a>`);
            }
        }
    }, [executeCommand]);

    const insertImage = useCallback(() => {
        const url = prompt('Enter image URL:');
        if (url) {
            const alt = prompt('Enter alt text (optional):', 'Image');
            executeCommand('insertHTML', `<img src="${url}" alt="${alt || 'Image'}" style="max-width: 100%; height: auto; margin: 5px 0;" />`);
        }
    }, [executeCommand]);

    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                executeCommand('insertHTML', `<img src="${e.target.result}" alt="Uploaded Image" style="max-width: 100%; height: auto; margin: 5px 0;" />`);
            };
            reader.readAsDataURL(file);
        }
        // Reset file input
        event.target.value = '';
    }, [executeCommand]);

    const applyFontSize = useCallback(() => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.style.fontSize = fontSize + 'px';
            try {
                range.surroundContents(span);
            } catch (e) {
                span.appendChild(range.extractContents());
                range.insertNode(span);
            }
            handleContentChange();
        }
    }, [fontSize, handleContentChange]);

    const applyFontFamily = useCallback(() => {
        executeCommand('fontName', fontFamily);
    }, [fontFamily, executeCommand]);

    const applyTextColor = useCallback(() => {
        executeCommand('foreColor', textColor);
    }, [textColor, executeCommand]);

    const applyBackgroundColor = useCallback(() => {
        executeCommand('backColor', backgroundColor);
    }, [backgroundColor, executeCommand]);

    const saveContent = useCallback(() => {
        const cleanHtml = htmlOutput
            .replace(/<div><br><\/div>/g, '<br>')
            .replace(/<div>/g, '<p>')
            .replace(/<\/div>/g, '</p>');

        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rich Text Editor Content</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 10px 0;
        }
        td, th {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        blockquote {
            border-left: 4px solid #ccc;
            margin: 0;
            padding-left: 20px;
            font-style: italic;
        }
        pre {
            background: #f4f4f4;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
${cleanHtml}
</body>
</html>`;

        const blob = new Blob([fullHtml], {type: 'text/html'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'editor-content.html';
        a.click();
        URL.revokeObjectURL(url);
    }, [htmlOutput]);

    const copyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(htmlOutput).then(() => {
            alert('HTML copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = htmlOutput;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('HTML copied to clipboard!');
        });
    }, [htmlOutput]);

    const findAndReplace = useCallback(() => {
        if (findText && editorRef.current) {
            const content = editorRef.current.innerHTML;
            const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            const newContent = content.replace(regex, replaceText);
            editorRef.current.innerHTML = newContent;
            handleContentChange();
            setFindText('');
            setReplaceText('');
        }
    }, [findText, replaceText, handleContentChange]);

    const clearContent = useCallback(() => {
        if (confirm('Are you sure you want to clear all content?')) {
            if (editorRef.current) {
                editorRef.current.innerHTML = '';
                handleContentChange();
            }
        }
    }, [handleContentChange]);

    const formatDocument = useCallback(() => {
        if (editorRef.current) {
            // Basic document formatting
            executeCommand('defaultParagraphSeparator', 'p');
            executeCommand('styleWithCSS', true);
        }
    }, [executeCommand]);

    useEffect(() => {
        formatDocument();
    }, [formatDocument]);

    return (
        <div
            className={`bg-white border border-gray-300 rounded-lg shadow-lg ${isFullscreen ? 'fixed inset-0 z-50' : 'max-w-6xl mx-auto'}`}>
            {/* Toolbar */}
            <EditorToolbar
                enabledFunctions={enabledFunctions}
                setEnabledFunctions={setEnabledFunctions}
                executeCommand={executeCommand}
                insertTable={insertTable}
                insertLink={insertLink}
                insertImage={insertImage}
                fileInputRef={fileInputRef}
                fontSize={fontSize}
                setFontSize={setFontSize}
                fontFamily={fontFamily}
                setFontFamily={setFontFamily}
                textColor={textColor}
                setTextColor={setTextColor}
                backgroundColor={backgroundColor}
                setBackgroundColor={setBackgroundColor}
                applyFontSize={applyFontSize}
                applyFontFamily={applyFontFamily}
                applyTextColor={applyTextColor}
                applyBackgroundColor={applyBackgroundColor}
                saveContent={saveContent}
                copyToClipboard={copyToClipboard}
                clearContent={clearContent}
                showHtml={showHtml}
                setShowHtml={setShowHtml}
                isFullscreen={isFullscreen}
                setIsFullscreen={setIsFullscreen}
                showFindReplace={showFindReplace}
                setShowFindReplace={setShowFindReplace}
                activeFormats={activeFormats}
                checkFormatState={checkFormatState}
            />

            {/* Find & Replace Panel */}
            {showFindReplace && (
                <div className="bg-yellow-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-4 flex-wrap">
                        <input
                            type="text"
                            placeholder="Find text..."
                            value={findText}
                            onChange={(e) => setFindText(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded text-sm flex-1 min-w-32"
                        />
                        <input
                            type="text"
                            placeholder="Replace with..."
                            value={replaceText}
                            onChange={(e) => setReplaceText(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded text-sm flex-1 min-w-32"
                        />
                        <button
                            onClick={findAndReplace}
                            className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                            Replace All
                        </button>
                        <button
                            onClick={() => setShowFindReplace(false)}
                            className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Status Bar */}
            {enabledFunctions.showStatusBar && <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 text-sm text-gray-600 flex flex-col gap-2">
                <div className="flex justify-between items-center space-x-4">
                    <span>Words: {wordCount}</span>
                    <span>Characters: {charCount}</span>
                </div>
                <div className="text-xs text-center">
                    Keyboard shortcuts: Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline), Ctrl+S (Save), Ctrl+F
                    (Find)
                </div>
            </div>}

            {/* Editor Content */}
            <div className="flex" style={{height: isFullscreen ? 'calc(100vh - 280px)' : '100px'}}>
                {/* Editor */}
                <div className={`${showHtml ? 'w-1/2 border-r' : 'w-full'} border-gray-200 relative`}>
                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleContentChange}
                        onPaste={(e) => {
                            // Allow paste but clean up formatting
                            setTimeout(handleContentChange, 10);
                        }}
                        className="w-full h-full outline-none overflow-auto font-normal text-[14px] rounded-b-lg focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                        style={{
                            minHeight: '100%',
                            lineHeight: '1.6',
                            padding: '12px 50px 12px 12px',
                            scrollbarWidth: "none"
                        }}
                        suppressContentEditableWarning={true}
                    />
                    {content === '' && (
                        <div className="absolute font-light text-[14px] top-3 left-3 text-gray-400 pointer-events-none">
                            Start typing your content here...
                        </div>
                    )}
                    {isShowSendButton && <div className="absolute bottom-3 right-3 cursor-pointer" title="Send">
                        <Button size="middle" icon={<SendOutlined/>} onClick={() => {
                            onContentChange(editorRef.current.innerText.trim());
                            setContent('');
                            editorRef.current.innerText = '';
                        }}/>
                    </div>}
                </div>

                {/* HTML Output */}
                {showHtml && (
                    <div className="w-1/2 bg-gray-50 flex flex-col">
                        <div className="p-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-700">HTML Output</h3>
                            <button
                                onClick={copyToClipboard}
                                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                        <textarea
                            value={htmlOutput}
                            readOnly
                            className="flex-1 p-4 text-base bg-gray-50 border-none outline-none resize-none"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default RichTextEditor;

