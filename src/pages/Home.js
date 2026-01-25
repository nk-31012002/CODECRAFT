import React, { useState, useEffect } from "react";
import { v4 as uuidV4 } from 'uuid'
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/me');
                const data = await response.json();
                if (data && data.displayName) {
                    setUsername(data.displayName);
                    toast.success(`Welcome back, ${data.displayName}`);
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
            }
        };
        fetchUser();
    }, []);

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:5000/auth/google';
    };

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('Created a new room');
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('ROOM ID & username is required');
            return;
        }

        navigate(`/editor/${roomId}`, {
            state: {
                username,
            },
        });
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };

    const handleLogout = () => {
        setUsername('');
        window.location.href = '/logout';
    };

        return (
        <div className="homePageWrapper">
            <div className="formWrapper">
                <img className="homePageLogo" src="/code-sync2.png" alt="logo" />
                
                {!username ? (
                    <div className="loginRequired">
                        <h4 className="mainLabel">Login required to create/join rooms</h4>
                        <button className="btn googleBtn" onClick={handleGoogleLogin}>
                            Login with Google
                        </button>
                    </div>
                ) : (
                    <div className="inputGroup">
                        <h4 className="mainLabel">Welcome, {username}</h4>
                        <input type="text" className="inputBox" placeholder="ROOM ID"
                            onChange={(e) => setRoomId(e.target.value)} value={roomId}
                        />
                        <input type="text" className="inputBox" value={username} readOnly /> 
                        <button className="btn joinBtn" onClick={joinRoom}>Join</button>
                        <span className="createInfo">
                            If you don't have an invite then create &nbsp;
                        <a onClick={createNewRoom} href="#" className="createNewBtn">new room</a>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;