import React, { useState, useEffect } from "react";
import Playlist from "./Playlist";

export default function Content() {
  const Contentstyle = {
    fontFamily: 'Inter, sans-serif', // Specify Inter as the primary font
  };

  const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  useEffect(() => {
    // Retrieve playlists from localStorage
    const storedPlaylists = JSON.parse(localStorage.getItem("playlists")) || [];
    console.log("storedPlaylists:", storedPlaylists);
    console.log("selectedPlaylistIndex:", selectedPlaylistIndex);

    if (selectedPlaylistIndex !== null) {
      // Retrieve the selected playlist based on the index
      setSelectedPlaylist(storedPlaylists[selectedPlaylistIndex]);
    }
  }, [selectedPlaylistIndex]);

  const handleSelectPlaylist = (index) => {
    setSelectedPlaylistIndex(index);
  };

  return (
    <div>
      <div className="Content--container">
        {/* ... (your existing JSX code) */}
      </div>
      <div className="Content--header" style={Contentstyle}>
        <h3 className="CH--title">{selectedPlaylist ? selectedPlaylist.name : "Playlist Name"}</h3>
        <img className="CH--pic" alt="playlist pic" src={selectedPlaylist ? selectedPlaylist.image : "./images/No-Picture.png"} />
        <div className="CH--details">
          <h3>Songs</h3>
          <h3>•</h3>
          <h3>Length</h3>
        </div>
        <div className="CH--bio">
          <h3>#</h3>
          <h3 className="Bio--Track">Title</h3>
          <h3 className="Bio--Album">Album</h3>
          <h3 className="Bio--Time">Time Added</h3>
          <img src="./images/Clock.png" className="Bio--Clock" alt="playlist clock" />
        </div>
      </div>
      <Playlist onSelectPlaylist={handleSelectPlaylist} />
    </div>
  );
}
