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
import { getContent } from "@/lib/content";

export default async function Home() {
  // Cached; refreshed instantly whenever the owner saves in the editor.
  const site = await getContent();
  return (
    <>
      <Header site={site} />
      <main id="main">
        <Hero site={site} />
        <Marquee />
        <VideoSection site={site} />
        <About site={site} />
        <Achievements site={site} />
        <Batches site={site} />
        <Gallery site={site} />
        <Enquiry site={site} />
      </main>
      <Footer site={site} />
      <Motion />
      <Cursor />
    </>
  );
}
