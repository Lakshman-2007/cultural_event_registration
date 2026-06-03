import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  CheckCircle, 
  Download, 
  ArrowRight,
  Sparkles,
  Ticket,
  PlusCircle
} from "lucide-react";

import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { getPass } from "../services/api";

export const SuccessPage = () => {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await getPass(registrationId);
        if (response.success) {
          setParticipant(response.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to retrieve registration confirmation details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [registrationId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Loading success confirmation...</p>
        </div>
      </Layout>
    );
  }

  if (!participant) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-12">
          <h3 className="text-xl font-bold font-display text-white">Registration Not Found</h3>
          <p className="text-slate-400 text-sm mt-2">
            We couldn't retrieve confirmation details for Registration ID: {registrationId}
          </p>
          <Button onClick={() => navigate("/")} className="mt-6">
            Back to Home
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto w-full flex flex-col items-center">
        {/* Animated Checkmark */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl scale-125" />
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-12 h-12" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold font-display text-white flex items-center justify-center gap-2">
            Registration Successful!
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
            Your event pass is now generated. A confirmation log has been dispatched to your email address.
          </p>
        </div>

        <Card className="w-full flex flex-col gap-6 relative overflow-hidden">
          {/* Confetti decoration */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Quick Ticket Badge */}
          <div className="flex justify-between items-center bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Registration ID</span>
              <span className="text-lg font-mono font-bold text-cyan-400">{participant.registration_id}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Entry Class</span>
              <Badge variant={participant.participant_type === "INTERNAL" ? "success" : "gold"}>
                {participant.participant_type === "INTERNAL" ? "Internal (Free)" : "External (Paid)"}
              </Badge>
            </div>
          </div>

          {/* Participant Details Summary */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-slate-950/20 border border-slate-900 p-5 rounded-xl">
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Full Name</p>
              <p className="text-slate-200 font-semibold mt-0.5">{participant.full_name}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Mobile Number</p>
              <p className="text-slate-200 mt-0.5">{participant.mobile}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">College / University</p>
              <p className="text-slate-200 mt-0.5">{participant.college_name}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Register Number</p>
              <p className="text-slate-200 font-mono mt-0.5">{participant.register_number}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Department</p>
              <p className="text-slate-200 mt-0.5">{participant.department}</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-800/80 pt-6 mt-2">
            <Link to={`/pass/${participant.registration_id}`} className="flex-1">
              <Button variant="primary" className="w-full font-bold py-3 text-sm">
                <Ticket className="w-4 h-4 mr-2" /> View Event Pass <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <Link to="/register" className="sm:w-44">
              <Button variant="secondary" className="w-full font-bold py-3 text-sm">
                <PlusCircle className="w-4 h-4 mr-2" /> Register Another
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
export default SuccessPage;
