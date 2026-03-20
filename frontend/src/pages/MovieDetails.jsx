import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { getMovieVerdict } from "../utils/movieStatus";
import MovieCard from "../components/MovieCard"

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

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const OTHER_DATA_API_KEY = import.meta.env.VITE_OMDB_API_KEY;

  useEffect(() => {
    fetchMovie();
  }, [id]);

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  useEffect(() => {
  if (movie && movie.Genre) {
    fetchRecommendations();
  }
}, [movie]);

  const fetchMovie = async () => {
    setLoading(true);

    const res = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`
    );

    const data = await res.json();
    setMovie(data);

    fetchTrailer(id); // updated
    fetchRecommendations(id);

    setLoading(false);
  };
  
  const fetchMovieDetails = async () => {
    try {
        setLoadingDetails(true);

        // 🔹 STEP 1: Get IMDb ID from TMDB
        const res1 = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/external_ids?api_key=${API_KEY}`
        );

        const data1 = await res1.json();
        const imdbID = data1.imdb_id;

        if (!imdbID) {
        console.log("No IMDb ID found");
        setLoadingDetails(false);
        return;
        }

        // 🔹 STEP 2: Fetch OMDb data using IMDb ID
        const res2 = await fetch(
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

  const fetchTrailer = async (id) => {
    try {
        const res = await fetch(
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

  const getExplanation = async () => {
  try {
    setAiLoading(true);
    setExplanation("");

    const res = await fetch("https://api.moviesearch.bharatjoshi.xyz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: movie.title,
        plot: movie.Plot,
      }),
    });

    const data = await res.json();

    setExplanation(data.explanation);
    } catch (err) {
        console.error(err);
        setExplanation("Something went wrong 😔");
    } finally {
        setAiLoading(false);
    }
  };

  const fetchRecommendations = async (id) => {
    try {
        const res = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${API_KEY}`
        );

        const data = await res.json();
        setRecommendations(data.results || []);
    } catch (err) {
        console.log(err);
    }
  };

  if (loading) return <Loader />;
  if(!movie) return null;

  return (
    <div className="min-h-screen bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 text-white">
        
        <Navbar />

        <div className="p-6 grid md:grid-cols-3 gap-6">
            
            {/* Poster */}
            <div>
                {movie.poster_path !== "N/A" ? (
                    <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="rounded-lg shadow-lg w-full"
                    />
                ) : (
                    <div className="w-full h-96 bg-gray-700 flex items-center justify-center">
                    No Image
                    </div>
                )}

                {/* Plot */}
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-1">Plot</h2>
                    <p className="text-gray-300">{movieDetails?.Plot}</p>
                </div>

                <div className="mt-6">
                    <button
                        onClick={getExplanation}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
                    >
                        🤖 Explain Movie
                    </button>

                    {aiLoading && (
                        <p className="mt-2 text-gray-400 animate-pulse">
                        Thinking...
                        </p>
                    )}

                    {explanation && (
                        <div className="mt-4 bg-gray-800 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Explanation</h3>
                        <p className="text-gray-300">{explanation}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Details */}
            <div className="md:col-span-2 space-y-4">
            <h1 className="text-3xl font-bold">{movie.title}</h1>

            {trailer && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">🎬 Trailer</h2>

                    <div className="aspect-video">
                    <iframe
                        className="w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${trailer}`}
                        title="Movie Trailer"
                        allowFullScreen
                    ></iframe>
                    </div>
                </div>
            )}

            <p className="text-gray-400">
                {movie.release_date} • {movie.runtime} min •{" "} 
                {movie.genres?.map(g => g.name).join(", ")}
            </p>

            <p>{movie.overview}</p>

            {/* Ratings */}
            <div className="flex gap-4 flex-wrap">
                {movieDetails?.Ratings?.map((rating, index) => (
                <div
                    key={index}
                    className="bg-gray-800 px-3 py-2 rounded"
                >
                    <p className="text-sm text-gray-400">{rating.Source}</p>
                    <p className="font-semibold">{rating.Value}</p>
                </div>
                ))}
                <div className="bg-gray-800 px-3 py-2 rounded">
                    <p className="text-sm text-gray-400">📊 Verdic</p>
                    <p className="font-semibold">{" "}{getMovieVerdict(movieDetails?.BoxOffice)}</p>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <p><span className="font-semibold">🎭 Actors:</span> {movieDetails?.Actors}</p>
                <p><span className="font-semibold">🎬 Director:</span> {movieDetails?.Director}</p>
                <p><span className="font-semibold">✍️ Writer:</span> {movieDetails?.Writer}</p>
                <p><span className="font-semibold">🌐 Language:</span> {movieDetails?.Language}</p>
                <p><span className="font-semibold">🏆 Awards:</span> {movieDetails?.Awards}</p>
                <p><span className="font-semibold">💰 Box Office:</span> {movieDetails?.BoxOffice}</p>
            </div>

            </div>

        </div>

        <div className="mt-12 px-4 md:px-6 gap-6 mb-3">
            {/* Title */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-wide">
                Recommended 🎯
                </h2>

                <span className="text-sm text-gray-400">
                Based on this movie
                </span>
            </div>

            {/* Content */}
            {recommendations.length === 0 ? (
                <p className="text-center text-gray-400 py-10">
                No recommendations found 😔
                </p>
            ) : (
                <div className="grid 
                grid-cols-2 
                sm:grid-cols-3 
                md:grid-cols-4 
                lg:grid-cols-5 
                gap-6"
                >
                {recommendations.map((movie) => (
                    <div
                    key={movie.id}
                    className="transform hover:scale-105 transition duration-300 ease-in-out"
                    >
                    <MovieCard movie={movie} />
                    </div>
                ))}
                </div>
            )}
        </div>
            
    </div>
  );
}

export default MovieDetails;