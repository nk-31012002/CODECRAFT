import React, { useEffect, useRef, useState } from "react";
import Client from "../components/Client";
import Editor from "../components/editor";
import { initSocket } from "../socket";
import ACTIONS from "../Actions";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { supabase } from '../supabaseClient';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();

    const [clients, setClients] = useState([]);
    const [language, setLanguage] = useState("javascript");
    const [output, setOutput] = useState("");
    const [isCompiling, setIsCompiling] = useState(false);
    const [theme, setTheme] = useState("vs-dark"); 

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const init = async () => {

            const {data:{session}} = await supabase.auth.getSession();
            
            let authUsername = location.state?.username;

            let avatarUrl = null;
            if(session){
                const { data: profile, error } = await supabase 
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', session.user.id)
                .single();

                if(!error && profile){
                    authUsername = profile.username;
                    avatarUrl = profile.avatar_url;
                }
            }

            if (!authUsername) {
                // try {
                //     const response = await axios.get('/api/me');
                //     authUsername = response.data.displayName; // Google Name
                // } catch (err) {
                //     toast.error("Please login to join this room");
                //     reactNavigator('/');
                //     return;
                // }
                toast.error("Please login via Google to join this room");
                reactNavigator('/');
                return;
            }
            
            setCurrentUser({ username: authUsername, avatar: avatarUrl });

            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleError(err));
            socketRef.current.on('connect_failed', (err) => handleError(err));

            function handleError(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: authUsername,
            });

            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                    }
                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );

            socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                toast.success(`${username} left the room`);
                setClients((prev) => {
                    return prev.filter((client) => client.socketId !== socketId);
                });
            });

                socketRef.current.on(ACTIONS.OUTPUT_CHANGE, ({ output }) => {
                setOutput(output);
            });
        };
        init();

        return () => {
            if(socketRef.current) {
                socketRef.current.off(ACTIONS.OUTPUT_CHANGE);
                socketRef.current.off(ACTIONS.JOINED);
                socketRef.current.off(ACTIONS.DISCONNECTED);
                socketRef.current.disconnect();
            }
        };
    }, [reactNavigator, roomId, location.state]);


const runCode = async () => {
    if (!codeRef.current) {
        toast.error("Please write some code first");
        return;
    }

    setIsCompiling(true);
    setOutput("Compiling...");

    socketRef.current.emit(ACTIONS.OUTPUT_CHANGE, {
        roomId,
        output: "Compiling...",
    });

    const languageMap = {
        javascript: 63,
        python: 71,
        cpp: 54,
        java: 62
    };

    const SUBMIT_URL = "https://ce.judge0.com/submissions?base64_encoded=true&fields=*";

    try {
        const response = await axios.post(SUBMIT_URL, {
            language_id: languageMap[language],
            source_code: btoa(codeRef.current),
        });

        const token = response.data.token;

        const checkStatus = async () => {
            const GET_URL = `https://ce.judge0.com/submissions/${token}?base64_encoded=true&fields=*`;
            const statusResponse = await axios.get(GET_URL);
            
            const { status, stdout, stderr, compile_output } = statusResponse.data;

            if (status.id <= 2) { 
                setTimeout(checkStatus, 1000);
            } else {
                const finalOutput = stdout ? atob(stdout) : (stderr ? atob(stderr) : (compile_output ? atob(compile_output) : "No output"));
                setOutput(finalOutput);
                socketRef.current.emit(ACTIONS.OUTPUT_CHANGE, {
                    roomId,
                    output: finalOutput,
                });
                setIsCompiling(false);
                toast.success("Run completed");
            }
        };

        checkStatus();
    } catch (err) {
        console.error(err);
        const errorMsg = "Error: " + (err.response?.data?.message || "Internal Server Error");
        setOutput(errorMsg);
        socketRef.current.emit(ACTIONS.OUTPUT_CHANGE, {
            roomId,
            output: errorMsg,
        });
        setIsCompiling(false);
    }
};

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
        }
    }

    function leaveRoom() {
        reactNavigator('/');
    }

    if (!location.state) {
        return <Navigate to='/' />;
    }

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <img className="logoImage" src="/code-sync2.png" alt="logo" />
                    </div>
                    <h3>Select Theme</h3>
                    <select 
                        className="inputBox" 
                        value={theme} 
                        onChange={(e) => setTheme(e.target.value)}
                        style={{ marginBottom: '20px', width: '100%', background: '#282a36', color: '#fff' }}
                    >
                        <option value="vs-dark">VS Dark</option>
                        <option value="light">VS Light</option>
                        <option value="hc-black">High Contrast</option>
                    </select>

                    <h3>Select Language</h3>
                    <select 
                        className="inputBox" 
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value)}
                        style={{ marginBottom: '20px', width: '100%', background: '#282a36', color: '#fff' }}
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                    </select>

                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client key={client.socketId} username={client.username} avatar={client.avatar} />
                        ))}
                    </div>
                </div>

                <button className="btn joinBtn" onClick={runCode} disabled={isCompiling} style={{ marginBottom: '10px', width: '100%' }}>
                    {isCompiling ? "Running..." : "Run Code"}
                </button>
                <button className="btn copyBtn" onClick={copyRoomId}>Copy ROOM ID</button>
                <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
            </div>

            <div className="editorWrap">
                <Editor 
                    socketRef={socketRef} 
                    roomId={roomId} 
                    language={language}
                    theme={theme} // Pass the theme prop
                    username={currentUser}
                    onCodeChange={(code) => { codeRef.current = code; }} 
                />
                <div className="outputBox">
                    <h4>Output:</h4>
                    <pre>{output}</pre>
                </div>
            </div>
        </div>
    );
};

export default EditorPage;