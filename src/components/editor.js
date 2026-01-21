// import React, { useEffect, useRef } from "react";
// import Editor from "@monaco-editor/react";
// import ACTIONS from "../Actions";

// const EditorComponent = ({ socketRef, roomId, onCodeChange, language }) => {
//     const editorRef = useRef(null);

//     function handleEditorDidMount(editor) {
//         editorRef.current = editor;
//         editor.focus();

//         if (socketRef.current) {
//             socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
//                 if (code !== null && code !== editor.getValue()) {
//                     editor.setValue(code);
//                 }
//             });
//         }
//     }

//     function handleEditorChange(value) {
//         onCodeChange(value);
//         if (socketRef.current) {
//             socketRef.current.emit(ACTIONS.CODE_CHANGE, {
//                 roomId,
//                 code: value,
//             });
//         }
//     }

//     useEffect(() => {
//         return () => {
//             if (socketRef.current) {
//                 socketRef.current.off(ACTIONS.CODE_CHANGE);
//             }
//         };
//     }, [socketRef.current]);

//     return (
//         <div className="monacoContainer">
//             <Editor
//                 height="75vh" // Reduced height to allow the output box to sit at the bottom
//                 width="100%"
//                 theme="vs-dark"
//                 language={language} // Uses the dynamic language passed from EditorPage
//                 value={undefined} // Allows the editor to be uncontrolled for smoother sync
//                 onChange={handleEditorChange}
//                 onMount={handleEditorDidMount}
//                 options={{
//                     fontSize: 18,
//                     minimap: { enabled: true },
//                     automaticLayout: true,
//                     scrollBeyondLastLine: false,
//                     wordWrap: "on",
//                     padding: { top: 20 },
//                     // Extra professional IDE features
//                     suggestOnTriggerCharacters: true,
//                     acceptSuggestionOnEnter: "on",
//                     folding: true,
//                 }}
//             />
//         </div>
//     );
// };

// export default EditorComponent;

import React, { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import ACTIONS from "../Actions";

const EditorComponent = ({ socketRef, roomId, onCodeChange, language, username }) => {
    const editorRef = useRef(null);
    const cursorsRef = useRef({});

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        editor.focus();

        // 1. Listen for local cursor movement
        editor.onDidChangeCursorPosition((e) => {
            if (socketRef.current) {
                socketRef.current.emit(ACTIONS.CURSOR_CHANGE, {
                    roomId,
                    cursor: e.position,
                    username: username || "Anonymous", // Use the prop for the username
                });
            }
        });

        // 2. Setup Socket Listeners
        if (socketRef.current) {
            // Listen for remote cursor movement
            socketRef.current.on(ACTIONS.CURSOR_CHANGE, ({ socketId, cursor, username: remoteUser }) => {
                updateRemoteCursor(editor, monaco, socketId, cursor, remoteUser);
            });

            // Listen for remote code changes
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null && code !== editor.getValue()) {
                    editor.setValue(code);
                }
            });
        }
    }

    // Function to render/move remote cursors using Monaco Content Widgets
    const updateRemoteCursor = (editor, monaco, socketId, position, remoteUser) => {
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
        if (socketRef.current) {
            socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                roomId,
                code: value,
            });
        }
    }

    // Comprehensive Cleanup
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.off(ACTIONS.CODE_CHANGE);
                socketRef.current.off(ACTIONS.CURSOR_CHANGE);
                socketRef.current.off(ACTIONS.OUTPUT_CHANGE);
            }
        };
    }, [socketRef.current]);

    return (
        <div className="monacoContainer">
            <Editor
                height="75vh"
                width="100%"
                theme="vs-dark"
                language={language}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                    fontSize: 18,
                    minimap: { enabled: true },
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    padding: { top: 20 },
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: "on",
                    folding: true,
                }}
            />
        </div>
    );
};

export default EditorComponent;