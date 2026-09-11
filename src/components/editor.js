import React, { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import ACTIONS from "../Actions";

const EditorComponent = ({ socketRef, roomId, onCodeChange, language, username, theme }) => {
    const editorRef = useRef(null);
    const cursorsRef = useRef({});
    const monacoRef = useRef(null);
    const isRemoteChange = useRef(false);


    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        monacoRef.current = monaco;
        editor.focus();

        // Custom Theme Definition
        monaco.editor.defineTheme('greyish-black', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { background: '1a1a1a' },
                { token: 'comment', foreground: '75715e' },
            ],
            colors: {
                'editor.background': '#1a1a1a',
                'editorCursor.foreground': '#ffffff',
                'editor.lineHighlightBackground': '#2a2a2a',
                'editorIndentGuide.background': '#333333',
            }
        });
        monaco.editor.setTheme('greyish-black');

        // 1. Local Cursor Movement
        editor.onDidChangeCursorPosition((e) => {
                if (socketRef.current && !isRemoteChange.current) {
                    socketRef.current.emit(ACTIONS.CURSOR_CHANGE, {
                        roomId,
                        cursor: e.position,
                        username: username?.username || "Anonymous",
                    });
            }
        });
    }

    // 2. Setup/Manage Socket Listeners in a dedicated useEffect
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        // Listen for remote code changes
        socket.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (editorRef.current && code !== null) {
                    const currentCode = editorRef.current.getValue();
                    if (code !== currentCode) {
                        const position = editorRef.current.getPosition();
                        isRemoteChange.current = true;
                        editorRef.current.setValue(code);
                        const model = editorRef.current.getModel();
                        const safePosition = model.validatePosition(position);
                        editorRef.current.setPosition(safePosition);
                        isRemoteChange.current = false;
                    }
                }
            });

            socket.on(ACTIONS.CURSOR_CHANGE, ({ socketId, cursor, username }) => {
                if (editorRef.current && monacoRef.current) {
                    updateRemoteCursor(editorRef.current, monacoRef.current, socketId, cursor, username);
                }
            });

        return () => {
            socket.off(ACTIONS.CODE_CHANGE);
            socket.off(ACTIONS.CURSOR_CHANGE);
        };
    }, [socketRef.current]); // Re-run if the socket instance changes

    const updateRemoteCursor = (editor, monaco, socketId, position, remoteUser) => {
        console.log("RENDERING NAME TAG:", remoteUser); // If this is [object Object], the label will be empty
        if (cursorsRef.current[socketId]) {
            editor.removeContentWidget(cursorsRef.current[socketId]);
        }

        const widget = {
            domNode: null,
            getId: () => `cursor-${socketId}`,
            getDomNode: function() {
                if (!this.domNode) {
                    this.domNode = document.createElement('div');
                    this.domNode.className = 'remote-cursor';
                    const label = document.createElement('div');
                    label.className = 'remote-cursor-label';
                    label.innerText = remoteUser;
                    this.domNode.appendChild(label);
                }
                return this.domNode;
            },
            getPosition: () => ({
                position: position,
                preference: [monaco.editor.ContentWidgetPositionPreference.EXACT]
            })
        };

        editor.addContentWidget(widget);
        cursorsRef.current[socketId] = widget;
    };

    function handleEditorChange(value) {
        onCodeChange(value);
        // Only emit if the LOCAL user is the one typing
        if (socketRef.current && editorRef.current?.hasTextFocus() && !isRemoteChange.current) { 
            socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                roomId,
                code: value,
            });
        }
    }

    return (
        <div className="monacoContainer">
            <Editor
                height="75vh"
                width="100%"
                theme={theme}
                language={language}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                    fontSize: 18,
                    minimap: { enabled: true },
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: "on",
                    folding: true,
                }}
            />
        </div>
    );
};

export default EditorComponent;