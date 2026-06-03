import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  GraduationCap, 
  BookOpen, 
  CalendarDays, 
  ShieldCheck 
} from "lucide-react";

import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { validateRegistrationForm, isInternalEmail } from "../../utils/validators";
import { registerParticipant } from "../../services/api";

export const RegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    mobile: "",
    email: "",
    address: "",
    aadhaar_number: "",
    college_name: "",
    register_number: "",
    department: "",
    year_of_study: "",
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isInternal, setIsInternal] = useState(false);

  // Check internal status dynamically when email or register number changes
  useEffect(() => {
    const internal = isInternalEmail(formData.email, formData.register_number);
    setIsInternal(internal);
  }, [formData.email, formData.register_number]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    
    // Clear error on change
    if (errors[id]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleBlur = (e) => {
    const { id, value } = e.target;
    // We can run inline validations here if needed, but validating on submit is fine
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateRegistrationForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast.error("Please resolve the validation errors in the form.");
      return;
    }

    setLoading(true);
    try {
      const response = await registerParticipant(formData);
      if (response.success) {
        toast.success("Registration initiated successfully!");
        
        const { registration_id, participant_type } = response.data;
        
        if (participant_type === "INTERNAL") {
          // Direct redirect to success page for internal free registrations
          navigate(`/success/${registration_id}`);
        } else {
          // Redirect to payment page for external participants
          navigate(`/payment/${registration_id}`);
        }
      } else {
        toast.error(response.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      const serverError = err.response?.data?.detail || "An unexpected error occurred.";
      toast.error(serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold font-display text-white">Event Registration</h2>
        <p className="text-sm text-slate-400 mt-2">
          Fill in your details below to register for the Hindustan University Cultural Fest.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Internal Student Banner */}
          {formData.email && formData.register_number && (
            <div className="animate-fade-in">
              {isInternal ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-sm">🎓 Student Validation Successful</span>
                    <span className="text-xs text-emerald-500/80">
                      HITS official email matched. Registration is free.
                    </span>
                  </div>
                  <Badge variant="success">Free Pass</Badge>
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-sm">🌐 External Participant detected</span>
                    <span className="text-xs text-amber-500/80">
                      Standard fee of ₹500 is applicable.
                    </span>
                  </div>
                  <Badge variant="warning">₹500 Fee</Badge>
                </div>
              )}
            </div>
          )}

          {/* Section 1: Personal Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4 pb-1.5 border-b border-slate-800 flex items-center gap-2">
              <User className="w-4 h-4" /> Personal Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                id="full_name"
                value={formData.full_name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.full_name}
                required
                icon={<User className="w-4 h-4" />}
                placeholder="Enter full name (as in Aadhaar/ID)"
              />
              <Input
                label="Mobile Number"
                id="mobile"
                value={formData.mobile}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.mobile}
                required
                maxLength={10}
                icon={<Phone className="w-4 h-4" />}
                placeholder="10-digit number"
              />
              <div className="md:col-span-2">
                <Input
                  label="Email Address"
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email}
                  required
                  icon={<Mail className="w-4 h-4" />}
                  placeholder="name@student.hindustanuniv.ac.in (HITS) or regular email"
                />
                {formData.email && !formData.email.endsWith("@student.hindustanuniv.ac.in") && (
                  <p className="text-[10px] text-slate-500 mt-1 pl-1">
                    Note: To qualify for free registration, HITS students must use their official student email.
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Residential Address"
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.address}
                  required
                  icon={<MapPin className="w-4 h-4" />}
                  placeholder="Enter full residential address"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Academic Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4 pb-1.5 border-b border-slate-800 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Academic Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="College / Institute Name"
                  id="college_name"
                  value={formData.college_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.college_name}
                  required
                  icon={<GraduationCap className="w-4 h-4" />}
                  placeholder="Hindustan Institute of Technology & Science"
                />
              </div>
              <Input
                label="Register Number"
                id="register_number"
                value={formData.register_number}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.register_number}
                required
                icon={<BookOpen className="w-4 h-4" />}
                placeholder="Student Roll/Register ID"
              />
              <Input
                label="Department"
                id="department"
                value={formData.department}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.department}
                required
                icon={<BookOpen className="w-4 h-4" />}
                placeholder="e.g. CSE, ECE, Aero"
              />
              
              <div className="flex flex-col gap-1 w-full col-span-1 md:col-span-2">
                <label htmlFor="year_of_study" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Year of Study <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <select
                    id="year_of_study"
                    value={formData.year_of_study}
                    onChange={handleChange}
                    className={`w-full bg-slate-950/60 border rounded-lg py-2.5 px-11 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200
                      ${
                        errors.year_of_study
                          ? "border-red-500/80 focus:border-red-500 focus:ring-red-500/50"
                          : "border-slate-800/80 focus:border-cyan-500 focus:ring-cyan-500/30"
                      }
                    `}
                  >
                    <option value="" disabled>Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                  </select>
                </div>
                {errors.year_of_study && (
                  <p className="text-xs text-red-500 font-medium mt-0.5 animate-fade-in">
                    {errors.year_of_study}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Identity Validation */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4 pb-1.5 border-b border-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Identity Verification
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Aadhaar Number"
                id="aadhaar_number"
                value={formData.aadhaar_number}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.aadhaar_number}
                required
                maxLength={12}
                icon={<CreditCard className="w-4 h-4" />}
                placeholder="12-digit UIDAI Aadhaar Number"
              />
              <p className="text-[10px] text-slate-500 pl-1 leading-normal">
                🔒 Security Note: Aadhaar numbers are stored securely using industry-standard AES-256 encryption at rest. Decryption is restricted strictly to authorized portal event checking screens.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t border-slate-800 pt-6 mt-4">
            <Button
              type="submit"
              variant={isInternal ? "success" : "gold"}
              loading={loading}
              className="w-full font-bold text-base py-3"
            >
              {isInternal ? "Confirm Free Registration" : "Proceed to Payment (₹500)"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
