import React, { useEffect, useMemo, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import ACTIONS from "../Actions";
import { CODE_SNIPPETS } from "../constants";
import { executeCode } from "../api";

const LANGS = ["javascript", "typescript", "python", "java", "csharp", "php"];

export default function EditorMonaco({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef(null);
  const applyingRemoteRef = useRef(false);

  const [language, setLanguage] = useState("javascript");
  const [value, setValue] = useState(CODE_SNIPPETS.javascript);
  const [outputLines, setOutputLines] = useState(null);
  const [running, setRunning] = useState(false);
  const [isError, setIsError] = useState(false);

  const initialValue = useMemo(() => CODE_SNIPPETS[language] || "", [language]);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  // Local edits -> broadcast to room (like your CodeMirror version)
  const onChange = (nextValue) => {
    const code = nextValue ?? "";
    setValue(code);
    onCodeChange(code);

    if (!socketRef.current) return;
    if (applyingRemoteRef.current) return;

    socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
  };

  // Remote edits -> set Monaco value (avoid echo loop using a flag)
  useEffect(() => {
    if (!socketRef.current) return;

    const handler = ({ code }) => {
      if (code == null) return;
      if (!editorRef.current) return;

      applyingRemoteRef.current = true;
      editorRef.current.setValue(code);
      applyingRemoteRef.current = false;

      setValue(code);
      onCodeChange(code);
    };

    socketRef.current.on(ACTIONS.CODE_CHANGE, handler);
    return () => socketRef.current?.off(ACTIONS.CODE_CHANGE, handler);
  }, [socketRef, onCodeChange]);

  const runCode = async () => {
    const code = editorRef.current?.getValue?.() ?? value;
    if (!code.trim()) return;

    try {
      setRunning(true);
      setOutputLines(null);
      setIsError(false);

      const { run } = await executeCode(language, code);
      const out = (run?.output ?? "").split("\n");
      setOutputLines(out);
      setIsError(Boolean(run?.stderr));
    } catch (e) {
      setIsError(true);
      setOutputLines([e?.message || "Unable to run code"]);
    } finally {
      setRunning(false);
    }
  };

  const onSelectLanguage = (lang) => {
    setLanguage(lang);
    const snippet = CODE_SNIPPETS[lang] || "";
    setValue(snippet);
    onCodeChange(snippet);

    // Optional: broadcast language switch as just code replacement
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code: snippet });
    }
  };

  return (
    <div style={{ display: "flex", gap: 12, height: "100%" }}>
      {/* Left: editor */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <label style={{ color: "white" }}>Language:</label>
          <select value={language} onChange={(e) => onSelectLanguage(e.target.value)}>
            {LANGS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <button className="btn" onClick={runCode} disabled={running}>
            {running ? "Running..." : "Run Code"}
          </button>
        </div>

        <Editor
          height="75vh"
          theme="vs-dark"
          language={language}
          value={value}
          defaultValue={initialValue}
          onMount={onMount}
          onChange={onChange}
          options={{ minimap: { enabled: false }, fontSize: 14 }}
        />
      </div>

      {/* Right: output */}
      <div style={{ width: "40%", minWidth: 320 }}>
        <div style={{ color: "white", marginBottom: 8 }}>Output</div>
        <div
          style={{
            height: "75vh",
            overflow: "auto",
            padding: 10,
            border: "1px solid #333",
            borderRadius: 6,
            color: isError ? "#ff6b6b" : "white",
            background: "#0f0f0f",
            whiteSpace: "pre-wrap",
          }}
        >
          {outputLines
            ? outputLines.map((line, i) => <div key={i}>{line}</div>)
            : 'Click "Run Code" to see the output here'}
        </div>
      </div>
    </div>
  );
}
