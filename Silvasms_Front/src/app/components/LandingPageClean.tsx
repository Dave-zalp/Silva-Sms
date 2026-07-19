import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Globe, 
  CheckCircle,
  MessageSquare,
  Lock,
  Check,
  Menu,
  X,
  ChevronDown
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0F1E] dark:bg-[#0A0F1E] transition-colors">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0A0F1E]/90 dark:bg-[#0A0F1E]/90 border-b border-[#1E2A45] dark:border-[#1E2A45] transition-all backdrop-blur-[12px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-[#3B82F6] rounded-md flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex items-baseline gap-0">
                <span className="text-[18px] lg:text-xl font-bold text-[#F1F5F9]">Golden</span>
                <span className="text-[18px] lg:text-xl font-bold text-[#3B82F6]">SMS</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-[#94A3B8] dark:text-[#94A3B8] hover:text-[#3B82F6] transition-colors duration-200 font-medium text-[15px]">
                Features
              </a>
              <a href="#how-it-works" className="text-[#94A3B8] dark:text-[#94A3B8] hover:text-[#3B82F6] transition-colors duration-200 font-medium text-[15px]">
                How It Works
              </a>
              <a href="#pricing" className="text-[#94A3B8] dark:text-[#94A3B8] hover:text-[#3B82F6] transition-colors duration-200 font-medium text-[15px]">
                Pricing
              </a>
              <a href="#faq" className="text-[#94A3B8] dark:text-[#94A3B8] hover:text-[#3B82F6] transition-colors duration-200 font-medium text-[15px]">
                FAQ
              </a>
            </div>

            {/* Right Section - Theme Toggle BETWEEN logo and hamburger on mobile */}
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="order-1 lg:order-2">
                <ThemeToggle />
              </div>
              <Button 
                onClick={onGetStarted} 
                className="hidden sm:inline-flex order-2 lg:order-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-md px-4 lg:px-5 py-2 lg:py-2.5 font-semibold text-sm lg:text-[15px] shadow-sm min-h-[44px] transition-all duration-200"
              >
                Get Started
              </Button>
              
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden order-3 text-[#F1F5F9] dark:text-[#F1F5F9] hover:bg-[#1E2A45] min-w-[44px] min-h-[44px] transition-all duration-200"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu with slide-down animation */}
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="lg:hidden py-4 border-t border-[#1E2A45]"
            >
              <div className="flex flex-col">
                <a 
                  href="#features" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#F1F5F9] hover:bg-[#0F1729] rounded-lg transition-all duration-200 font-medium min-h-[48px] flex items-center border-l-2 border-transparent hover:border-[#3B82F6]"
                >
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#F1F5F9] hover:bg-[#0F1729] rounded-lg transition-all duration-200 font-medium min-h-[48px] flex items-center border-l-2 border-transparent hover:border-[#3B82F6]"
                >
                  How It Works
                </a>
                <a 
                  href="#pricing" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#F1F5F9] hover:bg-[#0F1729] rounded-lg transition-all duration-200 font-medium min-h-[48px] flex items-center border-l-2 border-transparent hover:border-[#3B82F6]"
                >
                  Pricing
                </a>
                <a 
                  href="#faq" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#F1F5F9] hover:bg-[#0F1729] rounded-lg transition-all duration-200 font-medium min-h-[48px] flex items-center border-l-2 border-transparent hover:border-[#3B82F6]"
                >
                  FAQ
                </a>
                <Button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onGetStarted();
                  }}
                  className="sm:hidden bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-md mt-4 min-h-[48px] transition-all duration-200"
                >
                  Get Started
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 md:py-16 lg:py-24 px-4 sm:px-6 bg-[#0A0F1E] overflow-hidden">
        {/* Subtle blue glow top right - mobile optimized */}
        <div 
          className="absolute top-0 right-0 w-full h-full pointer-events-none" 
          style={{
            background: 'radial-gradient(ellipse at 90% 0%, rgba(59,130,246,0.12) 0%, transparent 60%)'
          }}
        ></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left"
            >
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E2A45] border border-[#2A3A5C] mb-5 sm:mb-6">
                <Lock className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span className="text-xs sm:text-sm text-[#94A3B8] font-medium">Trusted by 10,000+ users worldwide</span>
              </div>

              <h1 className="mb-5 sm:mb-6 leading-[1.2] tracking-[-0.02em]">
                <span className="block text-[30px] sm:text-4xl md:text-5xl lg:text-[58px] font-extrabold text-[#F1F5F9] mb-2">
                  Instant SMS Verification
                </span>
                <span className="block text-[30px] sm:text-4xl md:text-5xl lg:text-[58px] font-extrabold text-[#F1F5F9]">
                  Without Exposing Your Number
                </span>
              </h1>

              <p className="text-[15px] sm:text-lg text-[#94A3B8] mb-8 sm:mb-10 leading-[1.6] max-w-[90%] lg:max-w-xl">
                Get virtual phone numbers from 150+ countries. Keep your real number completely private.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8 sm:mb-10">
                <Button 
                  onClick={onGetStarted}
                  className="w-full sm:w-auto bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-[8px] px-8 py-6 text-[14px] sm:text-base font-semibold shadow-lg min-h-[50px] transition-all duration-200"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto bg-transparent border border-[#2A3A5C] text-[#94A3B8] hover:border-[#3B82F6] hover:text-white rounded-[8px] px-8 py-6 text-[14px] sm:text-base font-semibold min-h-[50px] transition-all duration-200"
                >
                  See How It Works
                </Button>
              </div>

              {/* Trust Row - 2 on first row, 1 on second row on mobile */}
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-[13px] sm:text-sm text-[#94A3B8]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span>Instant Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span>100% Anonymous</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span>150+ Countries</span>
                </div>
              </div>
            </motion.div>

            {/* Right Mockup - SMS Inbox Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full max-w-md mx-auto lg:max-w-none"
            >
              <div 
                className="bg-[#1E2A45] rounded-2xl p-4 sm:p-6 md:p-8 border border-[#2A3A5C] max-w-full mx-4 lg:mx-0" 
                style={{
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                }}
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[#2A3A5C]">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#3B82F6]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[#F1F5F9] text-sm">SMS Inbox</div>
                    <div className="text-xs text-[#64748B]">Verification Codes</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 sm:p-4 bg-[#0F1729] rounded-xl border border-[#2A3A5C]/50">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#22C55E] flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={3} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#F1F5F9]">WhatsApp</span>
                        <span className="text-xs text-[#64748B]">2m ago</span>
                      </div>
                      <div className="text-sm text-[#94A3B8] break-all">
                        Your code: <span className="font-mono font-bold text-[#3B82F6]">738294</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 sm:p-4 bg-[#0F1729] rounded-xl border border-[#2A3A5C]/50">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#22C55E] flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={3} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#F1F5F9]">Instagram</span>
                        <span className="text-xs text-[#64748B]">5m ago</span>
                      </div>
                      <div className="text-sm text-[#94A3B8] break-all">
                        Verification: <span className="font-mono font-bold text-[#3B82F6]">562184</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 md:py-28 lg:py-32 px-4 sm:px-6 bg-[#0F1729]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-[26px] sm:text-4xl lg:text-[40px] font-bold text-[#F1F5F9] mb-3 sm:mb-4 tracking-tight px-4">
                Built for Speed, Privacy & Simplicity
              </h2>
              <p className="text-[14px] sm:text-lg text-[#94A3B8] px-4">
                Professional-grade SMS verification for individuals and businesses
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Globe,
                title: "Global Coverage",
                description: "Access virtual numbers from 150+ countries worldwide for any verification need"
              },
              {
                icon: Zap,
                title: "Instant Codes",
                description: "Receive SMS verification codes in seconds, not minutes. No waiting around"
              },
              {
                icon: Lock,
                title: "Pay As You Go",
                description: "No subscriptions or hidden fees. Only pay for the numbers you actually use"
              },
              {
                icon: Shield,
                title: "Full Anonymity",
                description: "Zero personal data stored. Your privacy is protected and guaranteed"
              },
              {
                icon: MessageSquare,
                title: "All Platforms",
                description: "Works with WhatsApp, Twitter, Instagram, Telegram, and 145+ more services"
              },
              {
                icon: CheckCircle,
                title: "No Commitments",
                description: "Start free with no credit card required. Cancel anytime without penalties"
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-full"
                >
                  <Card className="h-full bg-[#1E2A45] border border-[#2A3A5C] rounded-xl hover:border-[#3B82F6] active:border-[#3B82F6] active:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:-translate-y-1 transition-all duration-200 group max-w-full">
                    <CardContent className="p-5 sm:p-7">
                      <div className="w-11 h-11 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center mb-4 sm:mb-5">
                        <Icon className="w-5 h-5 text-[#3B82F6]" strokeWidth={2} />
                      </div>
                      <h3 className="text-base sm:text-[17px] font-semibold text-[#F1F5F9] mb-2 sm:mb-3">{feature.title}</h3>
                      <p className="text-[14px] text-[#94A3B8] leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 md:py-28 lg:py-32 px-4 sm:px-6 bg-[#0A0F1E]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-[26px] sm:text-4xl lg:text-[40px] font-bold text-[#F1F5F9] tracking-tight px-4">
                Up and Running in 60 Seconds
              </h2>
            </motion.div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block relative">
            {/* Dashed line connector - desktop only */}
            <div className="absolute top-24 left-[20%] right-[20%] h-0.5 border-t-2 border-dashed border-[#3B82F6]/30"></div>
            
            <div className="grid lg:grid-cols-3 gap-12 relative">
              {[
                {
                  number: "01",
                  title: "Pick a Country & Platform",
                  description: "Select from 150+ countries and choose the service you want to verify"
                },
                {
                  number: "02",
                  title: "Get Your Virtual Number",
                  description: "Receive an instant temporary phone number ready for verification"
                },
                {
                  number: "03",
                  title: "Receive Your SMS Code",
                  description: "Your verification code appears in your dashboard within seconds"
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="text-center relative"
                >
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-[#1E2A45] border-2 border-[#3B82F6] mb-8 relative z-10">
                    <span className="text-5xl font-bold text-[#3B82F6]">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#F1F5F9] mb-4">{step.title}</h3>
                  <p className="text-[#94A3B8] leading-relaxed max-w-xs mx-auto">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile Layout - Vertical with left dashed line */}
          <div className="lg:hidden relative max-w-md mx-auto">
            {/* Vertical dashed line on left */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-[#3B82F6]/30"></div>
            
            <div className="space-y-8">
              {[
                {
                  number: "01",
                  title: "Pick a Country & Platform",
                  description: "Select from 150+ countries and choose the service you want to verify"
                },
                {
                  number: "02",
                  title: "Get Your Virtual Number",
                  description: "Receive an instant temporary phone number ready for verification"
                },
                {
                  number: "03",
                  title: "Receive Your SMS Code",
                  description: "Your verification code appears in your dashboard within seconds"
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="flex gap-6 relative"
                >
                  {/* Number Circle */}
                  <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-[#1E2A45] border-2 border-[#3B82F6] relative z-10">
                    <span className="text-2xl font-bold text-[#3B82F6]">{step.number}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h3 className="text-lg font-bold text-[#F1F5F9] mb-2">{step.title}</h3>
                    <p className="text-sm text-[#94A3B8] leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 bg-[#2563EB]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            {[
              { number: "150+", label: "Countries Available" },
              { number: "145+", label: "Platforms Supported" },
              { number: "99.9%", label: "Uptime Guarantee" },
              { number: "<30s", label: "Average Delivery" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center relative"
              >
                {/* Mobile dividers - 2x2 grid */}
                {index === 1 && (
                  <div className="lg:hidden absolute top-0 left-0 w-px h-full bg-white/15"></div>
                )}
                {index === 3 && (
                  <div className="lg:hidden absolute top-0 left-0 w-px h-full bg-white/15"></div>
                )}
                {index < 2 && (
                  <div className="lg:hidden absolute bottom-0 left-0 right-0 h-px bg-white/15"></div>
                )}
                
                {/* Desktop dividers */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-0 right-0 w-px h-full bg-white/20"></div>
                )}
                
                <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">{stat.number}</div>
                <div className="text-xs sm:text-sm text-white/75 px-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 md:py-28 lg:py-32 px-4 sm:px-6 bg-white dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#0F172A] dark:text-white mb-3 sm:mb-4 tracking-tight px-4">
                Trusted by Thousands Worldwide
              </h2>
              <p className="text-base sm:text-lg text-[#64748B] dark:text-slate-400 max-w-2xl mx-auto px-4">
                Join users from around the globe who rely on GoldenSMS for secure, private verification
              </p>
            </motion.div>
          </div>

          {/* Use Cases */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: "Social Media Verification",
                description: "Create and verify multiple accounts on Twitter, Instagram, Facebook, TikTok, and more without exposing your personal number.",
                icon: MessageSquare
              },
              {
                title: "Privacy Protection",
                description: "Test new services, sign up for trials, or create accounts while keeping your real phone number completely private.",
                icon: Lock
              },
              {
                title: "International Access",
                description: "Access region-locked services and platforms by using virtual numbers from specific countries worldwide.",
                icon: Globe
              }
            ].map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-full"
                >
                  <Card className="h-full bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-5 sm:p-7 max-w-full">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-[#EFF6FF] dark:bg-[#1E3A8A] flex items-center justify-center mb-5 sm:mb-6">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#2563EB] dark:text-blue-400" strokeWidth={2} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#0F172A] dark:text-white mb-2 sm:mb-3">{useCase.title}</h3>
                    <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-400 leading-relaxed">{useCase.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-20 md:py-28 lg:py-32 px-4 sm:px-6 bg-[#F1F5F9] dark:bg-[#0F172A]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#0F172A] dark:text-white tracking-tight px-4">
                Frequently Asked Questions
              </h2>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  question: "How does GoldenSMS work?",
                  answer: "GoldenSMS provides temporary phone numbers from 150+ countries. You select a country and service (like Twitter or WhatsApp), receive a number instantly, use it for verification, and the SMS code appears in your dashboard within seconds."
                },
                {
                  question: "What platforms are supported?",
                  answer: "You can verify 150+ platforms including Twitter, Facebook, Instagram, WhatsApp, Telegram, TikTok, Discord, Google, Microsoft, dating apps, crypto exchanges, and many more. We support virtually all major online services."
                },
                {
                  question: "How much does it cost?",
                  answer: "We use a pay-as-you-go wallet system. You only pay for the numbers you use, with prices starting from as low as ₦50. There are no monthly fees, subscriptions, or hidden charges."
                },
                {
                  question: "Is my data safe?",
                  answer: "Absolutely! GoldenSMS is designed to protect your privacy. We don't require your personal phone number, and all temporary numbers are completely separate from your identity. We use bank-level encryption to protect all data."
                },
                {
                  question: "Can I get a refund if the number doesn't work?",
                  answer: "Yes! If you don't receive an SMS code within the valid period, you can cancel the activation and receive a full refund to your wallet automatically. We only charge for successful verifications."
                }
              ].map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`} 
                  className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg px-4 sm:px-5 py-1 data-[state=open]:border-l-[3px] data-[state=open]:border-l-[#2563EB] transition-all"
                >
                  <AccordionTrigger className="text-sm sm:text-base font-semibold text-[#0F172A] dark:text-white hover:no-underline py-4 sm:py-5 data-[state=open]:text-[#2563EB] text-left min-h-[56px]">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm sm:text-base text-[#64748B] dark:text-slate-400 pb-4 sm:pb-5 pt-1 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="relative py-16 sm:py-20 md:py-28 lg:py-32 px-4 sm:px-6 bg-[#0F172A] dark:bg-[#020617] overflow-hidden">
        {/* Subtle blue radial glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[400px] bg-[#2563EB]/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-white mb-4 sm:mb-6 tracking-tight px-4">
              Ready to Verify Smarter?
            </h2>
            <p className="text-base sm:text-lg text-[#94A3B8] mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
              No credit card needed. Start free in under 60 seconds.
            </p>
            <Button 
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-white hover:bg-[#2563EB] text-[#0F172A] hover:text-white rounded-md px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg font-semibold shadow-xl transition-all min-h-[48px]"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 px-4 sm:px-6 bg-[#020617] border-t border-[#1E293B]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2563EB] rounded-md flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex items-baseline gap-0">
                <span className="text-xl font-bold text-gray-300">Golden</span>
                <span className="text-xl font-bold text-[#2563EB]">SMS</span>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
              <a href="#features" className="text-[#94A3B8] hover:text-white transition-colors py-2 min-h-[40px] flex items-center">Features</a>
              <a href="#how-it-works" className="text-[#94A3B8] hover:text-white transition-colors py-2 min-h-[40px] flex items-center">How It Works</a>
              <a href="#pricing" className="text-[#94A3B8] hover:text-white transition-colors py-2 min-h-[40px] flex items-center">Pricing</a>
              <a href="#faq" className="text-[#94A3B8] hover:text-white transition-colors py-2 min-h-[40px] flex items-center">FAQ</a>
              <a href="#" className="text-[#94A3B8] hover:text-white transition-colors py-2 min-h-[40px] flex items-center">Privacy</a>
              <a href="#" className="text-[#94A3B8] hover:text-white transition-colors py-2 min-h-[40px] flex items-center">Terms</a>
            </div>

            {/* Copyright */}
            <div className="text-sm text-[#94A3B8]">
              © 2024 GoldenSMS
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}