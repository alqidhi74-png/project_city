import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./components/HomePage";

const InteractiveMapPage = lazy(() => import("./pages/InteractiveMapPage"));

function App() {
  return <BrowserRouter>
    <Suspense fallback={<p dir="rtl" role="status">جارٍ تحميل الصفحة…</p>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/interactive-map" element={<InteractiveMapPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>;
}

export default App;
