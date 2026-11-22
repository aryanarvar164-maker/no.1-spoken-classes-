import Header from "@/components/Header";
import Hero from "@/components/Hero";
import VideoSection from "@/components/VideoSection";
import About from "@/components/About";
import Achievements from "@/components/Achievements";
import Batches from "@/components/Batches";
import Gallery from "@/components/Gallery";
import Enquiry from "@/components/Enquiry";
import Footer from "@/components/Footer";
import Motion from "@/components/Motion";
import Cursor from "@/components/Cursor";
import Marquee from "@/components/Marquee";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Marquee />
        <VideoSection />
        <About />
        <Achievements />
        <Batches />
        <Gallery />
        <Enquiry />
      </main>
      <Footer />
      <Motion />
      <Cursor />
    </>
  );
}
