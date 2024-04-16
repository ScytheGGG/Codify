import React from "react";

export default function Header() {
        const headerStyle = {
                fontFamily: 'Inter, sans-serif', // Specify Inter as the primary font
        };

        return (
                <nav className="Navbar" style={headerStyle}>
                        <div className="Navbar--left">
                                <img src="/images/Codify-No_Background.png" alt="Codify logo" style={{ width: '90px', height: 'auto' }}/>
                        </div>
                        <div className="Navbar--center">
                                <input className="Navbar--search" type="text" placeholder="What do you want to play?" />
                        </div>
                </nav>
        )
}