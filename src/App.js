import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// 1. ANIMATION VARIANTS & CONFIGURATION
// ============================================================================
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    },
    exit: { opacity: 0, transition: { duration: 0.2 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function App() {
    // ============================================================================
    // 2. STATE MANAGEMENT (Application Memory)
    // ============================================================================
    const [showIntro, setShowIntro] = useState(true); // App starts here now!
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const [showWhitepaper, setShowWhitepaper] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        fullName: '',
        email: '',
        password: '',
        profilePicture: null
    });
    const [skillToDelete, setSkillToDelete] = useState(null); // Remembers which ID to delete
    const [newSkill, setNewSkill] = useState({title: '', category: '', customCategory: '', description: '', price: 5});
    const [showCustomCategory, setShowCustomCategory] = useState(false);
    const [skills, setSkills] = useState([]);
    const [tokenCredits, setTokenCredits] = useState(10); // Everyone starts with 10 TC!
    const [isRegisteringExpertise, setIsRegisteringExpertise] = useState(false);
    const circleAnimation = `
  @keyframes formCircle {
    0% { transform: scale(0) rotate(-180deg); opacity: 0; }
    70% { transform: scale(1.05) rotate(5deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes meshGradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [activeChat, setActiveChat] = useState(null);
    const [exchanges, setExchanges] = useState([
        { id: 1, title: 'Core Java Fundamentals', partner: '@junior_dev', type: 'teaching', status: 'ongoing', date: 'March 10, 2026' },
        { id: 2, title: 'Spring Boot API Design', partner: '@mentor_guru', type: 'learning', status: 'ongoing', date: 'March 14, 2026' }
    ]);
    // chatHistory
    const [chatStore, setChatStore] = useState({
        '@junior_dev': [
            { id: 1, sender: 'partner', text: 'Hey! Ready for Java?', time: '10:00 AM' }
        ],
        '@mentor_guru': [
            { id: 1, sender: 'partner', text: 'Spring Boot is ready for you.', time: '09:00 AM' }
        ]
    });
    const [chatInput, setChatInput] = useState('');
    const [globalMarketplace, setGlobalMarketplace] = useState([]); // Stores all users' skills
    // ============================================================================
    // 3. LIFECYCLE EFFECTS
    // ============================================================================
    // --- ON LOAD: CHECK FOR RESET PASSWORD LINK ---
    useEffect(() => {
        // Check for reset token (Your existing code)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            setResetToken(token);
            setIsResettingPassword(true);
        }

        // --- NEW: FETCH MARKETPLACE DATA FROM SPRING BOOT ---
        fetch('http://localhost:8080/api/resources/all')
            .then(response => response.json())
            .then(data => {
                console.log("Marketplace Data loaded:", data);
                setGlobalMarketplace(data); // Put the database skills into the UI
            })
            .catch(err => console.error("Database offline:", err));
    }, []);
// --- NEW: DYNAMIC DASHBOARD FETCH (Zero Hardcoding) ---
    useEffect(() => {
        // Only fetch if the user is logged in AND looking at the Dashboard
        if (isLoggedIn && activeTab === 'Dashboard') {
            fetch(`http://localhost:8080/api/resources/owner/${formData.userId}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Your Dashboard skills:", data);
                    setSkills(data); // Fill the Dashboard overview
                })
                .catch(err => console.error("Dashboard failed:", err));
        }
    }, [isLoggedIn, activeTab, formData.userId]);
    // ============================================================================
    // 4. EVENT HANDLERS (Authentication & File Uploads)
    // ============================================================================
    const handleRegisterExpertise = async (e) => {
        e.preventDefault();

        const finalCategory = showCustomCategory ? newSkill.customCategory : newSkill.category;

        // The exact package we are sending to Spring Boot (Notice no 'id' here!)
        const skillEntry = {
            title: newSkill.title,
            category: finalCategory,
            description: newSkill.description,
            price: newSkill.price,
            status: 'Active',
            timestamp: new Date().toLocaleDateString(),
            rating: 0.0,
            reviewCount: 0
        };

        try {
            const response = await fetch(`http://localhost:8080/api/resources/add/${formData.userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(skillEntry)
            });

            if (response.ok) {
                alert("Skill successfully broadcasted to the network!");
                setIsRegisteringExpertise(false); // Closes the popup

                // 1. Refresh the Global Marketplace
                const resAll = await fetch('http://localhost:8080/api/resources/all');
                const dataAll = await resAll.json();
                setGlobalMarketplace(dataAll);

                // 2. 🚨 NEW: Refresh YOUR Dashboard instantly!
                const resOwner = await fetch(`http://localhost:8080/api/resources/owner/${formData.userId}`);
                const dataOwner = await resOwner.json();
                setSkills(dataOwner);
            } else {
                alert("Server responded with an error. Check logs.");
            }
        } catch (error) {
            console.error("Network Error:", error);
            // Only show this if the server is actually dead
            if (!navigator.onLine) alert("You are offline!");
        }
    };
// --- THIS MUST MATCH THE BUTTON NAME ---
    const requestDeleteSkill = (idToRemove) => {
        setSkillToDelete(idToRemove);
    };

    const confirmDeleteSkill = async () => {
        if (skillToDelete) {
            try {
                // 1. Tell the backend to delete it from the REAL database
                const response = await fetch(`http://localhost:8080/api/resources/delete/${skillToDelete}`, {
                    method: 'DELETE' // 🚨 This is the magic word!
                });

                if (response.ok) {
                    // 1. Remove it from your Dashboard instantly
                    setSkills(skills.filter(skill => skill.id !== skillToDelete));

                    // 2. 🚨 NEW: Remove it from the Marketplace instantly
                    setGlobalMarketplace(globalMarketplace.filter(skill => skill.id !== skillToDelete));

                    setSkillToDelete(null); // Closes the popup
                } else {
                    alert("Failed to delete skill from the database.");
                }
            } catch (error) {
                console.error("Error deleting skill:", error);
                alert("Could not connect to the server to delete.");
            }
        }
    };

    const cancelDeleteSkill = () => {
        setSkillToDelete(null);
    };
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: formData.userId,
                    password: formData.password
                })
            });

            if (response.ok) {
                setIsLoggedIn(true);
                alert("Welcome back! Login successful.");
            } else {
                const errorText = await response.text();
                alert("Login Failed: " + errorText);
            }
        } catch (err) {
            alert("Auth backend is offline!");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // 🚨 THIS CROSSES THE BRIDGE to your new /register endpoint
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData) // Sends userId, fullName, email, password
            });

            if (response.ok) {
                setIsLoggedIn(true);
                alert("Registration Successful! Your profile is now in PostgreSQL.");
            } else {
                alert("Registration failed. Is that User ID already taken?");
            }
        } catch (err) {
            alert("Could not connect to Auth server!");
        }
    };
    const handlePasswordResetRequest = async (e) => {
        e.preventDefault();
        console.log("LOG: React is sending reset request for:", formData.email);

        try {
            // --- PASTE THE CORRECT URL BELOW ---
            // If your Java controller has @RequestMapping("/api/auth"), use that path!
            const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: formData.email}),
            });

            if (response.ok) {
                const message = await response.text();
                alert(message); // Should say "Recovery link dispatched..."
            } else {
                // This is where your 404 error is currently being caught
                console.error("Server Error Code:", response.status);
                alert("Server error: " + response.status + ". Check your Java Controller path!");
            }
        } catch (error) {
            console.error("Connection Error:", error);
            alert("Network error. Is Spring Boot running?");
        }
    };

    const handleNewPasswordSubmit = (e) => {
        e.preventDefault();
        console.log("Updating password with token:", resetToken);
        alert("Password updated! You can now log in.");
        window.location.href = '/'; // Reset the app state
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData({...formData, profilePicture: reader.result});
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (e) => {
        e.stopPropagation();
        setFormData({...formData, profilePicture: null});
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !activeChat) return;

        const newMessage = {
            id: Date.now(),
            sender: 'me',
            text: chatInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // This updates ONLY the history for the person you are currently talking to
        setChatStore(prevStore => ({
            ...prevStore,
            [activeChat.name]: [...(prevStore[activeChat.name] || []), newMessage]
        }));

        setChatInput('');
    };
    const handleAdjustPrice = (exchangeId, newPrice) => {
        setExchanges(prev => prev.map(ex =>
            ex.id === exchangeId ? { ...ex, price: parseInt(newPrice) } : ex
        ));
    };
    // --- NEW: TRANSACTION HANDLERS ---
    const handleAuthorizeContract = async (mentorName, amount, sessions) => {
        try {
            // We use the 'amount' and 'sessions' from our 10 TC / 5 Lessons agreement
            const response = await fetch(`http://localhost:8080/api/contracts/authorize?learnerId=1&mentorId=2&amount=${amount}&sessions=${sessions}&days=10`, {
                method: 'POST'
            });

            if (response.ok) {
                const contractData = await response.json();
                setTokenCredits(prev => prev - amount); // Available balance drops in UI

                // Add a "System Message" to the chat store to show the Card
                const systemMsg = {
                    id: Date.now(),
                    sender: 'system',
                    type: 'contract_card',
                    data: contractData,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setChatStore(prev => ({
                    ...prev,
                    [mentorName]: [...(prev[mentorName] || []), systemMsg]
                }));
            }
        } catch (err) { alert("Backend offline! Is Spring Boot running?"); }
    };

    const handleVerifyOTP = async (contractId, mentorName) => {
        try {
            const response = await fetch(`http://localhost:8080/api/contracts/verify-otp?contractId=${contractId}`, {
                method: 'POST'
            });
            if (response.ok) {
                alert("OTP Valid! 2 TC released to Mentor.");
                // Refresh logic would go here to update the 'completedSessions' count
            }
        } catch (err) { console.error(err); }
    };
    // ============================================================================
    // 5. VIEW: SET NEW PASSWORD (FROM EMAIL LINK)
    // ============================================================================
    if (isResettingPassword) {
        return (
            <div
                className="min-h-screen flex items-center justify-center font-sans relative overflow-hidden bg-cover bg-center"
                style={{backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564')"}}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>

                {/* --- THE MASTER OVAL: Matches h-[550px] from your Sign-in screen --- */}
                <div
                    className="relative z-10 flex flex-col items-center justify-center w-[500px] h-[550px] bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-[0_0_100px_rgba(168,85,247,0.25)] transition-all duration-500 hover:border-purple-500/30">
                    <div className="w-[65%] flex flex-col items-center">
                        <h2 className="text-gray-200 text-2xl w-full text-left mb-6 font-light tracking-wide pl-2">
                            Set New <span className="text-purple-400">Password</span>
                        </h2>

                        <form onSubmit={handleNewPasswordSubmit} className="w-full flex flex-col items-center">
                            <input
                                className="w-full bg-black/40 border border-white/10 hover:border-purple-500/40 focus:border-purple-500 transition-all rounded-full py-3 pl-6 text-white placeholder-gray-500 outline-none mb-4 text-sm"
                                type="password"
                                placeholder="Enter New Password"
                                required
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                            <button type="submit"
                                    className="bg-black/80 hover:bg-black border border-white/10 hover:border-purple-500/50 transition-all text-gray-300 rounded-full py-3 px-12 text-[10px] font-bold tracking-widest uppercase shadow-xl">
                                Update Credentials
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================================
    // 6. VIEW: LOGGED IN DASHBOARD (WITH SIDEBAR & TC)
    // ============================================================================
    if (isLoggedIn) {
        return (
            <>
                {/* --- EXPERTISE REGISTRATION MODAL --- */}
                <AnimatePresence>
                    {isRegisteringExpertise && (
                        <div
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
                            <motion.div
                                initial={{scale: 0.9, opacity: 0, y: 20}}
                                animate={{scale: 1, opacity: 1, y: 0}}
                                exit={{scale: 0.9, opacity: 0, y: 20}}
                                className="max-w-md w-full bg-[#0a0718]/90 border border-white/10 p-10 rounded-[2.5rem] shadow-[0_0_100px_rgba(168,85,247,0.15)] backdrop-blur-2xl relative overflow-hidden"
                            >
                                {/* Decorative Glow */}
                                <div
                                    className="absolute -top-20 -right-20 w-40 h-40 bg-purple-600/30 blur-[50px] rounded-full pointer-events-none"></div>

                                <h2 className="text-2xl font-light text-white mb-8 tracking-wide">Register <span
                                    className="text-purple-400 font-normal">Expertise</span></h2>

                                <form onSubmit={handleRegisterExpertise} className="space-y-5 relative z-10">
                                    <div>
                                        <label
                                            className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold ml-4 mb-2 block">Category</label>
                                        <select
                                            className="w-full bg-black/40 border border-white/10 focus:border-purple-500 rounded-full py-3.5 px-6 text-gray-300 outline-none text-sm transition-all appearance-none"
                                            value={newSkill.category}
                                            onChange={(e) => {
                                                setNewSkill({...newSkill, category: e.target.value});
                                                setShowCustomCategory(e.target.value === 'Custom');
                                            }}
                                        >
                                            <option value="" disabled>Select a Category...</option>

                                            <optgroup label="Technology & Dev"
                                                      className="bg-gray-900 text-purple-400 font-bold">
                                                <option value="Backend Development"
                                                        className="text-gray-300 font-normal">Backend Development
                                                </option>
                                                <option value="Frontend & Web"
                                                        className="text-gray-300 font-normal">Frontend & Web
                                                </option>
                                                <option value="Data & AI" className="text-gray-300 font-normal">Data
                                                    Science & AI
                                                </option>
                                                <option value="Cybersecurity"
                                                        className="text-gray-300 font-normal">Cybersecurity
                                                </option>
                                            </optgroup>

                                            <optgroup label="Business & Finance"
                                                      className="bg-gray-900 text-purple-400 font-bold">
                                                <option value="Business Strategy"
                                                        className="text-gray-300 font-normal">Business Strategy
                                                </option>
                                                <option value="Digital Marketing"
                                                        className="text-gray-300 font-normal">Digital Marketing
                                                </option>
                                                <option value="Accounting & Tax"
                                                        className="text-gray-300 font-normal">Accounting & Tax
                                                </option>
                                                <option value="Sales & Pitching"
                                                        className="text-gray-300 font-normal">Sales & Pitching
                                                </option>
                                            </optgroup>

                                            <optgroup label="Creative & Design"
                                                      className="bg-gray-900 text-purple-400 font-bold">
                                                <option value="UI/UX Design"
                                                        className="text-gray-300 font-normal">UI/UX Design
                                                </option>
                                                <option value="Graphic Design"
                                                        className="text-gray-300 font-normal">Graphic & Branding
                                                </option>
                                                <option value="Video & Audio"
                                                        className="text-gray-300 font-normal">Video & Audio Editing
                                                </option>
                                                <option value="Copywriting"
                                                        className="text-gray-300 font-normal">Copywriting & Content
                                                </option>
                                            </optgroup>

                                            <optgroup label="Education & Lifestyle"
                                                      className="bg-gray-900 text-purple-400 font-bold">
                                                <option value="Language Tutoring"
                                                        className="text-gray-300 font-normal">Language Tutoring
                                                </option>
                                                <option value="Fitness & Nutrition"
                                                        className="text-gray-300 font-normal">Fitness & Nutrition
                                                </option>
                                                <option value="Music Lessons"
                                                        className="text-gray-300 font-normal">Music & Instruments
                                                </option>
                                                <option value="Life Coaching"
                                                        className="text-gray-300 font-normal">Life Coaching
                                                </option>
                                            </optgroup>

                                            <optgroup label="Other"
                                                      className="bg-gray-900 text-purple-400 font-bold">
                                                <option value="Custom" className="text-gray-300 font-normal">Custom
                                                    (Type your own)
                                                </option>
                                            </optgroup>
                                        </select>

                                        {/* --- SMOOTH CUSTOM CATEGORY REVEAL --- */}
                                        <AnimatePresence>
                                            {showCustomCategory && (
                                                <motion.div
                                                    initial={{opacity: 0, height: 0, marginTop: 0}}
                                                    animate={{opacity: 1, height: 'auto', marginTop: 12}}
                                                    exit={{opacity: 0, height: 0, marginTop: 0}}
                                                >
                                                    <input
                                                        className="w-full bg-black/40 border border-purple-500/50 focus:border-purple-500 rounded-full py-3 px-6 text-white outline-none text-sm transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                                                        placeholder="Type your custom category..."
                                                        required={showCustomCategory}
                                                        value={newSkill.customCategory}
                                                        onChange={(e) => setNewSkill({
                                                            ...newSkill,
                                                            customCategory: e.target.value
                                                        })}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div>
                                        <label
                                            className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold ml-4 mb-2 block">Value
                                            (TC)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                className="w-full bg-black/40 border border-white/10 focus:border-purple-500 rounded-full py-3.5 pl-6 pr-12 text-white outline-none text-sm transition-all"
                                                value={newSkill.price}
                                                onChange={(e) => setNewSkill({...newSkill, price: e.target.value})}
                                            />
                                            <span
                                                className="absolute right-6 top-1/2 -translate-y-1/2 text-purple-500 font-black text-xs">TC</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold ml-4 mb-2 block">Details</label>
                                        <textarea
                                            className="w-full bg-black/40 border border-white/10 focus:border-purple-500 rounded-3xl py-4 px-6 text-white outline-none text-sm h-28 resize-none transition-all"
                                            placeholder="Detail what the learner will receive..."
                                            required
                                            value={newSkill.description}
                                            onChange={(e) => setNewSkill({
                                                ...newSkill,
                                                description: e.target.value
                                            })}
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button type="submit"
                                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-purple-900/20">Broadcast
                                        </button>
                                        <button type="button" onClick={() => setIsRegisteringExpertise(false)}
                                                className="flex-1 border border-white/10 text-gray-400 rounded-full py-3.5 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">Cancel
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                {/* --- 2. DELETE CONFIRMATION MODAL --- */}
                <AnimatePresence>
                    {skillToDelete && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="max-w-sm w-full bg-[#0a0718]/95 border border-red-500/20 p-8 rounded-[2rem] shadow-[0_0_100px_rgba(239,68,68,0.15)] backdrop-blur-2xl relative overflow-hidden text-center"
                            >
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                </div>
                                <h3 className="text-xl font-light text-white mb-2">Delete Resource?</h3>
                                <p className="text-xs text-gray-400 font-light mb-8">This action cannot be undone. The resource will be permanently removed from the network.</p>
                                <div className="flex gap-4">
                                    <button onClick={confirmDeleteSkill} className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-full py-3 text-[10px] font-bold uppercase tracking-widest transition-all">Confirm</button>
                                    <button onClick={cancelDeleteSkill} className="flex-1 border border-white/10 text-gray-400 rounded-full py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">Cancel</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                <div className="min-h-screen text-white font-sans flex bg-[#030014] relative overflow-hidden">
                    {/* Ambient Background Glows */}
                    <div
                        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>
                    <div
                        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

                    {/* --- REFINED SIDEBAR --- */}
                    <aside
                        className="relative z-10 w-72 bg-black/20 border-r border-white/5 backdrop-blur-3xl flex flex-col">
                        <div className="p-10">
                            <h1 className="font-light text-2xl tracking-[0.2em] flex flex-col text-white group cursor-default">
                                <span>P2P<span className="text-purple-500 animate-pulse">.</span></span>
                                <span
                                    className="text-[20px] tracking-[0.5em] text-gray-500 group-hover:text-purple-400 transition-colors">EXCHANGE</span>
                            </h1>
                        </div>
                        <nav className="flex-1 px-6 space-y-2">
                            {['Dashboard', 'Marketplace', 'Network', 'Settings'].map((item) => (
                                <button
                                    key={item}
                                    onClick={() => setActiveTab(item)} // This changes the view!
                                    className={`w-full text-left px-6 py-4 rounded-2xl text-xs font-bold tracking-[0.1em] transition-all duration-300 ${
                                        activeTab === item
                                            ? "bg-gradient-to-r from-purple-500/20 to-transparent border border-purple-500/30 text-purple-300"
                                            : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                                    }`}
                                >
                                    {item.toUpperCase()}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* --- MAIN CONTENT AREA --- */}
                    <div className="relative z-10 flex-1 flex flex-col h-screen">
                        <header
                            className="p-8 flex justify-end items-center bg-black/10 backdrop-blur-md gap-8 border-b border-white/5">
                            {/* ENHANCED TC DISPLAY */}
                            <div
                                className="flex items-center gap-4 bg-gradient-to-b from-white/10 to-transparent border border-white/10 px-6 py-2.5 rounded-full hover:border-purple-500/50 transition-all cursor-help">
                                <div className="relative">
                                        <span
                                            className="absolute inset-0 bg-purple-500 blur-sm rounded-full animate-ping opacity-20"></span>
                                    <span className="relative block w-2 h-2 rounded-full bg-purple-500"></span>
                                </div>
                                <span
                                    className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Balance</span>
                                <span className="text-white font-black text-sm tracking-tighter">{tokenCredits}
                                    <span className="text-purple-500">TC</span></span>
                            </div>

                            <div className="flex items-center gap-6 border-l border-white/10 pl-8">
                                <div className="flex items-center gap-4">
                                    <div className="relative group">
                                        <div
                                            className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                        <div
                                            className="relative w-11 h-11 rounded-full border border-white/20 bg-black flex items-center justify-center overflow-hidden">
                                            {formData.profilePicture ?
                                                <img src={formData.profilePicture} alt="Profile"
                                                     className="w-full h-full object-cover"/> : <span
                                                    className="text-purple-400 font-bold text-lg">{formData.userId?.charAt(0).toUpperCase() || 'D'}</span>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                            <span
                                                className="text-[9px] uppercase tracking-[0.2em] text-purple-500/80 font-black">USER Verified</span>
                                        <span
                                            className="text-sm font-medium text-white/90">@{formData.userId || 'dhruv_node'}</span>
                                    </div>
                                </div>
                                <button onClick={() => setIsLoggedIn(false)}
                                        className="hover:text-red-400 text-gray-500 text-[9px] font-black tracking-[0.3em] transition-all">SIGN
                                    OUT
                                </button>
                            </div>
                        </header>

                        <main className="p-12 overflow-y-auto">
                            <div className="max-w-6xl mx-auto">

                                {/* ==========================================
                                    TAB 1: DASHBOARD (Exact Original Code)
                                ========================================== */}
                                {activeTab === 'Dashboard' && (
                                    <div className="animate-in fade-in duration-500">
                                        <h2 className="text-5xl font-thin tracking-tighter text-white mb-12">
                                            <span className="text-purple-500/50"></span> <span className="text-shadow-white-400">Overview</span>
                                        </h2>
                                        <div className="grid grid-cols-1 gap-8">
                                            <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 p-12 rounded-[3rem] backdrop-blur-md shadow-2xl hover:border-purple-500/20 transition-all group">
                                                <div className="flex justify-between items-start mb-10">
                                                    <h3 className="text-2xl font-light tracking-wide">Registered <span className="text-purple-400 font-normal">EXPERTISE</span></h3>
                                                    <button onClick={() => setIsRegisteringExpertise(true)} className="text-[10px] bg-purple-600/10 border border-purple-500/20 px-6 py-3 rounded-full font-bold uppercase tracking-[0.2em] hover:bg-purple-600 transition-all">
                                                        REGISTER EXPERTISE +
                                                    </button>
                                                </div>
                                                {skills.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[2rem]">
                                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-light mb-2">No REGISTERED EXPERTISE found</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {skills.map((skill) => (
                                                            <motion.div key={skill.id} initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="bg-black/20 border border-white/5 p-6 rounded-3xl hover:border-purple-500/30 transition-all group flex flex-col justify-between">
                                                                <div>
                                                                    <div className="flex justify-between items-start mb-4">
                                                                        <span className="text-[8px] uppercase tracking-[0.2em] bg-white/5 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20">{skill.category}</span>
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="flex items-center gap-1">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                                                <span className="text-[8px] uppercase tracking-[0.2em] text-green-500/80">{skill.status}</span>
                                                                            </div>
                                                                            {/* --- YOUR DELETE BUTTON --- */}
                                                                            <button onClick={() => requestDeleteSkill(skill.id)} className="text-gray-500 hover:text-red-400 transition-colors" title="Remove Resource">
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <h4 className="text-xl font-light text-white mb-2">{skill.title}</h4>
                                                                    <p className="text-xs text-gray-400 font-light leading-relaxed line-clamp-2">{skill.description}</p>
                                                                </div>

                                                                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                                                                    <span className="text-[9px] text-gray-500 uppercase tracking-widest">{skill.timestamp}</span>
                                                                    <div className="flex items-center gap-1.5 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
                                                                        {/* --- STAR RATING UI --- */}
                                                                        <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                                                                            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                                            </svg>
                                                                            <span className="text-[10px] text-gray-300 font-bold">
                                                                                      {skill.rating > 0 ? skill.rating.toFixed(1) : 'New'}
                                                                                </span>
                                                                            <span className="text-[8px] text-gray-500">({skill.reviewCount || 0})</span>
                                                                        </div>
                                                                        <span className="text-white font-black text-sm">{skill.price}</span>
                                                                        <span className="text-purple-400 text-[9px] font-bold uppercase tracking-widest">TC</span>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* ==========================================
                                             TAB 1.5: GLOBAL MARKETPLACE (NEW!)
                                        ========================================== */}
                                {activeTab === 'Marketplace' && (
                                    <div className="animate-in fade-in duration-500">
                                        <h2 className="text-5xl font-thin tracking-tighter text-white mb-12">
                                            <span className="text-purple-500">Marketplace</span>
                                        </h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {(!Array.isArray(globalMarketplace) || globalMarketplace.length === 0) ? (
                                                <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[2rem]">
                                                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                                        <span className="text-purple-400 text-2xl">🌍</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-light">The network is quiet. No skills posted yet.</p>
                                                </div>
                                            ) : (
                                                globalMarketplace.map((resource) => (
                                                    <div key={resource.id} className="bg-black/20 border border-white/5 p-6 rounded-3xl hover:border-purple-500/30 transition-all group flex flex-col justify-between backdrop-blur-md shadow-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                                                        <div>
                                                            <div className="flex justify-between items-start mb-4">
                                                                <span className="text-[8px] uppercase tracking-[0.2em] bg-white/5 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20">{resource.category}</span>
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-white font-black text-lg leading-none">{resource.price} <span className="text-purple-400 text-[10px]">TC</span></span>
                                                                </div>
                                                            </div>
                                                            <h4 className="text-xl font-light text-white mb-3 group-hover:text-purple-300 transition-colors">{resource.title}</h4>
                                                            <p className="text-xs text-gray-400 font-light leading-relaxed line-clamp-3 mb-6">{resource.description}</p>
                                                        </div>

                                                        <div className="border-t border-white/5 pt-4 mt-auto">
                                                            <button
                                                                onClick={() => setActiveChat({ name: '@mentor_node', topic: resource.title })}
                                                                className="w-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/40 hover:to-blue-600/40 border border-purple-500/30 text-purple-300 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg"
                                                            >
                                                                Connect & Propose 🤝
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                                {/* ==========================================
                                    TAB 2: NETWORK (The New Amazon-Style Menu)
                                ========================================== */}
                                {activeTab === 'Network' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-16">
                                        <div>
                                            <h2 className="text-5xl font-thin tracking-tighter text-white mb-4">Your<span className="text-purple-500/50"> Mentorships </span></h2>
                                            <p className="text-gray-500 text-xs font-bold tracking-[0.3em] uppercase mb-12">Activity</p>
                                        </div>

                                        {/* --- SECTION 1: TEACHING --- */}
                                        <section>
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                                                <h3 className="text-[10px] font-black tracking-[0.4em] text-purple-400 uppercase ">Teaching Sessions</h3>
                                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                                            </div>

                                            <div className="space-y-4">
                                                {exchanges.filter(ex => ex.type === 'teaching').map((item) => (
                                                    <div key={item.id} className="bg-white/5 border border-purple-500/10 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center group hover:border-purple-500/30 transition-all backdrop-blur-md relative overflow-hidden">
                                                        <div className="flex gap-8 items-center w-full relative z-10">
                                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-purple-500/20 bg-purple-500/10 text-purple-400">
                                                                <span className="text-xl font-black">↑</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-4 mb-2">
                                                                    <span className="bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-green-500/20 animate-pulse">{item.status}</span>
                                                                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Active since {item.date}</span>
                                                                </div>
                                                                <h4 className="text-2xl font-light text-white">{item.title}</h4>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Learner: <span className="text-purple-400">{item.partner}</span></p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-3 mt-6 md:mt-0 w-full md:w-auto relative z-10 flex-shrink-0">
                                                            <button
                                                                onClick={() => setActiveChat({ name: item.partner, topic: item.title })}
                                                                className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap"
                                                            >
                                                                Chat with Learner
                                                            </button>
                                                            <button className="flex-1 md:flex-none bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-purple-900/20 whitespace-nowrap">
                                                                Mark Complete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>

                                        {/* --- SECTION 2: LEARNING --- */}
                                        <section>
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                                                <h3 className="text-[10px] font-black tracking-[0.4em] text-blue-400 uppercase "> Learning Sessions </h3>
                                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                                            </div>

                                            <div className="space-y-4">
                                                {exchanges.filter(ex => ex.type === 'learning').map((item) => (
                                                    <div key={item.id} className="bg-white/5 border border-blue-500/10 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center group hover:border-blue-500/30 transition-all backdrop-blur-md relative overflow-hidden">
                                                        <div className="flex gap-8 items-center w-full relative z-10">
                                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-blue-500/20 bg-blue-500/10 text-blue-400">
                                                                <span className="text-xl font-black">↓</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-4 mb-2">
                                                                    <span className="bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-green-500/20 animate-pulse">{item.status}</span>
                                                                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Ongoing since {item.date}</span>
                                                                </div>
                                                                <h4 className="text-2xl font-light text-white">{item.title}</h4>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Mentor: <span className="text-blue-400">{item.partner}</span></p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-3 mt-6 md:mt-0 w-full md:w-auto relative z-10 flex-shrink-0">
                                                            <button
                                                                onClick={() => setActiveChat({ name: item.partner, topic: item.title })}
                                                                className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap"
                                                            >
                                                                Chat with Mentor
                                                            </button>
                                                            <button className="flex-1 md:flex-none bg-blue-600/20 border border-blue-500/30 text-blue-400 px-4 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap">
                                                                Mark Complete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    </div>
                                )}
                            </div>
                        </main>
                        {/* --- WHATSAPP-STYLE CHAT OVERLAY --- */}
                        <AnimatePresence>
                            {activeChat && (
                                <div className="fixed inset-0 z-[120] flex justify-end bg-black/40 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                        className="w-full max-w-md bg-[#0a0718]/95 border-l border-white/10 h-screen shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col"
                                    >
                                        {/* Chat Header */}
                                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-md">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                    {activeChat.name.charAt(1).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium text-white">{activeChat.name}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                        <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Online • {activeChat.topic}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => setActiveChat(null)} className="text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </div>
                                        {/* Add this inside the Chat Header or right below it */}
                                        {activeChat && exchanges.find(ex => ex.partner === activeChat.name)?.type === 'teaching' && (
                                            <div className="px-6 py-2 bg-purple-500/10 border-b border-purple-500/20 flex justify-between items-center">
                                                <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest">Negotiated Price:</span>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        className="w-12 bg-black/40 border border-purple-500/30 rounded px-1 text-[10px] text-white outline-none"
                                                        defaultValue={exchanges.find(ex => ex.partner === activeChat.name)?.price || 5}
                                                        onChange={(e) => handleAdjustPrice(exchanges.find(ex => ex.partner === activeChat.name).id, e.target.value)}
                                                    />
                                                    <span className="text-[10px] text-purple-500 font-bold">TC</span>
                                                </div>
                                            </div>
                                        )}
                                        {/* Message Area (WhatsApp Bubble Style) */}
                                        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#030014]">
                                            <div className="text-center mb-8">
                        <span className="bg-white/5 text-gray-500 text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/10">
                            End-to-End Encrypted Session
                        </span>
                                            </div>

                                            {(chatStore[activeChat.name] || []).map((msg) => (
                                                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                                    {/* If the message type is 'contract_card', show the Special Escrow Card */}
                                                    {msg.type === 'contract_card' ? (
                                                        <div className="w-full max-w-sm bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 p-6 rounded-[2rem] backdrop-blur-xl shadow-2xl my-4">
                                                            <div className="flex justify-between items-center mb-4">
                                                                <span className="text-[10px] bg-purple-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">Active Contract</span>
                                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Escrow Locked</span>
                                                            </div>
                                                            <h4 className="text-xl font-light text-white mb-2">{activeChat.topic}</h4>
                                                            <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                                                                <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                                                                    <p className="text-[8px] text-gray-500 uppercase mb-1">Total</p>
                                                                    <p className="text-sm font-bold text-purple-400">{msg.data.totalAmount} TC</p>
                                                                </div>
                                                                <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                                                                    <p className="text-[8px] text-gray-500 uppercase mb-1">Status</p>
                                                                    <p className="text-sm font-bold text-white">{msg.data.completedSessions}/{msg.data.totalSessions}</p>
                                                                </div>
                                                                <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                                                                    <p className="text-[8px] text-gray-500 uppercase mb-1">Safe</p>
                                                                    <p className="text-[9px] font-bold text-blue-400">10 Days</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleVerifyOTP(msg.data.id, activeChat.name)}
                                                                className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
                                                            >
                                                                Submit Lesson OTP
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        /* This is your original message bubble code */
                                                        <div className={`max-w-[80%] flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                                                            <div className={`px-5 py-3 shadow-lg ${
                                                                msg.sender === 'me' ? 'bg-purple-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white/10 border border-white/10 text-gray-200 rounded-2xl rounded-tl-sm'
                                                            }`}>
                                                                <p className="text-sm font-light leading-relaxed">{msg.text}</p>
                                                            </div>
                                                            <span className="text-[9px] text-gray-500 font-bold mt-1 tracking-widest">{msg.time}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Chat Input Area */}
                                        <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-md">
                                            <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                                                <input
                                                    value={chatInput}
                                                    onChange={(e) => setChatInput(e.target.value)}
                                                    placeholder="Type a message..."
                                                    className="flex-1 bg-white/5 border border-white/10 focus:border-purple-500 rounded-full py-4 pl-6 pr-4 text-white text-sm outline-none transition-all placeholder-gray-600"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleAuthorizeContract(activeChat.name, 10, 5)}
                                                    className="bg-green-600/20 border border-green-500/50 text-green-400 p-4 rounded-full hover:bg-green-500/30 transition-all flex-shrink-0"
                                                    title="Authorize"
                                                >
                                                    🤝
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={!chatInput.trim()}
                                                    className="bg-purple-600 disabled:bg-purple-600/30 disabled:cursor-not-allowed hover:bg-purple-500 text-white p-4 rounded-full transition-all shadow-lg shadow-purple-900/40 flex-shrink-0"
                                                >
                                                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                                </button>
                                            </form>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </>
        );
    }

    // ============================================================================
    // 7. VIEW: LANDING PAGE & AUTH BUBBLE
    // ============================================================================
    // --- FINAL RENDER LOGIC: INTRO -> AUTH BUBBLE ---
    return (
        <div className="min-h-screen font-sans relative overflow-hidden bg-cover bg-center bg-no-repeat"
             style={{backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564')"}}>

            {showWhitepaper && (
                <div
                    className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6">
                    <div
                        className="max-w-3xl w-full bg-white/5 border border-white/10 p-12 rounded-[3rem] relative overflow-y-auto max-h-[80vh]">
                        <button
                            onClick={() => setShowWhitepaper(false)}
                            className="absolute top-8 right-8 text-gray-500 hover:text-white text-xs font-bold tracking-widest"
                        >
                            [ CLOSE ]
                        </button>

                        <h2 className="text-3xl font-thin text-purple-400 mb-8 tracking-tighter">P2P Exchange
                            Protocol <span className="text-white">v1.0</span></h2>

                        <div className="space-y-8 text-gray-300 font-light leading-relaxed text-sm text-left">
                            <section>
                                <h4 className="text-white font-bold text-[10px] uppercase tracking-[0.3em] mb-3">1.
                                    Token Generation Event</h4>
                                <p>Every unique node is minted a genesis balance of **10 Token Credits (TC)** upon
                                    verification.</p>
                            </section>
                            <section>
                                <h4 className="text-white font-bold text-[10px] uppercase tracking-[0.3em] mb-3">2.
                                    Proof of Value</h4>
                                <p>Users earn credits by fulfilling resource requests. Transfers happen directly
                                    between nodes.</p>
                            </section>
                        </div>
                    </div>
                </div>
            )}

            {/* Background Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

            {showIntro ? (
                /* --- ENHANCED INTRO PAGE CONTENT --- */
                <div className="relative z-10 flex flex-col items-center justify-center h-screen text-center px-6">
                    <h1 className="text-6xl md:text-8xl font-thin tracking-tighter text-white mb-2 animate-pulse">
                        P2P<span className="text-purple-500">.</span>EXCHANGE
                    </h1>

                    {/* THE MISSION STATEMENT */}
                    <p className="text-purple-400 text-xs font-black tracking-[0.5em] uppercase mb-8">
                        The Decentralized Skill Share Platform
                    </p>

                    {/* SPECIFIC DETAILS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mb-12">
                        <div
                            className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md cursor-pointer transition-all duration-500 hover:scale-105 hover:bg-white/10 hover:border-purple-500/40 shadow-xl">
                            <h3 className="text-white text-[10px] font-bold tracking-widest uppercase mb-2">share
                                your craft</h3>
                            <p className="text-gray-400 text-[11px] leading-relaxed font-light">
                                Convert your expertise into tradeable assets. Every skill you register becomes a
                                resource on the global node network.
                            </p>
                        </div>
                        <div
                            className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md cursor-pointer transition-all duration-500 hover:scale-105 hover:bg-white/10 hover:border-purple-500/40 shadow-xl">
                            <h3 className="text-white text-[10px] font-bold tracking-widest uppercase mb-2"> Skill
                                Barter</h3>
                            <p className="text-gray-400 text-[11px] leading-relaxed font-light">
                                Use your 10 TC welcome credits to unlock resources from top-tier developers and
                                creators.
                            </p>
                        </div>
                        <div
                            className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md cursor-pointer transition-all duration-500 hover:scale-105 hover:bg-white/10 hover:border-purple-500/40 shadow-xl">
                            <h3 className="text-white text-[10px] font-bold tracking-widest uppercase mb-2"> Node
                                Reputation</h3>
                            <p className="text-gray-400 text-[11px] leading-relaxed font-light">
                                Build your reputation by helping others.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-6">
                        <button
                            onClick={(e) => {
                                // This small delay prevents the "robotic" snap feel
                                e.currentTarget.classList.add('animate-ping');
                                setTimeout(() => setShowIntro(false), 300);
                            }}
                            className="border border-white/20 backdrop-blur-md text-white px-10 py-4 rounded-full font-black text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all uppercase"
                        >
                            Sign in
                        </button>
                        <button
                            onClick={() => setShowWhitepaper(true)}
                            className="border border-white/20 backdrop-blur-md text-white px-10 py-4 rounded-full font-black text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all uppercase"
                        >
                            DESCRIPTION
                        </button>
                    </div>

                </div>
            ) : (
                /* --- YOUR ORIGINAL AUTH BUBBLE CONTENT --- */
                <div
                    className="min-h-screen flex items-center justify-center relative z-10 animate-in fade-in zoom-in-0 duration-2000 ease-out">
                    {/* LOGO (Only shows after entering) */}
                    <div className="absolute top-8 left-10 z-20">
                        <h1 className="font-light text-2xl tracking-widest flex items-center gap-1 text-white">
                            <span>P2P</span><span className="text-purple-500 text-3xl">.</span><span>EXCHANGE</span>
                        </h1>
                    </div>

                    {/* MAIN AUTH BUBBLE WITH POPPING ANIMATION */}
                    <motion.div
                        initial={{scale: 0, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.1
                        }}
                        className="relative z-10 flex flex-col items-center justify-center w-[500px] h-[550px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-[0_0_150px_rgba(168,85,247,0.3)]"
                        style={{
                            /* Kept your original animation as a fallback/secondary layer if needed,
                               but motion.div handles the primary 'pop' */
                            animation: 'formCircle 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                        }}
                    >
                        <div className="w-[65%] flex flex-col items-center">
                            <h2 className="text-gray-200 text-2xl w-full text-left mb-6 font-light tracking-wide pl-2">
                                {isForgotPassword ? 'Recover Access' : (isLogin ? 'Sign in' : '')}
                            </h2>

                            {/* ... rest of your form logic remains exactly the same ... */}
                            {isForgotPassword ? (
                                <form onSubmit={handlePasswordResetRequest}
                                      className="w-full flex flex-col items-center">
                                    <input
                                        className="w-full bg-black/40 border border-white/10 focus:border-purple-500 transition-all rounded-full py-3 pl-6 text-white placeholder-gray-500 outline-none mb-4 text-sm"
                                        type="email"
                                        placeholder="Registered Email"
                                        required
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                    <button type="submit"
                                            className="w-full bg-black/80 hover:bg-black border border-white/10 hover:border-purple-500/50 transition-all text-gray-300 rounded-full py-3 text-[10px] font-bold tracking-widest uppercase">
                                        Send Reset Link
                                    </button>
                                    <button type="button" onClick={() => setIsForgotPassword(false)}
                                            className="mt-6 text-[11px] text-purple-400 font-bold">
                                        Back to Sign in
                                    </button>
                                </form>
                            ) : (
                                <>
                                    <form onSubmit={isLogin ? handleLogin : handleRegister}
                                          className="w-full flex flex-col items-center">
                                        {!isLogin && (
                                            <>
                                                <div className="flex flex-col items-center mb-4">
                                                    <div
                                                        onClick={() => document.getElementById('profileUpload').click()}
                                                        className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 hover:border-purple-500/50 flex items-center justify-center cursor-pointer overflow-hidden transition-all bg-black/20 group">
                                                        {formData.profilePicture ? (
                                                            <div className="relative w-full h-full">
                                                                <img src={formData.profilePicture} alt="Preview"
                                                                     className="w-full h-full object-cover"/>
                                                                <div onClick={removeImage}
                                                                     className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-[8px] font-bold">REMOVE
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center">
                                                                    <span
                                                                        className="text-purple-400 text-lg font-light">+</span>
                                                                <p className="text-[7px] text-gray-500 uppercase tracking-tighter">Photo</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input id="profileUpload" type="file" className="hidden"
                                                           accept="image/*" onChange={handleImageUpload}/>
                                                </div>
                                                <input
                                                    className="w-full bg-black/40 border border-white/10 focus:border-purple-500 rounded-full py-2.5 pl-6 text-white placeholder-gray-500 outline-none mb-3 text-xs transition-all"
                                                    type="text" placeholder="Full Name"
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        fullName: e.target.value
                                                    })}/>
                                                <input
                                                    className="w-full bg-black/40 border border-white/10 focus:border-purple-500 rounded-full py-2.5 pl-6 text-white placeholder-gray-500 outline-none mb-3 text-xs transition-all"
                                                    type="email" placeholder="Email Address" required
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        email: e.target.value
                                                    })}/>
                                            </>
                                        )}

                                        {/* 1. USERNAME FIELD */}
                                        <input
                                            className="w-full bg-black/40 border border-white/10 hover:border-purple-500/40 focus:border-purple-500 transition-all rounded-full py-3 pl-6 text-white placeholder-gray-500 outline-none mb-3 text-sm"
                                            type="text"
                                            placeholder="Username"
                                            required
                                            onChange={(e) => setFormData({...formData, userId: e.target.value})}
                                        />

                                        {/* 2. PASSWORD FIELD WITH SHOW/HIDE */}
                                        <div className="relative w-full mb-4">
                                            <input
                                                className="w-full bg-black/40 border border-white/10 hover:border-purple-500/40 focus:border-purple-500 transition-all rounded-full py-3 pl-6 pr-12 text-white placeholder-gray-500 outline-none text-sm"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                required
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    password: e.target.value
                                                })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-400 transition-colors text-[9px] font-bold uppercase tracking-widest"
                                            >
                                                {showPassword ? "Hide" : "Show"}
                                            </button>
                                        </div>
                                        {/* 4. SUBMIT BUTTON */}
                                        <button type="submit"
                                                className="bg-black/80 hover:bg-black border border-white/10 hover:border-purple-500/50 transition-all text-gray-300 hover:text-white rounded-full py-3 px-12 text-[10px] font-bold tracking-widest uppercase shadow-xl">
                                            {isLogin ? 'Login' : 'Register'}
                                        </button>
                                        {isLogin && <button type="button" onClick={() => setIsForgotPassword(true)}
                                                            className="mt-4 text-[9px] text-gray-500 hover:text-purple-400 font-bold uppercase tracking-widest transition-colors">Forgot
                                            Password?</button>}
                                    </form>
                                    <button onClick={() => setIsLogin(!isLogin)}
                                            className="mt-6 text-[11px] text-purple-400 hover:text-purple-300 font-bold transition-colors">{isLogin ? "Create an account" : "Back to Sign in"}</button>
                                </>
                            )}
                        </div>
                    </motion.div>
                    <div className="absolute bottom-10 left-10 z-50">
                        <button
                            onClick={() => setShowIntro(true)}
                            className="flex items-center gap-2 text-[10px] text-gray-200 hover:text-white border border-white/20 px-5 py-2 rounded-full uppercase tracking-[0.2em] transition-all bg-black/60 backdrop-blur-md shadow-2xl hover:border-purple-500/40"
                        >
                            <span className="text-xs">←</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
export default App;