import { Link, useNavigate, useLocation } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const scrollToId = (id) => {
    if (pathname !== "/" && pathname !== "/welcome") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToBlogSection = (id) => {
    if (pathname !== "/blog") {
      navigate("/blog");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer className="bg-black text-white px-6 md:px-16 py-8 font-inter">
      <div className="grid md:grid-cols-5 gap-10">
        {/* Logo + Description */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <i className="fa-solid fa-palette text-2xl text-[#F5C518]"></i>
            <h2 className="font-semibold text-lg">ArtisanBridge</h2>
          </div>

          <p className="text-gray-400 text-sm mb-6">
            The world’s marketplace for original art and creative talent.
          </p>

          {/* Social Icons */}
          <div className="flex gap-3">
            <div className="w-9 h-9 border border-gray-700 rounded-md flex items-center justify-center hover:border-yellow-500 hover:text-yellow-500 transition cursor-pointer">
              <i className="fa-brands fa-telegram"></i>
            </div>
            <div className="w-9 h-9 border border-gray-700 rounded-md flex items-center justify-center hover:border-yellow-500 hover:text-yellow-500 transition cursor-pointer">
              <i className="fa-brands fa-facebook"></i>
            </div>
            <div className="w-9 h-9 border border-gray-700 rounded-md flex items-center justify-center hover:border-yellow-500 hover:text-yellow-500 transition cursor-pointer">
              <i className="fa-brands fa-linkedin"></i>
            </div>
            <div className="w-9 h-9 border border-gray-700 rounded-md flex items-center justify-center hover:border-yellow-500 hover:text-yellow-500 transition cursor-pointer">
              <i className="fa-brands fa-yahoo"></i>
            </div>
          </div>
        </div>

        {/* Platform */}
        <div>
          <h3 className="text-sm font-semibold mb-4">PLATFORM</h3>
          <ul className="flex flex-col gap-3 text-gray-400 text-sm">
            <Link to="/artists">
              <li className="hover:text-yellow-500 cursor-pointer">Browse Artists</li>
            </Link>
            <Link to="/get-started">
              <li className="hover:text-yellow-500 cursor-pointer">Post a Project</li>
            </Link>
            <li onClick={() => scrollToId("how-it-works")} className="hover:text-yellow-500 cursor-pointer">How It Works</li>
            <li onClick={() => scrollToId("pricing")} className="hover:text-yellow-500 cursor-pointer">Pricing</li>
          </ul>
        </div>

        {/* Artists */}
        <div>
          <h3 className="text-sm font-semibold mb-4">ARTISTS</h3>
          <ul className="flex flex-col gap-3 text-gray-400 text-sm">
            <Link to="/get-started">
              <li className="hover:text-yellow-500 cursor-pointer">Join as Artist</li>
            </Link>
            <li className="hover:text-yellow-500 cursor-pointer">Artist Resources</li>
            <li onClick={() => scrollToBlogSection("success-stories")} className="hover:text-yellow-500 cursor-pointer">Success Stories</li>
            <li className="hover:text-yellow-500 cursor-pointer">Payouts</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4">COMPANY</h3>
          <ul className="flex flex-col gap-3 text-gray-400 text-sm">
            <Link to="/about">
              <li className="hover:text-yellow-500 cursor-pointer">About Us</li>
            </Link>
            <li className="hover:text-yellow-500 cursor-pointer">Careers</li>
            <li className="hover:text-yellow-500 cursor-pointer">Press</li>
            <li onClick={() => scrollToBlogSection("success-stories")} className="hover:text-yellow-500 cursor-pointer">Blog</li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-sm font-semibold mb-4">LEGAL</h3>
          <ul className="flex flex-col gap-3 text-gray-400 text-sm">
            <li className="hover:text-yellow-500 cursor-pointer">Privacy Policy</li>
            <li className="hover:text-yellow-500 cursor-pointer">Terms of Service</li>
            <li className="hover:text-yellow-500 cursor-pointer">Cookie Policy</li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800 mt-12 pt-6 text-center text-gray-500 text-sm">
        © 2026 ArtisanBridge. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
