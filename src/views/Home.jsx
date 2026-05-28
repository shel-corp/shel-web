import Hero from '../components/Hero.jsx';
import SystemDiagram from '../components/SystemDiagram.jsx';
import SystemOverview from '../components/SystemOverview.jsx';
import DocsSection from '../components/DocsSection.jsx';
import EnvironmentsSection from '../components/EnvironmentsSection.jsx';
import DirectorySection from '../components/DirectorySection.jsx';
import ProductsSection from '../components/ProductsSection.jsx';
import NotesSection from '../components/NotesSection.jsx';
import CareersSection from '../components/CareersSection.jsx';

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
