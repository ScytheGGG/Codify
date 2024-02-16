import React, { useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const sidebarStyle = {
  fontFamily: 'Inter, sans-serif', // Specify Inter as the primary font
};

const PlaylistItem = ({ playlist, index, movePlaylist, handleImageChange, deletePlaylist, pinPlaylist, unpinPlaylist }) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: "playlist",
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      movePlaylist(dragIndex, hoverIndex);

      // Note: we're mutating the item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index computations.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "playlist",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;

  return (
    <div ref={(node) => (ref.current = node)} style={{ opacity }}>
      <div ref={(node) => drag(drop(node))} className={`playlist-item ${playlist.pinned ? 'pinned' : ''}`}>
        <img
          src={playlist.image}
          alt={`Playlist ${index}`}
          onClick={() => {
            const fileInput = document.getElementById(`imageInput-${index}`);
            fileInput.click();
          }}
        />
        <div className="playlist-info">
          <span>{playlist.name}</span>
          <div className="playlist-buttons">
            <button onClick={() => (playlist.pinned ? unpinPlaylist(index) : pinPlaylist(index))}>
              {playlist.pinned ? 'Unpin' : 'Pin'}
            </button>
            <button onClick={() => deletePlaylist(index)}>Delete</button>
          </div>
        </div>
        <input
          type="file"
          id={`imageInput-${index}`}
          accept="image/*"
          onChange={(e) => handleImageChange(e, index)}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};

const Playlist = () => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistImage, setNewPlaylistImage] = useState('');

  const createPlaylist = () => {
    if (newPlaylistName.trim() !== '') {
      setPlaylists([
        ...playlists,
        { name: newPlaylistName, songs: [], pinned: false, image: newPlaylistImage || '/images/No-picture.png' },
      ]);
      setNewPlaylistName('');
      setNewPlaylistImage('');
    }
  };

  const pinPlaylist = (index) => {
    const updatedPlaylists = [...playlists];
    const pinnedPlaylist = updatedPlaylists.splice(index, 1)[0];
    pinnedPlaylist.pinned = true;
    updatedPlaylists.unshift(pinnedPlaylist);
    setPlaylists(updatedPlaylists);
  };

  const unpinPlaylist = (index) => {
    const updatedPlaylists = [...playlists];
    const unpinnedPlaylist = updatedPlaylists.splice(index, 1)[0];
    unpinnedPlaylist.pinned = false;
    updatedPlaylists.push(unpinnedPlaylist);
    setPlaylists(updatedPlaylists);
  };

  const deletePlaylist = (index) => {
    const updatedPlaylists = [...playlists];
    updatedPlaylists.splice(index, 1);
    setPlaylists(updatedPlaylists);
  };

  const movePlaylist = (dragIndex, hoverIndex) => {
    const updatedPlaylists = [...playlists];
    const [draggedPlaylist] = updatedPlaylists.splice(dragIndex, 1);
    updatedPlaylists.splice(hoverIndex, 0, draggedPlaylist);
    setPlaylists(updatedPlaylists);
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedPlaylists = [...playlists];
        updatedPlaylists[index].image = reader.result;
        setPlaylists(updatedPlaylists);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="sidebar-container" style={sidebarStyle}>
        <div className="sidebar">
          <h2>Playlists</h2>
          {playlists.map((playlist, index) => (
            <PlaylistItem
              key={index}
              index={index}
              playlist={playlist}
              movePlaylist={movePlaylist}
              handleImageChange={handleImageChange}
              deletePlaylist={deletePlaylist}
              pinPlaylist={pinPlaylist}
              unpinPlaylist={unpinPlaylist}
            />
          ))}
        </div>
        <div className="playlist-form">
          <input
            type="text"
            placeholder="New Playlist"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
          />
          <button onClick={createPlaylist}>Create Playlist</button>
        </div>
      </div>
    </DndProvider>
  );
};

export default Playlist;
