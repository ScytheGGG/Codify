import React, { useState, useRef, useCallback, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const sidebarStyle = {
  fontFamily: 'Inter, sans-serif', // Specify Inter as the primary font
  position: 'relative', // Add position relative for proper placement of the "+" button
  width: '250px', // Fixed width for the sidebar
};

const PlaylistItem = ({ playlist, index, movePlaylist, handleImageChange, deletePlaylist, pinPlaylist, unpinPlaylist, onContextMenu }) => {
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

      // Only perform the move when the mouse has crossed half of the item's height
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

  const handleContextMenu = useCallback(
    (e) => {
      e.preventDefault();
      onContextMenu(e, index);
    },
    [index, onContextMenu]
  );

  return (
    <div
      ref={(node) => (ref.current = node)}
      style={{ opacity, cursor: 'grab' }}
      onContextMenu={handleContextMenu}
    >
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
  const [contextMenuIndex, setContextMenuIndex] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // Retrieve playlists from localStorage on component mount
  useEffect(() => {
    const storedPlaylists = JSON.parse(localStorage.getItem("playlists")) || [];
    setPlaylists(storedPlaylists);
  }, []);

  // Save playlists to localStorage whenever playlists change
  useEffect(() => {
    localStorage.setItem("playlists", JSON.stringify(playlists));
  }, [playlists]);

  const createPlaylist = () => {
    if (playlists.length < 5 || (playlists.length === 0 && newPlaylistName.trim() !== '')) {
      const defaultPlaylistName = `Your Playlist #${playlists.length + 1}`;
      setPlaylists([
        ...playlists,
        { name: newPlaylistName || defaultPlaylistName, songs: [], pinned: false, image: newPlaylistImage || '/images/No-picture.png' },
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

  const handleContextMenu = (e, index) => {
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuIndex(index);
    document.addEventListener('click', handleContextMenuClose);
  };

  const handleContextMenuClose = () => {
    setContextMenuIndex(null);
    document.removeEventListener('click', handleContextMenuClose);
  };

  const handleChangePlaylistName = () => {
    const newName = prompt("Enter new playlist name:");
    if (newName !== null) {
      const updatedPlaylists = [...playlists];
      updatedPlaylists[contextMenuIndex].name = newName;
      setPlaylists(updatedPlaylists);
    }
    handleContextMenuClose();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="sidebar--box"></div>
      <div className="sidebar-container" style={sidebarStyle}>
        <div className="sidebar">
          <h2 className="sidebar--title">Library</h2>
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
              onContextMenu={handleContextMenu}
            />
          ))}
        </div>
        {contextMenuIndex !== null && (
          <div id="context-menu" className="context-menu" style={{ left: `${contextMenuPosition.x}px`, top: `${contextMenuPosition.y}px` }}>
            <div onClick={handleChangePlaylistName}>Change Playlist Name</div>
            <div>Add to queue</div>
          </div>
        )}
        <div className="add-playlist-button" onClick={createPlaylist}>
          +
        </div>
      </div>
    </DndProvider>
  );
};

export default Playlist;
