import React from "react";

export default function Header() {
        const headerStyle = {
                fontFamily: 'Inter, sans-serif', // Specify Inter as the primary font
        };

        return (
                <nav className="Navbar" style={headerStyle}>
                        <img src="/images/Codify-No_Background.png" alt="Codify logo" style={{ width: '90px', height: 'auto' }}/>
                        <h2 className="Navbar--home">Home</h2>
                        <h2 className="Navbar--library">Library</h2>
                </nav>
        )
}