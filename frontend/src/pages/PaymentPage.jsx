import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  CreditCard, 
  ArrowLeft, 
  Smartphone, 
  QrCode, 
  CheckCircle,
  AlertTriangle 
} from "lucide-react";

import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { getPass, createPaymentOrder, verifyPayment } from "../services/api";
import { formatCurrency } from "../utils/formatters";

export const PaymentPage = () => {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("upi"); // upi, gateway

  useEffect(() => {
    const fetchPassDetails = async () => {
      try {
        const response = await getPass(registrationId);
        if (response.success) {
          setParticipant(response.data);
          
          // If already paid or free, skip payment page
          if (response.data.payment_status === "PAID" || response.data.payment_status === "FREE") {
            navigate(`/success/${registrationId}`);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load registration details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPassDetails();
  }, [registrationId, navigate]);

  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      // Step 1: Create Order
      const amount = 500.00;
      const orderResponse = await createPaymentOrder(registrationId, amount);
      
      if (!orderResponse.success) {
        toast.error("Failed to initiate payment order.");
        setPaymentLoading(false);
        return;
      }
      
      // Simulate Razorpay Gateway or UPI flow delay
      toast.loading("Initiating secure payment gateway...", { duration: 1500 });
      
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Step 2: Verify Payment (Simulate success)
      const mockTransactionId = `pay_${Math.random().toString(36).substring(2, 14)}`;
      const verifyResponse = await verifyPayment(
        registrationId,
        mockTransactionId,
        orderResponse.order_id
      );

      if (verifyResponse.success) {
        toast.success("Payment Received! Registration completed.");
        navigate(`/success/${registrationId}`);
      } else {
        toast.error(verifyResponse.message || "Payment verification failed.");
      }
    } catch (err) {
      console.error(err);
      const serverError = err.response?.data?.detail || "Payment failed. Please try again.";
      toast.error(serverError);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Verifying registration details...</p>
        </div>
      </Layout>
    );
  }

  if (!participant) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-12">
          <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold font-display text-white">Registration Not Found</h3>
          <p className="text-slate-400 text-sm mt-2">
            The provided Registration ID is invalid or does not exist.
          </p>
          <Button onClick={() => navigate("/register")} className="mt-6">
            Go to Registration
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto w-full">
        {/* Back Link */}
        <button
          onClick={() => navigate("/register")}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-semibold uppercase tracking-wider mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to form
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold font-display text-white">Pending Registration Fee</h2>
          <p className="text-sm text-slate-400 mt-2">
            Complete the checkout to activate your event pass.
          </p>
        </div>

        <Card className="flex flex-col gap-6">
          {/* Bill Summary */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Participant Details
            </h3>
            
            <div className="flex flex-col gap-2 border-b border-slate-900 pb-4 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Name</span>
                <span className="text-white font-semibold">{participant.full_name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Registration ID</span>
                <span className="text-cyan-400 font-mono font-semibold">{participant.registration_id}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">College</span>
                <span className="text-slate-200">{participant.college_name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Type</span>
                <Badge variant="warning">{participant.participant_type}</Badge>
              </div>
            </div>

            <div className="flex justify-between items-center font-display">
              <span className="text-sm text-slate-300 font-medium">Registration Fee</span>
              <span className="text-2xl font-black text-white">
                {formatCurrency(participant.payment_amount)}
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4 pb-1.5 border-b border-slate-800 flex items-center gap-2">
              Select Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setSelectedMethod("upi")}
                className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-200
                  ${
                    selectedMethod === "upi"
                      ? "bg-cyan-950/20 border-cyan-500/80 ring-2 ring-cyan-500/20"
                      : "bg-slate-950/30 border-slate-800 hover:border-slate-700"
                  }
                `}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors
                  ${selectedMethod === "upi" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-slate-900 border-slate-800 text-slate-400"}
                `}>
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-sm text-white">UPI QR Code</span>
                  <span className="text-[10px] text-slate-400">Google Pay, PhonePe, Paytm</span>
                </div>
              </div>

              <div
                onClick={() => setSelectedMethod("gateway")}
                className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-200
                  ${
                    selectedMethod === "gateway"
                      ? "bg-cyan-950/20 border-cyan-500/80 ring-2 ring-cyan-500/20"
                      : "bg-slate-950/30 border-slate-800 hover:border-slate-700"
                  }
                `}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors
                  ${selectedMethod === "gateway" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-slate-900 border-slate-800 text-slate-400"}
                `}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-sm text-white">Razorpay Checkout</span>
                  <span className="text-[10px] text-slate-400">Cards, Netbanking, Wallets</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Area */}
          <div className="border-t border-slate-800 pt-6 mt-2 flex flex-col items-center gap-4">
            {selectedMethod === "upi" ? (
              <div className="flex flex-col items-center gap-3 text-center w-full">
                {/* Simulated QR Code for UPI */}
                <div className="bg-white p-3 rounded-2xl w-44 h-44 shadow-xl border border-slate-200 flex items-center justify-center">
                  <div className="flex flex-col items-center text-slate-950">
                    {/* Simulated visual representation of QR code */}
                    <QrCode className="w-32 h-32 text-slate-900" />
                    <span className="text-[8px] font-bold tracking-widest text-slate-500 mt-1 uppercase">
                      Hindustan UPI QR
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-normal max-w-sm">
                  Scan the UPI QR Code using your GPay, PhonePe, or Paytm app. Once scanned and payment is made, click the button below to verify.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center py-4">
                <Smartphone className="w-12 h-12 text-slate-500 animate-bounce" />
                <p className="text-xs text-slate-400 leading-normal max-w-sm">
                  Clicking the button below will open the Razorpay secure overlay checkout popup.
                </p>
              </div>
            )}

            <Button
              onClick={handlePayment}
              variant="gold"
              loading={paymentLoading}
              className="w-full font-bold text-base py-3 mt-2"
            >
              {selectedMethod === "upi" ? "Confirm & Verify Payment" : "Pay ₹500 via Razorpay"}
            </Button>

            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1.5 mt-2">
              <CheckCircle className="w-3 h-3 text-emerald-500" /> Powered by Razorpay secure gateway
            </span>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
export default PaymentPage;
