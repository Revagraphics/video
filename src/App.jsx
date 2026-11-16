// src/App.jsx
import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ADMIN_UPLOADS_ENABLED } from "./api/api";

const Events = lazy(() => import("./pages/Events"));
const AddVideo = lazy(() => import("./pages/AddVideo"));
const VideoPage = lazy(() => import("./pages/VideoPage"));

function AppRoutes() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<Events />} />
        <Route path="/video/:id" element={<VideoPage />} />
        <Route
          path="/add"
          element={ADMIN_UPLOADS_ENABLED ? <AddVideo /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {backgroundLocation && (
        <Routes>
          <Route path="/video/:id" element={<VideoPage isModal />} />
        </Routes>
      )}
    </>
  );
}

const App = () => {
  return (
    <Router>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
            Loading...
          </div>
        }
      >
        <AppRoutes />
      </Suspense>
    </Router>
  );
};

export default App;
