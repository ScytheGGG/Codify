import React from "react"

// website elements
import Playlist from "./Playlist"
import PlaylistItem from "./Playlist"

export default function Content() {
        const Contentstyle = {
                fontFamily: 'Inter, sans-serif', // Specify Inter as the primary font
        };

        return (
                <div>
                        <div className="Content--container"></div>
                        <div className="Content--header" style={Contentstyle}>
                                <h3 className="CH--title">Playlist Name</h3>
                                <img className="CH--pic" alt="playlist pic" src="./images/No-Picture.png"></img>
                                <div className="CH--bio">
                                        <h3>#</h3>
                                        <h3 className="Bio--Track">Title</h3>
                                        <h3 className="Bio--Album">Album</h3>
                                        <h3 className="Bio--Time">Time Added</h3>
                                        <h3 className="Bio--Clock">🕒</h3>
                                </div>
                        </div>
                </div>
        )
}