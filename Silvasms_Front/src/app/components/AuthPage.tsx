import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Lock, Mail, Phone, User, ArrowRight, AlertCircle, Check, UserCircle, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../contexts/AuthContext';
import { api, getValidationErrors, formatApiError } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { MessageSquare } from 'lucide-react';

interface AuthPageProps {
  defaultTab?: 'signin' | 'signup';
}

export default function AuthPage({ defaultTab = 'signin' }: AuthPageProps) {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(defaultTab);
  
  // Sign In States
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoadingSignIn, setIsLoadingSignIn] = useState(false);
  const [signInError, setSignInError] = useState('');

  // Sign Up States
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoadingSignUp, setIsLoadingSignUp] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingSignIn(true);
    setSignInError('');
    
    try {
      const response = await api.login({
        login,
        password,
        remember: rememberMe
      });
      
      toast.success('Welcome back!');
      
      if (response.data.user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Login failed. Please try again.';
      setSignInError(errorMessage);
      toast.error('Login failed');
    } finally {
      setIsLoadingSignIn(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (signUpError) {
      setSignUpError('');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;
    
    if (formData.password !== formData.confirmPassword) {
      setSignUpError('Passwords do not match');
      return;
    }
    
    setIsLoadingSignUp(true);
    setSignUpError('');
    setFieldErrors({});
    
    try {
      await api.register({
        username: formData.username,
        email: formData.email,
        phone_number: formData.phoneNumber,
        password: formData.password,
        password_confirmation: formData.confirmPassword
      });
      
      refreshUser();
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      const validationErrors = getValidationErrors(err);
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        if (err.message) {
          setSignUpError(err.message);
        }
      } else {
        setSignUpError(formatApiError(err));
      }
      toast.error('Registration failed');
    } finally {
      setIsLoadingSignUp(false);
    }
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = passwordStrength(formData.password);

  return (
    <div className="min-h-screen bg-[#0A0D0B] dark:bg-[#0A0D0B] flex items-center justify-center px-4 py-8 sm:py-12">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-[#16C784]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-[#0EA968]/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#16C784]/10 border border-[#16C784]/30 flex items-center justify-center">
                <span className="signal-dot w-2 h-2 rounded-full bg-[#16C784]" />
              </div>
              <div className="flex items-baseline gap-0" style={{ fontFamily: 'var(--font-display)' }}>
                <span className="text-2xl sm:text-3xl font-semibold text-[#EAF2ED]">Silva</span>
                <span className="text-2xl sm:text-3xl font-semibold text-[#16C784]">-Sms</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#1B241D] rounded-2xl p-1.5 mb-4 shadow-lg border border-[#24352A] flex">
          <button
            onClick={() => setActiveTab('signin')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'signin'
                ? 'bg-[#16C784] text-white shadow-md'
                : 'text-[#8CA398] hover:text-[#EAF2ED]'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'signup'
                ? 'bg-[#16C784] text-white shadow-md'
                : 'text-[#8CA398] hover:text-[#EAF2ED]'
            }`}
          >
            <UserCircle className="w-4 h-4" />
            Sign Up
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-[#1B241D] rounded-2xl shadow-2xl border border-[#24352A] overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'signin' ? (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-8"
              >
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#EAF2ED] mb-2">Sign In</h2>
                  <p className="text-[#8CA398]">Enter your credentials to access your account</p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-5">
                  {signInError && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{signInError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="login" className="text-[#EAF2ED]">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B8378]" />
                      <Input
                        id="login"
                        type="text"
                        placeholder="your@email.com"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        className="pl-10 h-12 border-[#24352A] bg-[#111713] text-[#EAF2ED] placeholder:text-[#6B8378] focus:border-[#16C784]"
                        required
                        disabled={isLoadingSignIn}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[#EAF2ED]">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B8378]" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 border-[#24352A] bg-[#111713] text-[#EAF2ED] placeholder:text-[#6B8378] focus:border-[#16C784]"
                        required
                        disabled={isLoadingSignIn}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B8378] hover:text-[#8CA398]"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Sign In Button */}
                  <Button
                    type="submit"
                    disabled={isLoadingSignIn}
                    className="w-full h-12 bg-[#16C784] hover:bg-[#0EA968] text-white shadow-lg group transition-all duration-200"
                  >
                    {isLoadingSignIn ? (
                      <span>Signing in...</span>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>

                  {/* Forgot Password */}
                  <div className="text-center">
                    <Link
                      to="/reset-password"
                      className="text-sm text-[#16C784] hover:text-[#0EA968] transition-colors font-medium"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-6 sm:p-8"
              >
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#EAF2ED] mb-2">Sign Up</h2>
                  <p className="text-[#8CA398]">Create your account to get started</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  {signUpError && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{signUpError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Username Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-[#EAF2ED]">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B8378]" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="johndoe"
                        value={formData.username}
                        onChange={(e) => handleChange('username', e.target.value)}
                        className={`pl-10 h-11 bg-[#111713] text-[#EAF2ED] placeholder:text-[#6B8378] ${
                          fieldErrors.username 
                            ? 'border-red-500' 
                            : 'border-[#24352A] focus:border-[#16C784]'
                        }`}
                        required
                        disabled={isLoadingSignUp}
                      />
                    </div>
                    {fieldErrors.username && (
                      <p className="text-xs text-red-400">{fieldErrors.username}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[#EAF2ED]">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B8378]" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`pl-10 h-11 bg-[#111713] text-[#EAF2ED] placeholder:text-[#6B8378] ${
                          fieldErrors.email 
                            ? 'border-red-500' 
                            : 'border-[#24352A] focus:border-[#16C784]'
                        }`}
                        required
                        disabled={isLoadingSignUp}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-xs text-red-400">{fieldErrors.email}</p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber" className="text-[#EAF2ED]">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B8378]" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="0701443xx54"
                        value={formData.phoneNumber}
                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                        className={`pl-10 h-11 bg-[#111713] text-[#EAF2ED] placeholder:text-[#6B8378] ${
                          fieldErrors.phone_number 
                            ? 'border-red-500' 
                            : 'border-[#24352A] focus:border-[#16C784]'
                        }`}
                        required
                        disabled={isLoadingSignUp}
                      />
                    </div>
                    {fieldErrors.phone_number && (
                      <p className="text-xs text-red-400">{fieldErrors.phone_number}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-[#EAF2ED]">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B8378]" />
                      <Input
                        id="signup-password"
                        type={showSignUpPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        className="pl-10 pr-10 h-11 border-[#24352A] bg-[#111713] text-[#EAF2ED] placeholder:text-[#6B8378] focus:border-[#16C784]"
                        required
                        disabled={isLoadingSignUp}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B8378] hover:text-[#8CA398]"
                      >
                        {showSignUpPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-[#EAF2ED]">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B8378]" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        className="pl-10 pr-10 h-11 border-[#24352A] bg-[#111713] text-[#EAF2ED] placeholder:text-[#6B8378] focus:border-[#16C784]"
                        required
                        disabled={isLoadingSignUp}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B8378] hover:text-[#8CA398]"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-400">Passwords do not match</p>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                      className="mt-0.5"
                    />
                    <label htmlFor="terms" className="text-xs text-[#8CA398] cursor-pointer">
                      I agree to the Terms of Service and Privacy Policy
                    </label>
                  </div>

                  {/* Sign Up Button */}
                  <Button
                    type="submit"
                    disabled={isLoadingSignUp || !agreedToTerms || formData.password !== formData.confirmPassword}
                    className="w-full h-12 bg-[#16C784] hover:bg-[#0EA968] text-white shadow-lg group disabled:opacity-50 transition-all duration-200"
                  >
                    {isLoadingSignUp ? (
                      <span>Creating account...</span>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 flex items-center justify-center gap-4 sm:gap-6 text-xs text-[#8CA398]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-[#16C784] rounded-full"></div>
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            <span>256-bit SSL</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}