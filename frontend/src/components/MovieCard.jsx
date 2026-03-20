import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { isFavorite, toggleFavorite } from "../utils/favorites";

function MovieCard({ movie }) {
  const [isValidImage, setIsValidImage] = useState(false);
  const [fav, setFav] = useState(false);
  
  const imageUrl = movie.poster_path
  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
  : null;
  
  useEffect(()=>{
    setFav(isFavorite(movie.id));
  }, [movie.id])

  useEffect(() => {
    if (!imageUrl) {
      setIsValidImage(false);
      return;
    }

    const img = new Image();
    img.src = imageUrl;

    img.onload = () => setIsValidImage(true);
    img.onerror = () => setIsValidImage(false);
  }, [imageUrl]);

  const handleFavorite = () => {
  const updated = toggleFavorite(movie);
  setFav(updated);
};

  return (
    <div className="group relative bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition duration-300">
    
      <button
        onClick={handleFavorite}
        className="absolute top-2 right-2 text-xl z-10"
        >
        {fav ? "❤️" : "🤍"}
      </button>

      {isValidImage ? (
        <img
          src={imageUrl}
          alt={movie.title}
          className="w-full h-72 object-cover"
        />
      ) : (
        <div className="w-full h-72 bg-gray-700 flex items-center justify-center text-gray-400 text-lg">
          No Image
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3">
        <h3 className="text-lg font-semibold">{movie.title}</h3>
        <p className="text-gray-300 text-sm">{movie.release_date?.split("-")[0]}</p>

        <Link
          to={`/movie/${movie.id}`}
          className="mt-2 text-red-400 hover:underline"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}

export default MovieCard;