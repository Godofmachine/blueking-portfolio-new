import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ChevronLeft, ChevronRight, Check, Calendar, DollarSign, MessageSquare, User, Building, ChevronDown, AlertCircle, Phone, Globe } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

type ServiceType = 'development' | 'design' | 'motion';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: ServiceType;
}

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  country: string;
  countryCode: string;
  budget: string;
  timeline: string;
  description: string;
  requirements: string[];
  otherRequirement?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  description?: string;
  requirements?: string;
  budget?: string;
  timeline?: string;
}

// Country data with codes
const countries = [
  { name: 'Nigeria', code: 'NG', dialCode: '+234' },
  { name: 'United States', code: 'US', dialCode: '+1' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44' },
  { name: 'Canada', code: 'CA', dialCode: '+1' },
  { name: 'Ghana', code: 'GH', dialCode: '+233' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27' },
  { name: 'Kenya', code: 'KE', dialCode: '+254' },
  { name: 'India', code: 'IN', dialCode: '+91' },
  { name: 'Australia', code: 'AU', dialCode: '+61' },
  { name: 'Germany', code: 'DE', dialCode: '+49' },
  { name: 'France', code: 'FR', dialCode: '+33' },
  { name: 'China', code: 'CN', dialCode: '+86' },
  { name: 'Japan', code: 'JP', dialCode: '+81' },
  { name: 'Brazil', code: 'BR', dialCode: '+55' },
  { name: 'Mexico', code: 'MX', dialCode: '+52' },
];

const serviceConfig = {
  development: {
    title: 'Website Development',
    steps: ['Contact Info', 'Project Details', 'Requirements', 'Timeline & Budget'],
    budgetOptions: ['$2,000 - $5,000', '$5,000 - $10,000', '$10,000 - $20,000', '$20,000+'],
    requirements: ['Responsive Design', 'E-commerce', 'CMS Integration', 'SEO Optimization', 'Analytics', 'Custom Animations']
  },
  design: {
    title: 'Graphic Design / Video Graphic',
    steps: ['Contact Info', 'Project Details', 'Requirements', 'Timeline & Budget'],
    budgetOptions: ['$500 - $1,000', '$1,000 - $2,500', '$2,500 - $5,000', '$5,000+'],
    requirements: ['Logo Design', 'Brand Identity', 'Print Materials', 'Digital Assets', 'Packaging Design', 'Marketing Materials', '2D Animation', '3D Animation', 'Logo Animation', 'Explainer Videos', 'Social Media Content', 'Commercial Videos', 'Other']
  },
  motion: {
    title: 'Graphic Design / Video Graphic',
    steps: ['Contact Info', 'Project Details', 'Requirements', 'Timeline & Budget'],
    budgetOptions: ['$500 - $1,000', '$1,000 - $2,500', '$2,500 - $5,000', '$5,000+'],
    requirements: ['Logo Design', 'Brand Identity', 'Print Materials', 'Digital Assets', 'Packaging Design', 'Marketing Materials', '2D Animation', '3D Animation', 'Logo Animation', 'Explainer Videos', 'Social Media Content', 'Commercial Videos', 'Other']
  }
};

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, serviceType }) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    country: 'Nigeria',
    countryCode: '+234',
    budget: '',
    timeline: '',
    description: '',
    requirements: [],
    otherRequirement: ''
  });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const config = serviceConfig[serviceType];

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 0:
        if (!formData.name.trim()) {
          newErrors.name = 'Name is required';
        }
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^[\d\s-]{7,}$/.test(formData.phone)) {
          newErrors.phone = 'Please enter a valid phone number';
        }
        if (!formData.country) {
          newErrors.country = 'Country is required';
        }
        break;

      case 1:
        if (!formData.description.trim()) {
          newErrors.description = 'Project description is required';
        } else if (formData.description.length < 50) {
          newErrors.description = 'Please provide more details about your project (minimum 50 characters)';
        }
        break;

      case 2:
        if (formData.requirements.length === 0) {
          newErrors.requirements = 'Please select at least one requirement';
        }
        break;

      case 3:
        if (!formData.budget) {
          newErrors.budget = 'Please select a budget range';
        }
        if (!formData.timeline) {
          newErrors.timeline = 'Please select a timeline';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < config.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRequirementToggle = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.includes(requirement)
        ? prev.requirements.filter(r => r !== requirement)
        : [...prev.requirements, requirement],
      otherRequirement: requirement === 'Other' ? prev.otherRequirement : prev.otherRequirement
    }));
  };

  const handleCountrySelect = (country: typeof countries[0]) => {
    setFormData(prev => ({
      ...prev,
      country: country.name,
      countryCode: country.dialCode
    }));
    setShowCountryDropdown(false);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: 'ad1363bd-b83b-4595-b733-c0ceb046086b',
          name: formData.name,
          email: formData.email,
          subject: `New ${config.title} Booking Request`,
          message: `
New Booking Request Details:

Service Type: ${config.title}

Contact Information:
- Name: ${formData.name}
- Email: ${formData.email}
- Phone: ${formData.countryCode} ${formData.phone}
- Country: ${formData.country}
- Company: ${formData.company || 'Not provided'}

Project Details:
- Description: ${formData.description}

Requirements:
${formData.requirements.map(req => `- ${req}`).join('\n')}
${formData.otherRequirement ? `\nOther Requirements:\n- ${formData.otherRequirement}` : ''}

Timeline & Budget:
- Budget Range: ${formData.budget}
- Timeline: ${formData.timeline}
          `.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Booking request sent!",
          description: "Thanks for your interest. I'll get back to you soon!",
          className: "z-[9999]"
        });
        onClose();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setSubmitError('Failed to submit the form. Please try again.');
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
        className: "z-[9999]"
      });
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const stepVariants = {
      enter: {
        x: 20,
        opacity: 0
      },
      center: {
        x: 0,
        opacity: 1
      },
      exit: {
        x: -20,
        opacity: 0
      }
    };

    const renderError = (error?: string) => {
      if (!error) return null;
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-red-500 text-sm mt-1"
        >
          <AlertCircle size={14} />
          {error}
        </motion.div>
      );
    };

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {(() => {
            switch (currentStep) {
              case 0:
                return (
                  <div className="space-y-6">
                    <div className="relative">
                      <input type="text" value={"Booking Form"} className='hidden' disabled readOnly/>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, name: e.target.value }));
                            if (errors.name) {
                              setErrors(prev => ({ ...prev, name: undefined }));
                            }
                          }}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-designer-purple focus:border-transparent transition-all ${
                            errors.name ? 'border-red-500' : 'border-gray-200'
                          }`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {renderError(errors.name)}
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium mb-2 text-gray-700">Email Address *</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, email: e.target.value }));
                            if (errors.email) {
                              setErrors(prev => ({ ...prev, email: undefined }));
                            }
                          }}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-designer-purple focus:border-transparent transition-all ${
                            errors.email ? 'border-red-500' : 'border-gray-200'
                          }`}
                          placeholder="Enter your email"
                        />
                      </div>
                      {renderError(errors.email)}
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-4 relative">
                        <label className="block text-sm font-medium mb-2 text-gray-700">Country *</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <button
                            type="button"
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-designer-purple focus:border-transparent transition-all text-left ${
                              errors.country ? 'border-red-500' : 'border-gray-200'
                            }`}
                          >
                            {formData.country}
                          </button>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          
                          {showCountryDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                              {countries.map((country) => (
                                <button
                                  key={country.code}
                                  type="button"
                                  onClick={() => handleCountrySelect(country)}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                >
                                  {country.name} ({country.dialCode})
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {renderError(errors.country)}
                      </div>

                      <div className="col-span-8 relative">
                        <label className="block text-sm font-medium mb-2 text-gray-700">Phone Number *</label>
                        <div className="relative flex">
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.countryCode}
                              readOnly
                              className="w-24 pl-10 pr-2 py-3 border border-r-0 border-gray-200 rounded-l-xl focus:outline-none bg-gray-50"
                            />
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          </div>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, phone: e.target.value }));
                              if (errors.phone) {
                                setErrors(prev => ({ ...prev, phone: undefined }));
                              }
                            }}
                            className={`flex-1 pl-4 pr-4 py-3 border rounded-r-xl focus:outline-none focus:ring-2 focus:ring-designer-purple focus:border-transparent transition-all ${
                              errors.phone ? 'border-red-500' : 'border-gray-200'
                            }`}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        {renderError(errors.phone)}
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium mb-2 text-gray-700">Company/Organization</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-designer-purple focus:border-transparent transition-all"
                          placeholder="Enter company name (optional)"
                        />
                      </div>
                    </div>
                  </div>
                );

              case 1:
                return (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Project Description *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, description: e.target.value }));
                          if (errors.description) {
                            setErrors(prev => ({ ...prev, description: undefined }));
                          }
                        }}
                        rows={4}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-designer-purple focus:border-transparent transition-all resize-none ${
                          errors.description ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder={`Describe your ${config.title.toLowerCase()} project in detail...`}
                      />
                      {renderError(errors.description)}
                    </div>
                  </div>
                );

              case 2:
                return (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-3 text-gray-700">Select Required Services</label>
                      <div className="grid grid-cols-2 gap-3">
                        {config.requirements.map((requirement) => (
                          <motion.button
                            key={requirement}
                            onClick={() => handleRequirementToggle(requirement)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 text-sm border rounded-xl transition-all duration-200 ${
                              formData.requirements.includes(requirement)
                                ? 'bg-black text-white border-black shadow-lg shadow-black/20'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-black hover:bg-black/5'
                            }`}
                          >
                            {requirement}
                          </motion.button>
                        ))}
                      </div>
                      {formData.requirements.includes('Other') && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4"
                        >
                          <label className="block text-sm font-medium mb-2 text-gray-700">Please specify your requirement</label>
                          <textarea
                            value={formData.otherRequirement || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, otherRequirement: e.target.value }))}
                            rows={2}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
                            placeholder="Describe your specific requirement..."
                          />
                        </motion.div>
                      )}
                      {renderError(errors.requirements)}
                    </div>
                  </div>
                );

              case 3:
                return (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-3 text-gray-700">Budget Range *</label>
                      <div className="grid grid-cols-1 gap-3">
                        {config.budgetOptions.map((budget) => (
                          <motion.button
                            key={budget}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, budget }));
                              if (errors.budget) {
                                setErrors(prev => ({ ...prev, budget: undefined }));
                              }
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 text-sm border rounded-xl transition-all duration-200 flex items-center gap-2 ${
                              formData.budget === budget
                                ? 'bg-black text-white border-black shadow-lg shadow-black/20'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-black hover:bg-black/5'
                            }`}
                          >
                            <DollarSign size={16} />
                            {budget}
                          </motion.button>
                        ))}
                      </div>
                      {renderError(errors.budget)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Project Timeline *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <select
                          value={formData.timeline}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, timeline: e.target.value }));
                            if (errors.timeline) {
                              setErrors(prev => ({ ...prev, timeline: undefined }));
                            }
                          }}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all appearance-none bg-white ${
                            errors.timeline ? 'border-red-500' : 'border-gray-200'
                          }`}
                        >
                          <option value="">Select timeline</option>
                          <option value="ASAP">ASAP (Rush Job)</option>
                          <option value="1-2 weeks">1-2 weeks</option>
                          <option value="3-4 weeks">3-4 weeks</option>
                          <option value="1-2 months">1-2 months</option>
                          <option value="2+ months">2+ months</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                      {renderError(errors.timeline)}
                    </div>
                  </div>
                );

              default:
                return null;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] z-[1000] overflow-y-auto p-8">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-3xl font-display font-bold text-gray-900">
            Book {config.title}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {config.steps.map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="relative flex items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    index <= currentStep 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {index < currentStep ? <Check size={18} /> : index + 1}
                </motion.div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className={`text-xs font-medium ${index <= currentStep ? 'text-black' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
              </div>
              {index < config.steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 transition-all duration-300 ${
                  index < currentStep ? 'bg-black' : 'bg-gray-100'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Submit Error */}
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2"
          >
            <AlertCircle size={18} />
            {submitError}
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isSubmitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all hover:bg-black/10 hover:text-black border-black/20"
          >
            <ChevronLeft size={18} />
            Previous
          </Button>

          {currentStep === config.steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-black hover:bg-black/90 active:bg-black/80 text-white flex items-center gap-2 px-6 py-3 rounded-xl transition-all shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Request
                  <Check size={18} />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="bg-black hover:bg-black/90 active:bg-black/80 text-white flex items-center gap-2 px-6 py-3 rounded-xl transition-all shadow-lg shadow-black/20"
            >
              Next
              <ChevronRight size={18} />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
