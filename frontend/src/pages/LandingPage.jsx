import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import InfoSection from "../components/InfoSection";
import Packages from "../components/Packages";
import VideoSection from "../components/VideoSection";
import Gallery from "../components/Gallery";
import Testimonials from "../components/Testimonials";
import CTASection, { Footer } from "../components/CTASection";
import WhatsAppFAB from "../components/WhatsAppFAB";
import BookingModal from "../components/BookingModal";
import { PACKAGES_INDIVIDUAL } from "../data/content";

export default function LandingPage() {
    const [bookingOpen, setBookingOpen] = useState(false);
    const [selectedPkg, setSelectedPkg] = useState(null);
    const [selectedType, setSelectedType] = useState("individual");

    const openBooking = (pkg, type = "individual") => {
        setSelectedPkg(pkg || PACKAGES_INDIVIDUAL[1]);
        setSelectedType(type);
        setBookingOpen(true);
    };

    return (
        <div className="grain min-h-screen bg-bg" data-testid="landing-page">
            <Navbar onBook={() => openBooking()} />
            <Hero onBook={() => openBooking()} />
            <InfoSection />
            <Packages onBook={openBooking} />
            <VideoSection />
            <Gallery />
            <Testimonials />
            <CTASection onBook={() => openBooking()} />
            <Footer />
            <WhatsAppFAB />
            <BookingModal
                open={bookingOpen}
                onClose={() => setBookingOpen(false)}
                pkg={selectedPkg}
                type={selectedType}
            />
        </div>
    );
}
