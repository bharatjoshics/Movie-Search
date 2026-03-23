import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { getMovieVerdict } from "../utils/movieStatus";
import MovieCard from "../components/MovieCard";

function MovieDetails() {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [trailer, setTrailer] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const OTHER_DATA_API_KEY = import.meta.env.VITE_OMDB_API_KEY;

  useEffect(() => {
    fetchMovie();
  }, [id]);

  // ✅ TIMEOUT HELPER
  const fetchWithTimeout = (url, options = {}, timeout = 8000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), timeout)
      ),
    ]);
  };

  // ✅ MAIN FETCH (ONLY THIS CONTROLS LOADER)
  const fetchMovie = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetchWithTimeout(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`
      );

      const data = await res.json();
      setMovie(data);

      // 🚀 NON-BLOCKING CALLS
      fetchTrailer(id);
      fetchRecommendations(id);
      fetchMovieDetails(data);

    } catch (err) {
      console.log(err);
      setError("Failed to load movie 😔");
    } finally {
      setLoading(false); // ✅ ALWAYS STOP LOADING
    }
  };

  // ✅ OMDb FETCH (FIXED)
  const fetchMovieDetails = async (movieData) => {
    try {
      setLoadingDetails(true);

      // 1. Get IMDb ID
      const res1 = await fetchWithTimeout(
        `https://api.themoviedb.org/3/movie/${movieData.id}/external_ids?api_key=${API_KEY}`
      );

      const data1 = await res1.json();
      const imdbID = data1.imdb_id;

      if (!imdbID) return;

      // 2. Fetch OMDb
      const res2 = await fetchWithTimeout(
        `https://www.omdbapi.com/?apikey=${OTHER_DATA_API_KEY}&i=${imdbID}&plot=full`
      );

      const data2 = await res2.json();
      setMovieDetails(data2);

    } catch (err) {
      console.log(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // ✅ TRAILER
  const fetchTrailer = async (id) => {
    try {
      const res = await fetchWithTimeout(
        `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`
      );

      const data = await res.json();

      const trailer = data.results.find(
        (vid) => vid.type === "Trailer" && vid.site === "YouTube"
      );

      setTrailer(trailer?.key);

    } catch (err) {
      console.log(err);
    }
  };

  // ✅ RECOMMENDATIONS
  const fetchRecommendations = async (id) => {
    try {
      const res = await fetchWithTimeout(
        `https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${API_KEY}`
      );

      const data = await res.json();
      setRecommendations(data.results || []);

    } catch (err) {
      console.log(err);
    }
  };

  // ✅ AI
  const getExplanation = async () => {
    try {
      setAiLoading(true);
      setExplanation("");

      const res = await fetchWithTimeout(
        "https://api.moviesearch.bharatjoshi.xyz/api/explain",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: movie.title,
            plot: movieDetails?.Plot || movie.overview,
          }),
        }
      );

      const data = await res.json();
      setExplanation(data.explanation);

    } catch (err) {
      console.error(err);
      setExplanation("Something went wrong 😔");
    } finally {
      setAiLoading(false);
    }
  };

  // ✅ BETTER LOADING LOGIC
  if (loading) return <Loader />;
  if (!movie) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      <Navbar />

      {/* ERROR */}
      {error && (
        <p className="text-center text-red-400 mt-4">{error}</p>
      )}

      <div className="p-6 grid md:grid-cols-3 gap-6">

        {/* LEFT */}
        <div>
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="rounded-lg w-full"
          />

          {/* Plot */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-1">Plot</h2>
            <p className="text-gray-300">
              {movieDetails?.Plot || "Loading plot..."}
            </p>
          </div>

          {/* AI */}
          <div className="mt-6">
            <button
              onClick={getExplanation}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              🤖 Explain Movie
            </button>

            {aiLoading && <p className="mt-2 text-gray-400">Thinking...</p>}

            {explanation && (
              <div className="mt-4 bg-gray-800 p-4 rounded-lg">
                <p>{explanation}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-3xl font-bold">{movie.title}</h1>

          {trailer && (
            <iframe
              className="w-full h-64 rounded-lg"
              src={`https://www.youtube.com/embed/${trailer}`}
              allowFullScreen
            />
          )}

          <p className="text-gray-400">
            {movie.release_date} • {movie.runtime} min •{" "}
            {movie.genres?.map(g => g.name).join(", ")}
          </p>

          <p>{movie.overview}</p>

          {/* DETAILS */}
          <div className="grid sm:grid-cols-2 gap-4">
            <p>🎭 {movieDetails?.Actors || "Loading..."}</p>
            <p>🎬 {movieDetails?.Director || "Loading..."}</p>
            <p>💰 {movieDetails?.BoxOffice || "Loading..."}</p>
          </div>
        </div>
      </div>

      {/* RECOMMENDED */}
      <div className="p-6">
        <h2 className="text-2xl mb-4">Recommended 🎯</h2>

        {recommendations.length === 0 ? (
          <p className="text-gray-400">Loading recommendations...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default MovieDetails;