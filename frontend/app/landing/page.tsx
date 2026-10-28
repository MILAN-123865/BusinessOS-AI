'use client'

import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { ProductCockpit } from '@/components/landing/ProductCockpit'
import { FeatureMatrix } from '@/components/landing/FeatureMatrix'
import { ROICalculator } from '@/components/landing/ROICalculator'
import { ComparisonTable } from '@/components/landing/ComparisonTable'
import { PricingSection } from '@/components/landing/PricingSection'
import { SocialProof } from '@/components/landing/SocialProof'
import { SecuritySection } from '@/components/landing/SecuritySection'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { LandingFooter } from '@/components/landing/LandingFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors selection:bg-primary/20 selection:text-primary font-sans antialiased">
      {/* 1. Sticky Navigation Bar */}
      <LandingNavbar />

      {/* 2. Hero Section */}
      <HeroSection />

      {/* 3. Live Product Cockpit */}
      <ProductCockpit />

      {/* 4. Interactive Feature Matrix (4 Pillars) */}
      <FeatureMatrix />

      {/* 5. Enterprise ROI Calculator */}
      <ROICalculator />

      {/* 6. Competitive Comparison Table */}
      <ComparisonTable />

      {/* 7. Pricing Section with Monthly / Annual Toggle */}
      <PricingSection />

      {/* 8. Social Proof & Capability Trust Pillars */}
      <SocialProof />

      {/* 9. Security & Compliance Architecture */}
      <SecuritySection />

      {/* 10. Final Conversion Call-to-Action */}
      <FinalCTA />

      {/* 11. Enterprise Footer */}
      <LandingFooter />
    </div>
  )
}
