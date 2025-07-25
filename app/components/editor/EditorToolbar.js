'use client';

import { 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code, Link, Image, Table, Undo, Redo, Type, Palette,
  Subscript, Superscript, Indent, Outdent, Copy, Cut, Paste, Save, Download,
  Eye, EyeOff, Maximize, Minimize, RotateCcw, Search, Replace, Hash, Minus, Settings
} from 'lucide-react';
import { useState } from 'react';

const EditorToolbar = ({ 
  enabledFunctions,
  setEnabledFunctions,
  executeCommand,
  insertTable,
  insertLink, 
  insertImage, 
  fileInputRef,
  fontSize, 
  setFontSize, 
  fontFamily, 
  setFontFamily,
  textColor, 
  setTextColor, 
  backgroundColor, 
  setBackgroundColor,
  applyFontSize, 
  applyFontFamily, 
  applyTextColor, 
  applyBackgroundColor,
  saveContent, 
  copyToClipboard, 
  clearContent,
  showHtml,
  setShowHtml,
  isFullscreen,
  setIsFullscreen,
  showFindReplace,
  setShowFindReplace,
  activeFormats,
  checkFormatState
}) => {
  const [showSettings, setShowSettings] = useState(false);
  
  const toolbarButtons = [
    { key: 'bold', icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
    { key: 'italic', icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
    { key: 'underline', icon: Underline, command: 'underline', title: 'Underline (Ctrl+U)' },
    { key: 'strikethrough', icon: Strikethrough, command: 'strikeThrough', title: 'Strikethrough' },
    { key: 'subscript', icon: Subscript, command: 'subscript', title: 'Subscript' },
    { key: 'superscript', icon: Superscript, command: 'superscript', title: 'Superscript' },
  ];

  const alignmentButtons = [
    { key: 'alignLeft', icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { key: 'alignCenter', icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { key: 'alignRight', icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
    { key: 'alignJustify', icon: AlignJustify, command: 'justifyFull', title: 'Justify' },
  ];

  const listButtons = [
    { key: 'bulletList', icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { key: 'numberedList', icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { key: 'indent', icon: Indent, command: 'indent', title: 'Indent' },
    { key: 'outdent', icon: Outdent, command: 'outdent', title: 'Outdent' },
  ];

  const insertHeading = (level) => {
    executeCommand('formatBlock', `h${level}`);
  };

  const insertParagraph = () => {
    executeCommand('formatBlock', 'p');
  };

  const insertCodeBlock = () => {
    executeCommand('formatBlock', 'pre');
  };

  const handleExecuteCommand = (command) => {
    executeCommand(command);
    // Check format state after command execution
    setTimeout(checkFormatState, 10);
  };

  const toggleFunction = (functionKey) => {
    setEnabledFunctions(prev => ({
      ...prev,
      [functionKey]: !prev[functionKey]
    }));
  };

  const renderButton = (button, isActive = false) => {
    const { key, icon: Icon, command, title } = button;
    return (
      <button
        key={command}
        onClick={() => handleExecuteCommand(command)}
        className={`p-2 rounded transition-colors ${
          isActive 
            ? 'bg-blue-500 text-white' 
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
        }`}
        title={title}
      >
        <Icon size={16} />
      </button>
    );
  };

  const renderSeparator = () => (
    <div className="w-px h-6 bg-gray-300 mx-1"></div>
  );

  return (
    <div className="bg-gray-50 px-3 py-3 border-b border-gray-200 rounded-t-lg">
      {/* Header Controls */}
      {enabledFunctions.headerShow && <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-semibold text-gray-800">Text Editor</h3>
        <div className="flex items-center space-x-2">
          {enabledFunctions.settings && <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
              title="Toolbar Settings"
          >
            <Settings size={16}/>
          </button>}
          {enabledFunctions.findReplace && <button
              onClick={() => setShowFindReplace(!showFindReplace)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
              title="Find & Replace"
          >
            <Search size={16}/>
          </button>}
          {enabledFunctions.showHtml && <button
              onClick={() => setShowHtml(!showHtml)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
              title="Toggle HTML View"
          >
            {showHtml ? <EyeOff size={16}/> : <Eye size={16}/>}
          </button>}
          {enabledFunctions.fullScreen && <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
              title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={16}/> : <Maximize size={16}/>}
          </button>}
        </div>
      </div>}

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border border-gray-200 rounded p-4 mb-3">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Toolbar Functions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
            {Object.entries(enabledFunctions).map(([key, enabled]) => (
              <label key={key} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => toggleFunction(key)}
                  className="rounded"
                />
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={() => setEnabledFunctions(Object.fromEntries(Object.keys(enabledFunctions).map(key => [key, true])))}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Enable All
            </button>
            <button
              onClick={() => setEnabledFunctions(Object.fromEntries(Object.keys(enabledFunctions).map(key => [key, false])))}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Disable All
            </button>
          </div>
        </div>
      )}

      {/* Main Toolbar - Wrap Mode */}
      <div className="flex flex-wrap items-center gap-1">
        {/* Block Elements */}
        {enabledFunctions.headings && (
          <>
            <select
              onChange={(e) => {
                if (e.target.value.startsWith('h')) {
                  insertHeading(e.target.value.slice(1));
                } else if (e.target.value === 'p') {
                  insertParagraph();
                } else if (e.target.value === 'pre') {
                  insertCodeBlock();
                }
                setTimeout(checkFormatState, 10);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
              defaultValue=""
            >
              <option value="" disabled>Format</option>
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="h5">Heading 5</option>
              <option value="h6">Heading 6</option>
              <option value="pre">Code Block</option>
            </select>
            {renderSeparator()}
          </>
        )}

        {/* Text Formatting */}
        {toolbarButtons.filter(btn => enabledFunctions[btn.key]).map(button => 
          renderButton(button, activeFormats[button.command])
        )}
        
        {(toolbarButtons.some(btn => enabledFunctions[btn.key]) && 
          (alignmentButtons.some(btn => enabledFunctions[btn.key]) || listButtons.some(btn => enabledFunctions[btn.key]))) && 
          renderSeparator()}
        
        {/* Alignment */}
        {alignmentButtons.filter(btn => enabledFunctions[btn.key]).map(button => 
          renderButton(button, activeFormats[button.command])
        )}
        
        {(alignmentButtons.some(btn => enabledFunctions[btn.key]) && listButtons.some(btn => enabledFunctions[btn.key])) && 
          renderSeparator()}
        
        {/* Lists and Indentation */}
        {listButtons.filter(btn => enabledFunctions[btn.key]).map(button => 
          renderButton(button, activeFormats[button.command])
        )}

        {listButtons.some(btn => enabledFunctions[btn.key]) && renderSeparator()}

        {/* Block Elements */}
        {enabledFunctions.horizontalRule && (
          <button
            onClick={() => {
              executeCommand('insertHorizontalRule');
              setTimeout(checkFormatState, 10);
            }}
            className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Insert Horizontal Rule"
          >
            <Minus size={14} />
            <span>HR</span>
          </button>
        )}
        
        {enabledFunctions.blockquote && (
          <button
            onClick={() => {
              executeCommand('formatBlock', 'blockquote');
              setTimeout(checkFormatState, 10);
            }}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Blockquote"
          >
            <Quote size={16} />
          </button>
        )}

        {(enabledFunctions.horizontalRule || enabledFunctions.blockquote) && renderSeparator()}

        {/* Media and Links */}
        {enabledFunctions.link && (
          <button
            onClick={insertLink}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Insert Link"
          >
            <Link size={16} />
          </button>
        )}
        
        {enabledFunctions.image && (
          <button
            onClick={insertImage}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Insert Image URL"
          >
            <Image size={16} />
          </button>
        )}
        
        {enabledFunctions.upload && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Upload Image File"
          >
            Upload
          </button>
        )}
        
        {enabledFunctions.table && (
          <button
            onClick={insertTable}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Insert Table"
          >
            <Table size={16} />
          </button>
        )}
        
        {(enabledFunctions.link || enabledFunctions.image || enabledFunctions.upload || enabledFunctions.table) && renderSeparator()}
        
        {/* History */}
        {enabledFunctions.undo && (
          <button
            onClick={() => handleExecuteCommand('undo')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={16} />
          </button>
        )}
        
        {enabledFunctions.redo && (
          <button
            onClick={() => handleExecuteCommand('redo')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo size={16} />
          </button>
        )}
        
        {enabledFunctions.clearAll && (
          <button
            onClick={clearContent}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Clear All Content"
          >
            <RotateCcw size={16} />
          </button>
        )}

        {enabledFunctions.clearFormat && (
          <button
            onClick={() => handleExecuteCommand('removeFormat')}
            className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Remove Formatting"
          >
            Clear Format
          </button>
        )}

        {(enabledFunctions.undo || enabledFunctions.redo || enabledFunctions.clearAll || enabledFunctions.clearFormat) && renderSeparator()}

        {/* Styling Options */}
        {enabledFunctions.fontFamily && (
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            onBlur={applyFontFamily}
            className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
            <option value="Courier New">Courier New</option>
            <option value="Impact">Impact</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
            <option value="Palatino">Palatino</option>
          </select>
        )}
        
        {enabledFunctions.fontSize && (
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            onBlur={applyFontSize}
            className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
          >
            <option value="8">8px</option>
            <option value="10">10px</option>
            <option value="12">12px</option>
            <option value="14">14px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
            <option value="20">20px</option>
            <option value="24">24px</option>
            <option value="28">28px</option>
            <option value="32">32px</option>
            <option value="36">36px</option>
            <option value="48">48px</option>
            <option value="64">64px</option>
            <option value="72">72px</option>
          </select>
        )}
        
        {enabledFunctions.textColor && (
          <div className="flex items-center space-x-1">
            <label className="text-xs text-gray-600">Text:</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              onBlur={applyTextColor}
              className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
              title="Text Color"
            />
          </div>
        )}
        
        {enabledFunctions.backgroundColor && (
          <div className="flex items-center space-x-1">
            <label className="text-xs text-gray-600">BG:</label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              onBlur={applyBackgroundColor}
              className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
              title="Background Color"
            />
          </div>
        )}
        
        {(enabledFunctions.fontFamily || enabledFunctions.fontSize || enabledFunctions.textColor || enabledFunctions.backgroundColor) && renderSeparator()}
        
        {/* Export */}
        {enabledFunctions.saveHtml && (
          <button
            onClick={saveContent}
            className="flex items-center space-x-1 px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
            title="Save as HTML File"
          >
            <Save size={14} />
            <span>Save</span>
          </button>
        )}
        
        {enabledFunctions.copyHtml && (
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
            title="Copy HTML to Clipboard"
          >
            <Copy size={14} />
            <span>Copy</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default EditorToolbar;

