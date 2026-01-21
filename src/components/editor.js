import React, { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import ACTIONS from "../Actions";

const EditorComponent = ({ socketRef, roomId, onCodeChange, language }) => {
    const editorRef = useRef(null);

    function handleEditorDidMount(editor) {
        editorRef.current = editor;
        editor.focus();

        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null && code !== editor.getValue()) {
                    editor.setValue(code);
                }
            });
        }
    }

    function handleEditorChange(value) {
        onCodeChange(value);
        if (socketRef.current) {
            socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                roomId,
                code: value,
            });
        }
    }

    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.off(ACTIONS.CODE_CHANGE);
            }
        };
    }, [socketRef.current]);

    return (
        <div className="monacoContainer">
            <Editor
                height="75vh" // Reduced height to allow the output box to sit at the bottom
                width="100%"
                theme="vs-dark"
                language={language} // Uses the dynamic language passed from EditorPage
                value={undefined} // Allows the editor to be uncontrolled for smoother sync
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                    fontSize: 18,
                    minimap: { enabled: true },
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    padding: { top: 20 },
                    // Extra professional IDE features
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: "on",
                    folding: true,
                }}
            />
        </div>
    );
};

export default EditorComponent;