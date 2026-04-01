function Footer() {
  return (
    <footer className="mt-12 bg-gray-950 text-gray-400 text-sm py-6 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        
        {/* Left */}
        <p>
          © {new Date().getFullYear()} CineMind. All rights reserved. Created with ❤️ By Bharat Joshi
        </p>

        {/* Right */}
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
          <p>
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
          <p>
            Data also provided by OMDb API.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;