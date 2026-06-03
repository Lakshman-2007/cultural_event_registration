import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download, Share2, Ticket, Printer } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export const EventPass = ({ participant }) => {
  const passRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    const toastId = toast.loading("Generating high-fidelity PDF pass...");
    
    try {
      const element = passRef.current;
      if (!element) throw new Error("Pass element not found");
      
      // Capture element to canvas
      const canvas = await html2canvas(element, {
        scale: 3, // Triple resolution for professional print-ready vectors
        useCORS: true,
        backgroundColor: "#0a1628", // Explicitly match our brand dark background
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Calculate width and height to fit standard A4 sheet nicely
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 15;
      const passWidth = pdfWidth - (margin * 2); // 180mm
      const passHeight = (canvas.height * passWidth) / canvas.width;
      
      // Center vertically on A4 page
      const xPosition = margin;
      const yPosition = (pdfHeight - passHeight) / 2;

      pdf.addImage(imgData, "PNG", xPosition, yPosition, passWidth, passHeight);
      pdf.save(`Hindustan_Pass_${participant.registration_id}.pdf`);
      
      toast.success("PDF pass downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF pass.", { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Hindustan University Cultural Event Pass",
        text: `Check out my event pass for Hindustan Cultural Fest 2026. Registration ID: ${participant.registration_id}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback: Copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Pass page link copied to clipboard!");
    }
  };

  const isPaid = participant.payment_status === "PAID" || participant.payment_status === "FREE";

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* Download/Share Actions Top Bar */}
      <div className="flex justify-between items-center w-full px-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Ticket className="w-4 h-4 text-cyan-400" /> Digital Event Pass
        </h3>
        
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors hover:bg-slate-850"
            title="Share Pass"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Actual Event Pass Visual Component (Capturable) */}
      <div
        ref={passRef}
        id="event-pass-card"
        className="w-full bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
      >
        {/* Ticket Header Brand */}
        <div className="relative p-6 text-center border-b border-dashed border-slate-800/80 pb-6">
          {/* Subtle gradient glow decoration */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-amber-500" />
          
          <div className="flex items-center justify-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-xs font-display">
              H
            </div>
            <span className="font-display font-black text-xs tracking-widest text-slate-400 uppercase">
              Hindustan University
            </span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-white uppercase font-display leading-tight">
            Cultural Fest 2026
          </h2>
          <span className="text-[9px] uppercase tracking-widest text-cyan-400 font-bold bg-cyan-950/40 px-3 py-1 border border-cyan-800/20 rounded-full inline-block mt-2">
            ★ Official entry pass ★
          </span>
        </div>

        {/* Ticket Center Notch Cutouts */}
        <div className="absolute top-[138px] -left-3.5 w-7 h-7 rounded-full bg-brand-dark border-r border-slate-850 z-10" />
        <div className="absolute top-[138px] -right-3.5 w-7 h-7 rounded-full bg-brand-dark border-l border-slate-850 z-10" />

        {/* Pass Main Details */}
        <div className="p-6 flex flex-col gap-6">
          {/* Participant Info Banner */}
          <div className="text-center pt-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Attendee</span>
            <h1 className="text-2xl font-extrabold tracking-tight text-white font-display mt-0.5">
              {participant.full_name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">{participant.college_name}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-left border-y border-slate-900 py-5 my-1">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Reg ID</span>
              <span className="text-xs font-mono font-bold text-cyan-400">{participant.registration_id}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Register Number</span>
              <span className="text-xs font-semibold text-slate-200">{participant.register_number}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Department</span>
              <span className="text-xs text-slate-300 font-medium">{participant.department}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">Year / Course</span>
              <span className="text-xs text-slate-300 font-medium">{participant.year_of_study}</span>
            </div>
          </div>

          {/* QR Code and Verification Indicator */}
          <div className="flex flex-col items-center gap-3">
            <div className="p-2 bg-white rounded-2xl shadow-xl w-36 h-36 flex items-center justify-center border border-slate-200">
              {participant.qr_code_data ? (
                <img
                  src={participant.qr_code_data}
                  alt={`QR Code Pass for ${participant.registration_id}`}
                  className="w-32 h-32"
                />
              ) : (
                <div className="w-32 h-32 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                  QR Code Unavailable
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] text-slate-500 tracking-wider uppercase font-semibold">
                Scan at gate for check-in
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={participant.participant_type === "INTERNAL" ? "success" : "gold"}>
                  {participant.participant_type}
                </Badge>
                <Badge variant={isPaid ? "success" : "danger"}>
                  {participant.payment_status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Footer Meta Info */}
        <div className="bg-slate-950/60 border-t border-slate-900/60 p-4 text-center text-[9px] text-slate-500 uppercase tracking-widest font-semibold flex items-center justify-center gap-4">
          <span>Date: Oct 16, 2026</span>
          <span>•</span>
          <span>Admit One Entry</span>
        </div>
      </div>

      {/* Action CTA Button */}
      <Button
        onClick={handleDownloadPdf}
        variant="primary"
        loading={downloading}
        className="w-full font-bold text-sm py-3 mt-2 shadow-lg shadow-cyan-900/10"
        icon={<Download className="w-4.5 h-4.5" />}
      >
        Download PDF Pass
      </Button>
    </div>
  );
};
export default EventPass;
