import { useState, useEffect, useRef } from "react";
import MovieCard from "../components/MovieCard";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";

function Home() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNote, setShowNote] = useState(true);

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  const cache = useRef({});
  const controllerRef = useRef(null);

  // ✅ TIMEOUT
  const fetchWithTimeout = (url, options = {}, timeout = 8000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), timeout)
      ),
    ]);
  };

  useEffect(() => {
    const trimmedQuery = query.trim();

    // ❌ clear if small
    if (trimmedQuery.length < 3) {
      setMovies([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchMovies(trimmedQuery);
    }, 500); // debounce

    return () => clearTimeout(timer);
  }, [query]);

  const fetchMovies = async (searchQuery) => {
    try {
      setError("");

      // ✅ CACHE HIT
      if (cache.current[searchQuery]) {
        setMovies(cache.current[searchQuery]);
        return;
      }

      setLoading(true);

      // ✅ CANCEL PREVIOUS REQUEST
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      const controller = new AbortController();
      controllerRef.current = controller;

      const res = await fetchWithTimeout(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${searchQuery}`,
        { signal: controller.signal }
      );

      const data = await res.json();

      const results = data.results || [];

      // ✅ STORE IN CACHE
      cache.current[searchQuery] = results;

      setMovies(results);

    } catch (err) {
      if (err.name === "AbortError") return;

      console.log("Error:", err);
      setMovies([]);

      if (err.message === "Request timeout") {
        setError("Slow network ⚠️ Try again");
      } else {
        setError("Something went wrong 😔");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">

      <Navbar />

      {/* SEARCH */}
      <div className="flex justify-center mt-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies..."
          className="px-4 py-2 w-72 md:w-96 rounded-md text-black outline-none"
        />
      </div>

      {showNote && (
        <div className="text-center text-yellow-400 text-sm mt-3">
            ⚠️ Recommended to use high speed internet such as 5G Mobile Data or WiFi 
  for a better and smooth experience
            <button
            onClick={() => setShowNote(false)}
            className="ml-3 text-white underline"
            >
            Hide
            </button>
        </div>
      )}

      {/* CONTENT */}
      <div className="p-6">

        {/* ERROR */}
        {error && (
          <p className="text-center text-red-400 text-lg mt-6">{error}</p>
        )}

        {/* EMPTY */}
        {query.trim() === "" ? (
          <p className="text-center text-gray-400 text-lg mt-10 animate-pulse">
            Start typing to search movies 🎬
          </p>

        ) : query.trim().length < 3 ? (
          <p className="text-center text-gray-400 text-lg mt-10">
            Type at least 3 characters 🔍
          </p>

        ) : loading && movies.length === 0 ? (
          // ✅ SHOW LOADER ONLY FIRST TIME
          <Loader />

        ) : movies.length === 0 ? (
          <p className="text-center text-gray-400 text-lg mt-10">
            No movies found 😔
          </p>

        ) : (
          <>
            {/* ✅ SMALL LOADING INDICATOR (BETTER UX) */}
            {loading && (
              <p className="text-center text-gray-500 mb-4 animate-pulse">
                Updating results...
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;