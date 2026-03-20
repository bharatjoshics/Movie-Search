// Get favorites
export const getFavorites = () => {
  return JSON.parse(localStorage.getItem("favorites")) || [];
};

// Save favorites
export const saveFavorites = (favorites) => {
  localStorage.setItem("favorites", JSON.stringify(favorites));
};

// Toggle favorite
export const toggleFavorite = (movie) => {
  const favorites = getFavorites();

  const exists = favorites.find((m) => m.imdbID === movie.imdbID);

  if (exists) {
    const updated = favorites.filter((m) => m.imdbID !== movie.imdbID);
    saveFavorites(updated);
    return false;
  } else {
    favorites.push(movie);
    saveFavorites(favorites);
    return true;
  }
};

// Check if favorite
export const isFavorite = (id) => {
  const favorites = getFavorites();
  return favorites.some((m) => m.imdbID === id);
};