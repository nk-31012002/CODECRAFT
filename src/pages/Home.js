import React, { useState, useEffect } from "react";
import { v4 as uuidV4 } from 'uuid'
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";


const Home = () =>{
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.reload(); 
    };

    // useEffect(() => {
    //     // Check for existing session on load
    //     const checkSession = async () => {
    //         const { data: { session } } = await supabase.auth.getSession();
    //         if (session) {
    //             const name = session.user.user_metadata.full_name;
    //             setUsername(name);
    //             setIsLoggedIn(true);
    //         }
    //     };
    //     checkSession();

    //     // Listen for login events
    //     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    //         if (event === 'SIGNED_IN' && session) {
    //             const name = session.user.user_metadata.full_name;
    //             setUsername(name);
    //             setIsLoggedIn(true)
    //             toast.success(`Authenticated as ${name}`);
    //         } else if (event === 'SIGNED_OUT') {
    //             setUsername('');
    //             setIsLoggedIn(false);
    //         }
    //     });

    //     return () => subscription.unsubscribe();
    // }, []);


useEffect(() => {
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            // Priority: full_name from Google metadata
            setUsername(session.user.user_metadata.full_name);
            setIsLoggedIn(true);
        }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            setUsername(session.user.user_metadata.full_name);
            setIsLoggedIn(true);
        } else {
            setUsername(''); // Clears the field on sign out
            setIsLoggedIn(false);
        }
    });

    return () => subscription.unsubscribe();
}, []);
    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
        redirectTo: window.location.origin 
    }
  });
  
  if (error) console.error("Login Error:", error.message)
};


    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('Create a new room');
    };

    const joinRoom = () => {
        if(!roomId || !username){
            toast.error('ROOM ID & username is required');
            return
        }

        navigate(`/editor/${roomId}`,{
            state: {
                username,
            },
        });
    };

    // const handleInputEnter = (e) => {
    //     if(e.code === 'Enter'){
    //         joinRoom();
    //     }
    // };

    return (
        <div className="homePageWrapper">
            <div className="formWrapper">
                <img className="homePageLogo" src="/code-sync2.png" alt="code-sync2-logo"/>
                <h4 className="mainLabel">Paste invitation ROOM ID</h4>
                <div className="inputGroup">
                    <input type="text" className="inputBox" placeholder="ROOM ID"
                    onChange={(e) => setRoomId(e.target.value)}
                    value={roomId}
                    // onKeyUp={handleInputEnter}
                    />
                    <input 
                        type="text" 
                        className="inputBox" 
                        placeholder="USERNAME (Sign in to fill)"
                        value={username}
                        readOnly 
                    />
                    {/* // onKeyUp={handleInputEnter} */}
                    <button className="btn joinBtn" onClick={joinRoom}>Join</button>

                    {isLoggedIn ? (

                        <button 
                            className="btn" 
                            onClick={handleSignOut}
                            style={{ marginTop: '10px', background: '#303342', color: '#fff', width: '100%' }}
                        >
                            Not you? Sign Out
                        </button>

                    ) : (
                        <>
                            <div style={{ margin: '15px 0', textAlign: 'center', color: '#eee' }}>OR</div>
                            <button 
                                className="btn" 
                                onClick={handleGoogleLogin}
                                style={{ background: '#4285F4', color: 'white', width: '100%' }}
                            >
                                Sign in with Google
                            </button>
                        </>
                    )}

                    <span className="createInfo">
                        If you don't have a invite then create &nbsp;
                        <a onClick={createNewRoom} href="" className="createNewBtn">new room</a>
                    </span>
                </div>
            </div>
            <footer>
                <h4>
                    Built with <a href="https://www.linkedin.com/in/nagendra-kumar-2073aa235/">Nk</a>
                </h4>
            </footer>
        </div>
    )
}

export default Home;


