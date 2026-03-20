import { useEffect, useState } from "react";
import { getFavorites } from "../utils/favorites";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";

const Favorites = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    setMovies(getFavorites());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      
      <Navbar />

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Your Favorites ❤️
        </h2>

        {movies.length === 0 ? (
          <p className="text-center text-gray-400 text-lg">
            No favorites yet 😔
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.imdbID} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;