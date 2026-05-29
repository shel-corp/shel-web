import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from '../views/Home';
import Docs from '../views/Docs';
import Products from '../views/Products';
import Notes from '../views/Notes';
import Careers from '../views/Careers';
import Contact from '../views/Contact';
import Directory from '../views/Directory';
import Environments from '../views/Environments';
import Legal from '../views/Legal';
import NotFound from '../views/NotFound';

export default function Body() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/products" element={<Products />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/environments" element={<Environments />} />
        <Route path="/environments/index.html" element={<Navigate to="/environments" replace />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}
