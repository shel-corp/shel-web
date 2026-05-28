import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from '../views/Home.jsx';
import Docs from '../views/Docs.jsx';
import Products from '../views/Products.jsx';
import Notes from '../views/Notes.jsx';
import Careers from '../views/Careers.jsx';
import Directory from '../views/Directory.jsx';
import Environments from '../views/Environments.jsx';
import Legal from '../views/Legal.jsx';
import NotFound from '../views/NotFound.jsx';

export default function Body() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/products" element={<Products />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/environments" element={<Environments />} />
        <Route path="/environments/index.html" element={<Navigate to="/environments" replace />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}
