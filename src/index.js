import React from 'react';
import ReactDOM from 'react-dom/client';

// if I want to import a section of the webpage from another file, all I have to do is
// import (element name) from "./element"
import App from './App';
import './style.css';

// - - - - - - - - - - -

// OLD - ReactDOM.render(item, document.getElementByID("root"))
// New - ReactDOM.createRoot(document.getElementById("root")).render(item)

// Best way
// const root = ReactDOM.createRoot(document.getElementById("item"))
// root.render(item)
document.addEventListener('contextmenu', event => event.preventDefault());

ReactDOM.createRoot(document.getElementById("root")).render(<App />)