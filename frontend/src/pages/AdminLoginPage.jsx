import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, LogIn, ShieldAlert } from "lucide-react";

import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { adminLogin } from "../services/api";
import { setToken, isAuthenticated } from "../services/auth";

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // If already logged in, redirect straight to dashboard
    if (isAuthenticated()) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const validate = () => {
    const errs = {};
    if (!email) errs.email = "Email is required";
    if (!password) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await adminLogin(email, password);
      if (response.success && response.token) {
        setToken(response.token);
        toast.success("Welcome back! Login successful.");
        navigate("/admin/dashboard");
      } else {
        toast.error(response.message || "Failed to log in.");
      }
    } catch (err) {
      console.error(err);
      const serverError = err.response?.data?.detail || "Invalid login credentials. Please try again.";
      toast.error(serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto w-full py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold font-display text-white">Organizer Portal</h2>
          <p className="text-sm text-slate-400 mt-2">
            Sign in with administrative privileges to manage registrations and scan passes.
          </p>
        </div>

        <Card>
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <Input
              label="Email Address"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              icon={<Mail className="w-4 h-4" />}
              placeholder="admin@hindustanuniv.ac.in"
            />

            <Input
              label="Secret Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
              icon={<Lock className="w-4 h-4" />}
              placeholder="••••••••"
            />

            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 mt-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
                Demo Credentials
              </span>
              <div className="text-xs text-slate-400 flex flex-col gap-0.5">
                <span>Email: <code className="text-cyan-400">admin@hindustanuniv.ac.in</code></span>
                <span>Password: <code className="text-cyan-400">admin123</code></span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full font-bold py-3 mt-2"
              icon={<LogIn className="w-4 h-4" />}
            >
              Sign In to Dashboard
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};
export default AdminLoginPage;
