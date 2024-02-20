import React, { useState, useRef, useCallback, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const sidebarStyle = {
  fontFamily: 'Inter, sans-serif',
  position: 'relative',
  width: '250px',
};

const PlaylistItem = ({
  playlist,
  index,
  movePlaylist,
  handleImageChange,
  deletePlaylist,
  pinPlaylist,
  unpinPlaylist,
  onContextMenu,
  onSelect,
  selected,
}) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: "playlist",
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      movePlaylist(dragIndex, hoverIndex);

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

  const [isHovered, setIsHovered] = useState(false);

  const handleContextMenu = useCallback(
    (e) => {
      e.preventDefault();
      onContextMenu(e, index);
      onSelect(index);
    },
    [index, onContextMenu, onSelect]
  );

  const handleClick = () => {
    onSelect(index);

    if (typeof onSelect === 'function') {
      onSelect(index);
    }
  };

  return (
    <div
      ref={(node) => (ref.current = node)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{
        cursor: 'grab',
        opacity: isDragging ? 0 : 1,
        transition: 'background-color 0.3s ease',
      }} 
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

const Playlist = ({ onSelectPlaylist }) => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistImage, setNewPlaylistImage] = useState('');
  const [contextMenuIndex, setContextMenuIndex] = useState(null);
  const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(null);

  useEffect(() => {
    const storedPlaylists = JSON.parse(localStorage.getItem("playlists")) || [];
    setPlaylists(storedPlaylists);
  }, []);

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

  const handleChangePlaylistName = () => {
    const newName = prompt("Enter new playlist name:");
    if (newName !== null) {
      const updatedPlaylists = [...playlists];
      updatedPlaylists[contextMenuIndex].name = newName;
      setPlaylists(updatedPlaylists);
    }
    handleContextMenuClose();
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
    e.preventDefault();
    setContextMenuIndex(index);

    setTimeout(() => {
      const contextMenu = document.getElementById('context-menu');
      if (contextMenu) {
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;

        document.addEventListener('click', handleContextMenuClose);
      }
    }, 0);
  };

  const handleContextMenuClose = () => {
    setContextMenuIndex(null);
    document.removeEventListener('click', handleContextMenuClose);
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
              onSelect={onSelectPlaylist}
              selected={selectedPlaylistIndex === index}
            />
          ))}
        </div>
        {contextMenuIndex !== null && (
          <div id="context-menu" className="context-menu" style={{ left: '0', top: '0' }}>
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