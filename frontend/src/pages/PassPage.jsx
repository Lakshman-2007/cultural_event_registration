import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { Layout } from "../components/layout/Layout";
import { EventPass } from "../components/pass/EventPass";
import { Button } from "../components/ui/Button";
import { getPass } from "../services/api";

export const PassPage = () => {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPass = async () => {
      try {
        const response = await getPass(registrationId);
        if (response.success) {
          setParticipant(response.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load your event pass.");
      } finally {
        setLoading(false);
      }
    };

    fetchPass();
  }, [registrationId]);

  return (
    <Layout>
      <div className="py-4">
        {/* Back Link */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-semibold uppercase tracking-wider mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Retrieving event pass details...</p>
          </div>
        ) : participant ? (
          <div className="animate-fade-in">
            <EventPass participant={participant} />
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-12">
            <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-display text-white">Event Pass Not Found</h3>
            <p className="text-slate-400 text-sm mt-2">
              No registration record was found matching ID: {registrationId}
            </p>
            <Button onClick={() => navigate("/register")} className="mt-6">
              Register Here
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};
export default PassPage;
