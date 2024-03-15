// src/components/NavBar.js
import React, { useContext, useState } from 'react';
import GlobalContext from '../utils/globalProcess';

const NavBar = () => {
    const { globalState } = useContext(GlobalContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleHomeClick = () => {
        window.location.hash = ''; // Clear the hash
        window.location.reload(); // Force the page to reload
    };

    const handleGameClick = () => {
        window.location.hash = 'game';
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const processes = globalState.processes || [];

    return (
        <nav style={{ backgroundColor: '#333', color: '#fff', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
                <a onClick={handleHomeClick} style={{ cursor: 'pointer', color: '#fff', textDecoration: 'none' }}>
                    Home
                </a>
                {'  |  '}
                <a onClick={handleGameClick} style={{ cursor: 'pointer', color: '#fff', textDecoration: 'none' }}>
                    Game
                </a>
            </div>
            <div>
                {processes.length > 5 ? (
                    <button onClick={toggleMenu} style={{ color: '#fff', backgroundColor: '#555' }}>
                        ☰
                    </button>
                ) : (
                    processes.map(process => (
                        <a key={process.id} href={`/#process/${process.id}`} style={{ color: '#fff', textDecoration: 'none', marginLeft: '10px' }}>
                            {process.tags.find(tag => tag.name === "Name")?.value || process.id}
                        </a>
                    ))
                )}
                {isMenuOpen && (
                    <div style={{ position: 'absolute', right: '10px', backgroundColor: '#555', padding: '10px', marginTop: '10px' }}>
                        {processes.map(process => (
                            <div key={process.id}>
                                <a href={`/#process/${process.id}`} style={{ color: '#fff', textDecoration: 'none' }}>
                                    {process.tags.find(tag => tag.name === "Name")?.value || process.id}
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
