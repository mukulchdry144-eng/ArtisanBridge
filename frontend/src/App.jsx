import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Hero from "./components/Hero";
import ExploreCategory from "./components/ExploreCategory";
import Artworks from "./components/Artworks";
import Procedure from "./components/Procedure";
import TopArtists from "./components/TopArtists";
import Testimonials from "./components/Testimonials";
import Subscription from "./components/Subscription";
import Ready from "./components/Ready";
import Qna from "./components/Qna";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import SignIn from "./Pages/SignIn";
import ForgotPassword from "./Pages/ForgotPassword";
import GetStarted from "./Pages/GetStarted";
import SignUp from "./Pages/SignUp";
import ArtistProjects from "./Pages/ArtistProjects";
import Dashboard from "./Pages/Dashboard";
import ClientDashboard from "./Pages/ClientDashboard";
import FreelancerDashboard from "./Pages/FreelancerDashboard";
import AdminLogin from "./Pages/AdminLogin";
import AdminDashboard from "./Pages/AdminDashboard";
import Artists from "./Pages/Artists";
import ArtistProfile from "./Pages/ArtistProfile";
import Payment from "./Pages/Payment";
import AboutUs from "./Pages/AboutUs";
import Blog from "./Pages/Blog";

function Home() {
  return (
    <>
      <div id="hero">
        <Hero />
      </div>
      <div id="discover-artists">
        <ExploreCategory />
      </div>
      <div id="browse-artworks">
        <Artworks />
      </div>
      <div id="how-it-works">
        <Procedure />
      </div>
      <div id="top-artists">
        <TopArtists />
      </div>
      <div id="testimonials">
        <Testimonials />
      </div>
      <div id="pricing">
        <Subscription />
      </div>
      <div id="ready">
        <Ready />
      </div>
      <div id="qna">
        <Qna />
      </div>
    </>
  );
}

function AppShell() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/client-dashboard") ||
    pathname.startsWith("/freelancer-dashboard");

  return (
    <>
      <ScrollToTop />
      {!isAdminRoute && !isDashboardRoute ? <Header /> : null}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/welcome" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/artist-projects" element={<ArtistProjects />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/artist/:id" element={<ArtistProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>

      {!isAdminRoute && !isDashboardRoute ? <Footer /> : null}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
