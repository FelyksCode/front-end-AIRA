import HeroSection from './HeroSection';
import SocietySection from './SocietySection';
import FeatureBox from './FeatureBox';
import DiagnosisCTA from './DiagnosisCTA';
import DiagnosisFeature from './DiagnosisFeature';
import PrognosisFeature from './PrognosisFeature';
import TreatmentFeature from './TreatmentFeature';
import Footer from './Footer';

function HomePage() {
  return (
    <div className="min-h-screen bg-white w-full">
      {/* Hero Section - Full Width */}
      <HeroSection />

      {/* Society Section - Full Width */}
      <SocietySection />

      {/* Placeholder Boxes - Full Width */}
      <FeatureBox />

      {/* CTA Section - Full Width */}
      <DiagnosisCTA />

      {/* Feature Grid - Full Width */}
      <div className="w-full py-8 px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          <DiagnosisFeature />
          <PrognosisFeature />
          <TreatmentFeature />
        </div>
      </div>

      {/* Footer - Full Width */}
      <Footer />
    </div>
  );
}

export default HomePage;
