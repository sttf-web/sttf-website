import AppPromoSection from "@/components/mainPage/AppPromoSection";
import CredibilitySection from "@/components/mainPage/CredibilitySection";
import HeroSection from "@/components/mainPage/HeroSection";
import NewsSection from "@/components/mainPage/NewsSection";
import PresidentMessageSection from "@/components/mainPage/PresidentMessageSection";
import PromoSection from "@/components/mainPage/PromoSection";
import StatsSection from "@/components/mainPage/StatsSection";

export default function Home() {
  return (
    <>
      <HeroSection/>
      <NewsSection/>
      <PresidentMessageSection/>
      <StatsSection/>
      <PromoSection/>
      <AppPromoSection/>
      <CredibilitySection/>
    </>
  );
}
