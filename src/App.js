import React, { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { configureStore, createSlice, createAsyncThunk } from "@reduxjs/toolkit";



/* ---------------- MOCK API ---------------- */
const fetchSongsAPI = async () => {

  return [
    {
      id: 1,
      title: "Believer",
      artist: "Imagine Dragons",
      genre: "Rock",
      image: "/images/believer.jpeg",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    {
      id: 2,
      title: "Shape of You",
      artist: "Ed Sheeran",
      genre: "Pop",
      image: "/images/shape of you.jpeg",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    {
      id: 3,
      title: "Faded",
      artist: "Alan Walker",
      genre: "EDM",
      image: "/images/faded.jpeg",
      audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
  ];
};

/* ---------------- REDUX ---------------- */
const fetchSongs = createAsyncThunk("music/fetchSongs", async () => {
  return await fetchSongsAPI();
});

const musicSlice = createSlice({
  name: "music",
  initialState: {
    songs: [],
    activeSong: null,
    genre: "All",
    isPlaying: false,
    loading: false,
    error: null,
  },
  reducers: {
    setActiveSong: (state, action) => {
      state.activeSong = action.payload;
      state.isPlaying = true;
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setGenre: (state, action) => {
      state.genre = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSongs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSongs.fulfilled, (state, action) => {
        state.loading = false;
        state.songs = action.payload;
      })
      .addCase(fetchSongs.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load songs";
      });
  },
});

const { setActiveSong, togglePlay, setGenre } = musicSlice.actions;

const store = configureStore({
  reducer: {
    music: musicSlice.reducer,
  },
});

/* ---------------- COMPONENTS ---------------- */

const Sidebar = () => {
  const dispatch = useDispatch();
  const genres = ["All", "Rock", "Pop", "EDM"];

  return (
    <div style={styles.sidebar}>
      <h2>🎵 Spotify</h2>
      {genres.map((g) => (
        <button key={g} onClick={() => dispatch(setGenre(g))}>
          {g}
        </button>
      ))}
    </div>
  );
};

const SongCard = ({ song }) => {
  const dispatch = useDispatch();
  return (
    <div style={styles.card} onClick={() => dispatch(setActiveSong(song))}>
      <img
  src={song.image}
  alt={song.title}
  style={{
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "8px",
  }}
/>
</div>
  );
};

const TopPlay = () => {
  const { activeSong, isPlaying } = useSelector((state) => state.music);
  const dispatch = useDispatch();

  if (!activeSong)
    return <div style={styles.topPlay}>Select a song</div>;

  return (
    <div style={styles.topPlay}>
      <h3>Now Playing</h3>
      <p>{activeSong.title}</p>
      <button onClick={() => dispatch(togglePlay())}>
        {isPlaying ? "Pause" : "Play"}
      </button>
      {isPlaying && <audio src={activeSong.audio} autoPlay controls />}
    </div>
  );
};

/* ---------------- MAIN APP ---------------- */
const MusicApp = () => {
  const dispatch = useDispatch();
  const { songs, genre, loading, error } = useSelector((state) => state.music);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    dispatch(fetchSongs());
  }, [dispatch]);

  const filteredSongs =
    genre === "All" ? songs : songs.filter((s) => s.genre === genre);

  return (
    <div style={{ ...styles.app, background: dark ? "#180f9dff" : "#f4f4f4" }}>
      <button onClick={() => setDark(!dark)} style={styles.themeBtn}>
        🌗 Toggle Theme
      </button>

      <div style={styles.container}>
        <Sidebar />

        <div style={styles.main}>
          {loading && <p>Loading...</p>}
          {error && <p>{error}</p>}

          <div style={styles.grid}>
            {filteredSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </div>

        <TopPlay />
      </div>
    </div>
  );
};

/* ---------------- STYLES ---------------- */
const styles = {
  app: { minHeight: "100vh", padding: "10px" },
  container: { display: "flex", gap: "10px" },
  sidebar: {
    width: "200px",
    background: "#1db954",
    padding: "10px",
    color: "white",
  },
  main: { flex: 1 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    card: {
  background: "white",
  padding: "10px",
  cursor: "pointer",
  borderRadius: "10px",
  textAlign: "center",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
},
  },
  topPlay: {
    width: "200px",
    background: "#222",
    color: "white",
    padding: "10px",
  },
  themeBtn: { marginBottom: "10px" },
};

/* ---------------- EXPORT ---------------- */
export default function App() {
  return (
    <Provider store={store}>
      <MusicApp />
    </Provider>
  );
}