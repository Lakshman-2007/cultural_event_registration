import React from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  MapPin, 
  Users, 
  QrCode, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Layout } from "../components/layout/Layout";

export const HomePage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative flex flex-col items-center text-center mt-6 md:mt-10 mb-16 md:mb-24">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 md:w-96 md:h-96 rounded-full bg-cyan-600/10 blur-3xl -z-10 animate-pulse-glow" />

        <div className="inline-flex items-center gap-2 bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          The Grandest Cultural Fest is Here
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-none font-display">
          HINDUSTAN <br className="sm:hidden" />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400 bg-clip-text text-transparent">
            CULTURAL FEST
          </span>{" "}
          2026
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed font-light">
          Experience a weekend of pure creativity, art, and competition at Hindustan Institute of Technology and Science. Show your talent and win exciting cash prizes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/register">
            <Button variant="primary" className="font-semibold text-base py-3 px-8 shadow-lg shadow-cyan-500/10">
              Register Now <ArrowRight className="w-4.5 h-4.5 ml-2.5" />
            </Button>
          </Link>
          <Link to="/admin/login">
            <Button variant="secondary" className="font-semibold text-base py-3 px-8">
              Organizer Portal
            </Button>
          </Link>
        </div>

        {/* Event Quick Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 border-t border-slate-900 mt-16 pt-8 w-full max-w-4xl text-left">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-cyan-950/50 border border-cyan-800/20 flex items-center justify-center text-cyan-400 shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Date & Time</p>
              <p className="text-sm font-semibold text-slate-200">October 16-18, 2026</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-cyan-950/50 border border-cyan-800/20 flex items-center justify-center text-cyan-400 shadow-inner">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Venue</p>
              <p className="text-sm font-semibold text-slate-200">HITS Main Campus Auditorium</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-cyan-950/50 border border-cyan-800/20 flex items-center justify-center text-cyan-400 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Cash Prizes</p>
              <p className="text-sm font-semibold text-slate-200">Exceeding ₹5,00,000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights / Features Grid */}
      <div className="mb-24">
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-center mb-12">
          Registration Policy & Process
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverable className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Free Internal Students Entry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Registrations are completely free for all official Hindustan University students. Enter your official email ending in <code className="text-emerald-400 text-[10px] font-semibold">@student.hindustanuniv.ac.in</code>. Prefix must match your Register Number.
            </p>
          </Card>

          <Card hoverable className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Paid External Registrations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              External college students can register at an entry fee of <strong className="text-amber-400">₹500</strong>. Supported payment options include GPay, PhonePe, Paytm, and UPI QR code via Razorpay integration.
            </p>
          </Card>

          <Card hoverable className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Digital Pass & QR Code</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upon successful registration, get a downloadable PDF event pass featuring a unique QR code. Organizers will scan your QR code at the entrance gates to check you in and record attendance.
            </p>
          </Card>
        </div>
      </div>

      {/* How it works */}
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold font-display mb-12">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 relative max-w-4xl mx-auto text-left">
          {/* Step 1 */}
          <div className="flex flex-col gap-3 relative">
            <div className="text-3xl font-extrabold text-cyan-500/30 font-display">01</div>
            <h4 className="font-bold text-sm text-slate-200">Fill Details</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Provide your personal details, Aadhaar, and college ID information on the portal.</p>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col gap-3 relative">
            <div className="text-3xl font-extrabold text-cyan-500/30 font-display">02</div>
            <h4 className="font-bold text-sm text-slate-200">Validate Domain</h4>
            <p className="text-xs text-slate-400 leading-relaxed">System checks if you are an internal student. Otherwise, pay a fee of ₹500.</p>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col gap-3 relative">
            <div className="text-3xl font-extrabold text-cyan-500/30 font-display">03</div>
            <h4 className="font-bold text-sm text-slate-200">Generate Pass</h4>
            <p className="text-xs text-slate-400 leading-relaxed">System generates a PDF event pass with an encrypted QR code containing your registration ID.</p>
          </div>
          
          {/* Step 4 */}
          <div className="flex flex-col gap-3 relative">
            <div className="text-3xl font-extrabold text-cyan-500/30 font-display">04</div>
            <h4 className="font-bold text-sm text-slate-200">Check In</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Show your digital pass QR code at the gates. Organizers scan to confirm attendance.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default HomePage;
