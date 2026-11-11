// src/App.jsx
import { lazy, Suspense } from "react";
// import Lenis from "lenis";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
const Events = lazy(() => import("./pages/Events"));
const AddVideo = lazy(() => import("./pages/AddVideo"));

const App = () => {
  return (
    <Router>

      <Suspense
        fallback={
          <div className="min-h-screen bg-black flex items-center justify-center text-white">
            Loading...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Events />} />
          <Route path="/add" element={<AddVideo />} />
        </Routes>
      </Suspense>

    </Router>
  );
};

export default App;
