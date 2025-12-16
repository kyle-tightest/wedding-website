import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import LookBook from './components/LookBook.tsx';
import PhotoBooth from './components/PhotoBooth.tsx';
import './index.css';
import PhotoGallery from './components/PhotoGallery.tsx';
import SeatingChart from './components/SeatingChart.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/lookbook" element={<LookBook />} />
        <Route path="/photo-booth" element={<PhotoBooth />} />
        <Route path="/photo-gallery" element={<PhotoGallery />} />
        <Route path="/seating-chart" element={<SeatingChart />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
