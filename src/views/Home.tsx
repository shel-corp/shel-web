import React from 'react';
import Hero from '../components/Hero';
import SystemDiagram from '../components/SystemDiagram';
import SystemOverview from '../components/SystemOverview';
import DocsSection from '../components/DocsSection';
import EnvironmentsSection from '../components/EnvironmentsSection';
import DirectorySection from '../components/DirectorySection';
import ProductsSection from '../components/ProductsSection';
import NotesSection from '../components/NotesSection';
import CareersSection from '../components/CareersSection';

export default function Home() {
  return (
    <>
      <Hero />
      <SystemDiagram />
      <SystemOverview />
      <DocsSection />
      <EnvironmentsSection />
      <DirectorySection />
      <ProductsSection />
      <NotesSection />
      <CareersSection />
    </>
  );
}
