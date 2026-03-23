import { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";

function Home() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  useEffect(() => {
    const timer = setTimeout(() => {
        if (query.trim().length >= 3) {
        fetchMovies();
        } else {
        setMovies([]); // clear results
        }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchWithTimeout = (url, options = {}, timeout = 8000) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), timeout)
        ),
    ]);
  };

  const fetchMovies = async () => {
    if (query.trim().length < 3) {
        setMovies([]);
        return;
    }
    try{
        setError("");
        setLoading(true);

        const res = await fetchWithTimeout(
            `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`
        );

        const data = await res.json();

        setMovies(data.results || []); // ✅ TMDB format
   }catch(err){
    console.log("Error: ", err);
    setMovies([]);

    if(err.message === "Request timeout")
        setError("SLow network ⚠️ Please try again");
    else
        setError("Something went wrong 😔");
  }
  finally{
     setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
        
        {/* Navbar */}
        <Navbar />

        {/* Search Section */}
        <div className="flex justify-center mt-6 gap-3">
        <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies..."
            className="px-4 py-2 w-72 rounded-md text-black outline-none"
        />

        </div>

        {/* Content */}
        <div className="p-6">
            {error && (
                <p className="text-center text-red-400 text-lg mt-6">{error}</p>
            )}
            {query.trim() === "" ? (
                <p className="text-center text-gray-400 text-lg mt-10 animate-pulse">
                Start typing to search movies 🎬
                </p>

            ) : query.trim().length < 3 ? (
                <p className="text-center text-gray-400 text-lg mt-10">
                Type at least 3 characters 🔍
                </p>

            ) : loading ? (
                <Loader />

            ) : movies.length === 0 ? (
                <p className="text-center text-gray-400 text-lg mt-10">
                No movies found 😔
                </p>

            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
                </div>
            )}
        </div>
    </div>
 );
}
export default Home;