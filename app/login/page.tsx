// app/login/page.tsx
"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
  FiStar,
  FiArrowRight,
  FiKey,
  FiLogIn,
  FiUserPlus,
  FiArrowLeft,
  FiShield,
} from "react-icons/fi";
import { postData, setAuthToken } from "@/utils/api";
import { Toaster, toast } from "react-hot-toast";

type AuthMode = "login" | "register" | "forgot-password" | "reset-password";

export default function LoginPage() {
  const router = useRouter();
  const isMounted = useRef(true);
  const [mode, setMode] = useState<AuthMode>("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminSecret: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminSecret, setShowAdminSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Check for reset token in URL
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      setResetToken(token);
      setMode("reset-password");
    }
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsCheckingAuth(false);
      return;
    }

    const token = localStorage.getItem("token");
    const timer = setTimeout(() => {
      if (token && isMounted.current) {
        router.replace("/dashboard");
      } else if (isMounted.current) {
        setIsCheckingAuth(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  // Handle form submission based on mode
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (loading) return;

      // Validation based on mode
      if (mode === "login") {
        if (!formData.email.trim() || !formData.password.trim()) {
          toast.error("Please fill in all fields");
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast.error("Please enter a valid email address");
          return;
        }

        setLoading(true);

        try {
          const response = await postData<{
            token: string;
            user: {
              _id: string;
              name: string;
              email: string;
              type: string;
              isVerified: boolean;
            };
          }>("/auth/login", {
            email: formData.email,
            password: formData.password,
          });

          if (!isMounted.current) return;

          localStorage.setItem("token", response.token);
          localStorage.setItem("user", JSON.stringify(response.user));
          setAuthToken(response.token);

          toast.success("Login successful! Redirecting...");

          setTimeout(() => {
            if (isMounted.current) {
              window.location.replace("/dashboard");
            }
          }, 1000);
        } catch (err: any) {
          if (!isMounted.current) return;

          console.error("Login error:", err);

          if (err.response?.status === 401) {
            toast.error("Invalid email or password");
          } else if (err.response?.status === 403) {
            toast.error(
              err.response?.data?.message || "Please verify your email first",
            );
          } else if (err.response?.status === 500) {
            toast.error("Server error. Please try again later.");
          } else if (!navigator.onLine) {
            toast.error("No internet connection");
          } else {
            toast.error(
              err.response?.data?.message || "Login failed. Please try again.",
            );
          }
        } finally {
          if (isMounted.current) {
            setLoading(false);
          }
        }
      } else if (mode === "register") {
        if (
          !formData.name.trim() ||
          !formData.email.trim() ||
          !formData.password.trim() ||
          !formData.confirmPassword.trim()
        ) {
          toast.error("Please fill in all fields");
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }

        if (formData.password.length < 6) {
          toast.error("Password must be at least 6 characters long");
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast.error("Please enter a valid email address");
          return;
        }

        // Check admin secret if admin registration
        if (showAdminSecret && !formData.adminSecret.trim()) {
          toast.error("Admin secret key is required");
          return;
        }

        setLoading(true);

        try {
          await postData("/auth/register", {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            type: showAdminSecret ? "admin" : "user",
            adminSecret: showAdminSecret ? formData.adminSecret : undefined,
          });

          if (!isMounted.current) return;

          toast.success(
            showAdminSecret
              ? "Admin registration successful! Please login."
              : "Registration successful! Please login.",
          );
          setMode("login");

          setFormData((prev) => ({
            ...prev,
            password: "",
            confirmPassword: "",
            adminSecret: "",
          }));
          setShowAdminSecret(false);
        } catch (err: any) {
          if (!isMounted.current) return;

          console.error("Registration error:", err);

          if (err.response?.status === 400) {
            toast.error(err.response?.data?.message || "Registration failed");
          } else if (err.response?.status === 403) {
            toast.error(
              err.response?.data?.message || "Invalid admin secret key",
            );
          } else if (err.response?.status === 500) {
            toast.error("Server error. Please try again later.");
          } else if (!navigator.onLine) {
            toast.error("No internet connection");
          } else {
            toast.error("Registration failed. Please try again.");
          }
        } finally {
          if (isMounted.current) {
            setLoading(false);
          }
        }
      } else if (mode === "forgot-password") {
        if (!formData.email.trim()) {
          toast.error("Please enter your email address");
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          toast.error("Please enter a valid email address");
          return;
        }

        setLoading(true);

        try {
          await postData("/auth/forgot-password", {
            email: formData.email,
          });

          if (!isMounted.current) return;

          toast.success("Password reset instructions sent to your email!");
          setMode("login");
          setFormData((prev) => ({ ...prev, email: "" }));
        } catch (err: any) {
          if (!isMounted.current) return;

          console.error("Forgot password error:", err);

          if (err.response?.status === 404) {
            toast.error("No account found with this email");
          } else if (err.response?.status === 500) {
            toast.error("Server error. Please try again later.");
          } else if (!navigator.onLine) {
            toast.error("No internet connection");
          } else {
            toast.error("Failed to send reset instructions. Please try again.");
          }
        } finally {
          if (isMounted.current) {
            setLoading(false);
          }
        }
      } else if (mode === "reset-password" && resetToken) {
        if (!formData.password.trim() || !formData.confirmPassword.trim()) {
          toast.error("Please fill in all fields");
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }

        if (formData.password.length < 6) {
          toast.error("Password must be at least 6 characters long");
          return;
        }

        setLoading(true);

        try {
          await postData(`/auth/reset-password/${resetToken}`, {
            password: formData.password,
          });

          if (!isMounted.current) return;

          toast.success("Password reset successful! Please login.");
          setMode("login");

          setFormData({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            adminSecret: "",
          });
          setResetToken(null);

          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        } catch (err: any) {
          if (!isMounted.current) return;

          console.error("Reset password error:", err);

          if (err.response?.status === 400) {
            toast.error("Invalid or expired reset token");
          } else if (err.response?.status === 500) {
            toast.error("Server error. Please try again later.");
          } else if (!navigator.onLine) {
            toast.error("No internet connection");
          } else {
            toast.error("Failed to reset password. Please try again.");
          }
        } finally {
          if (isMounted.current) {
            setLoading(false);
          }
        }
      }
    },
    [formData, loading, mode, resetToken, showAdminSecret],
  );

  // Handle input change
  const handleInputChange = useCallback((field: string, value: string) => {
    if (!isMounted.current) return;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Clear form when switching modes
  const handleModeChange = useCallback((newMode: AuthMode) => {
    setMode(newMode);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      adminSecret: "",
    });
    setShowAdminSecret(false);
  }, []);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400 text-sm">Please Wait...</p>
        </div>
      </div>
    );
  }

  const getModeTitle = () => {
    switch (mode) {
      case "login":
        return "Welcome Back";
      case "register":
        return "Create Account";
      case "forgot-password":
        return "Reset Password";
      case "reset-password":
        return "Set New Password";
      default:
        return "Welcome";
    }
  };

  const getModeSubtitle = () => {
    switch (mode) {
      case "login":
        return "Sign in to your account";
      case "register":
        return showAdminSecret
          ? "Create a new admin account"
          : "Create a new user account";
      case "forgot-password":
        return "Enter your email to reset password";
      case "reset-password":
        return "Enter your new password";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg rotate-45">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl flex items-center justify-center -rotate-45">
                  <FiStar className="text-white text-2xl" />
                </div>
              </div>
              <div className="absolute inset-0 animate-ping border-2 border-blue-400/30 rounded-2xl"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            OsheenOracle
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Astrology Admin Dashboard
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-white">
              {getModeTitle()}
            </h2>
            <p className="text-gray-400 text-sm mt-1">{getModeSubtitle()}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field (Register only) */}
            {mode === "register" && (
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FiUser className="text-blue-400/80 text-lg" />
                  </div>
                  <input
                    type="text"
                    required={mode === "register"}
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm"
                    placeholder="Enter your full name"
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email Field (All modes except reset-password) */}
            {(mode === "login" ||
              mode === "register" ||
              mode === "forgot-password") && (
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FiMail className="text-blue-400/80 text-lg" />
                  </div>
                  <input
                    type="email"
                    required={
                      mode === "login" ||
                      mode === "register" ||
                      mode === "forgot-password"
                    }
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm"
                    placeholder="Enter your email"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>
            )}

            {/* Password Field (Login, Register, Reset-password) */}
            {(mode === "login" ||
              mode === "register" ||
              mode === "reset-password") && (
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FiLock className="text-blue-400/80 text-lg" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required={
                      mode === "login" ||
                      mode === "register" ||
                      mode === "reset-password"
                    }
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm"
                    placeholder={
                      mode === "reset-password"
                        ? "Enter new password"
                        : "Enter your password"
                    }
                    disabled={loading}
                    autoComplete={
                      mode === "reset-password"
                        ? "new-password"
                        : "current-password"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password Field (Register & Reset-password) */}
            {(mode === "register" || mode === "reset-password") && (
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FiKey className="text-purple-400/80 text-lg" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required={mode === "register" || mode === "reset-password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm"
                    placeholder="Confirm password"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Admin Registration Option (Register mode only) */}
            {mode === "register" && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAdminSecret}
                    onChange={(e) => {
                      setShowAdminSecret(e.target.checked);
                      if (!e.target.checked) {
                        handleInputChange("adminSecret", "");
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-400 flex items-center gap-1">
                    <FiShield className="text-purple-400" size={14} />
                    Register as Admin
                  </span>
                </label>

                {showAdminSecret && (
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <FiKey className="text-red-400/80 text-lg" />
                    </div>
                    <input
                      type="password"
                      required={showAdminSecret}
                      value={formData.adminSecret}
                      onChange={(e) =>
                        handleInputChange("adminSecret", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-red-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 text-sm"
                      placeholder="Admin Secret Key"
                      disabled={loading}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Forgot Password Link (Login mode only) */}
            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => handleModeChange("forgot-password")}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Back to Login Link (Forgot Password & Reset Password modes) */}
            {(mode === "forgot-password" || mode === "reset-password") && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleModeChange("login")}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1 mx-auto"
                  disabled={loading}
                >
                  <FiArrowLeft size={14} />
                  Back to login
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === "login" && "Signing in..."}
                  {mode === "register" && "Creating account..."}
                  {mode === "forgot-password" && "Sending reset link..."}
                  {mode === "reset-password" && "Resetting password..."}
                </>
              ) : (
                <>
                  {mode === "login" && "Sign In"}
                  {mode === "register" &&
                    (showAdminSecret
                      ? "Create Admin Account"
                      : "Create Account")}
                  {mode === "forgot-password" && "Send Reset Link"}
                  {mode === "reset-password" && "Reset Password"}
                  <FiArrowRight className="ml-1" />
                </>
              )}
            </button>

            {/* Mode Switch Links */}
            <div className="text-center pt-4 border-t border-gray-700/50">
              {mode === "login" ? (
                <p className="text-gray-400 text-sm">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeChange("register")}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    disabled={loading}
                  >
                    Sign up
                  </button>
                </p>
              ) : mode === "register" ? (
                <p className="text-gray-400 text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleModeChange("login")}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    disabled={loading}
                  >
                    Sign in
                  </button>
                </p>
              ) : null}
            </div>
          </form>
        </div>

        {/* Background Elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Toaster for notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1f2937",
            color: "#fff",
            border: "1px solid #374151",
            fontSize: "14px",
            maxWidth: "400px",
            margin: "0 auto",
            borderRadius: "0.75rem",
            padding: "12px 16px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
}
