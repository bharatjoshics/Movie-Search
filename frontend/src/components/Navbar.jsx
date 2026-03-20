import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="flex justify-between items-center px-6 py-4 bg-black/40 backdrop-blur-md">
      
      <Link to="/" className="text-2xl font-bold text-red-500">
        MovieApp
      </Link>

      <Link
        to="/favorites"
        className="text-white hover:text-red-400 transition"
      >
        Favorites ❤️
      </Link>

    </div>
  );
}

export default Navbar;