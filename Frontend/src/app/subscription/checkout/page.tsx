'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import StepIndicator from './StepIndicator';
import { Button } from '@/components/ui/button';
import Step1PaymentMethod from './Steps/Step1PaymentMethod';
import Step2BillingInfo from './Steps/Step2BillingInfo';
import Step3Review from './Steps/Step3Review';
import Step4Success from './Steps/Step4Success';

// Lazy load the heavy SilkCanvas component
const SilkCanvas = lazy(() => import('./SilkCanvas'));

// Form data type definition
export type PaymentMethod = 
  | 'Credit card' 
  | 'Debit card' 
  | 'Apple Pay' 
  | 'Google Pay' 
  | 'PayPal' 
//   | 'Affirm' 
//   | 'ACH Bank Transfer';

export interface FormData {
  paymentMethod: PaymentMethod;
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardName: string;
  address: string;
  city: string;
  zip: string;
  agreed: boolean;
}

// Plan details interface
export interface PlanDetails {
  planId: string;
  planName: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  currency: string;
  features?: string[];
}

const INITIAL_DATA: FormData = {
  paymentMethod: 'Credit card',
  cardNumber: '',
  expiry: '',
  cvv: '',
  cardName: '',
  address: '',
  city: '',
  zip: '',
  agreed: false
};

const App: React.FC = () => {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isProcessing, setIsProcessing] = useState(false);
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);

  // Extract plan details from URL parameters
  useEffect(() => {
    const planId = searchParams.get('planId');
    const planName = searchParams.get('planName');
    const price = searchParams.get('price');
    const billingCycle = searchParams.get('billingCycle') as 'monthly' | 'annual';
    const currency = searchParams.get('currency');

    if (planId && planName && price && billingCycle && currency) {
      // Get plan features based on planId
      const getPlanFeatures = (id: string): string[] => {
        switch (id) {
          case 'basic':
            return [
              'Extended content library',
              '2 user profiles',
              'HD quality streaming',
              'Watch on 2 devices',
              '14-day free trial'
            ];
          case 'premium':
            return [
              'Complete content library',
              '3 user profiles',
              'Full HD streaming',
              'Watch on 3 devices',
              'Ad-free experience',
              'Download up to 3 titles',
              'Group watch feature',
              'Priority support'
            ];
          case 'family':
            return [
              'Complete content library',
              '5 user profiles',
              '4K UHD streaming',
              'Watch on 5 devices',
              'Ad-free experience',
              'Download up to 10 titles',
              'Group watch feature',
              'Kids profiles with parental controls',
              'Priority support',
              'Early access to new releases'
            ];
          default:
            return [
              'Unlimited access to all features',
              'Priority customer support',
              'Advanced analytics dashboard'
            ];
        }
      };

      setPlanDetails({
        planId,
        planName,
        price: parseFloat(price),
        billingCycle,
        currency,
        features: getPlanFeatures(planId)
      });
      console.log('Plan details loaded:', { planId, planName, price, billingCycle, currency });
    }
  }, [searchParams]);

  const updateFormData = (fields: Partial<FormData>) => {
    setFormData((prev: FormData) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (!formData.agreed) {
      alert("Please agree to the terms.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(4);
    }, 2000);
  };

  const handleReset = () => {
    setFormData(INITIAL_DATA);
    setCurrentStep(1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1PaymentMethod data={formData} updateData={updateFormData} planDetails={planDetails} />;
      case 2:
        return <Step2BillingInfo data={formData} updateData={updateFormData} />;
      case 3:
        return <Step3Review data={formData} updateData={updateFormData} planDetails={planDetails} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return { title: 'Payment Method', subtitle: "Choose how you'd like to pay" };
      case 2: return { title: 'Card Details', subtitle: "Enter your payment information" };
      case 3: return { title: 'Review & Confirm', subtitle: "Please review your order before completing" };
      default: return { title: '', subtitle: '' };
    }
  };

  const { title, subtitle } = getStepTitle();

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 font-geist relative">
      {currentStep === 4 && <Step4Success data={formData} planDetails={planDetails} onReset={handleReset} />}
      
      <div className={`w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[750px] transition-all duration-500 ${currentStep === 4 ? 'scale-95 opacity-50 blur-sm pointer-events-none' : ''}`}>
        
        {/* Left Sidebar */}
        <div className="w-full md:w-1/2 relative bg-gray-900 text-white flex flex-col overflow-hidden">
          <Suspense fallback={
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
          }>
            <SilkCanvas />
          </Suspense>
          
          <div className="relative z-10 flex flex-col h-full p-8 md:p-12 bg-black/10 backdrop-blur-[1px]">
            <div className="mb-8 md:mb-12">
              <h1 className="text-3xl font-light tracking-tight mb-2">Order Summary</h1>
              <p className="text-sm text-gray-300">Review your purchase details</p>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              {/* Steps Progress */}
              <div className="space-y-6 mb-8 md:mb-0">
                <StepIndicator stepNumber={1} currentStep={currentStep > 3 ? 3 : currentStep} label="Payment Method" />
                <StepIndicator stepNumber={2} currentStep={currentStep > 3 ? 3 : currentStep} label="Billing Information" />
                <StepIndicator stepNumber={3} currentStep={currentStep > 3 ? 3 : currentStep} label="Review & Confirm" />
              </div>

              <div className="space-y-6">
                {/* Product Details */}
                <div className="bg-black/30 rounded-xl p-6 backdrop-blur-md border border-white/10">
                  <h3 className="font-medium mb-4 text-lg">
                    {planDetails?.planName || 'Premium Plan'}
                  </h3>
                  <div className="space-y-3 text-sm">
                    {(planDetails?.features || ['Unlimited access to all features', 'Priority customer support', 'Advanced analytics dashboard']).map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <Check size={16} className="text-emerald-400 shrink-0" />
                        <span className="text-gray-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-black/30 rounded-xl p-6 backdrop-blur-md border border-white/10">
                  <h3 className="font-medium mb-4">Payment Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">
                        {planDetails?.planName || 'Premium Plan'} ({planDetails?.billingCycle === 'annual' ? '1 year' : '1 month'})
                      </span>
                      <span>
                        {planDetails?.currency === 'INR' ? '₹' : '$'}
                        {planDetails?.price.toFixed(2) || '99.00'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Tax (9%)</span>
                      <span>
                        {planDetails?.currency === 'INR' ? '₹' : '$'}
                        {((planDetails?.price || 99) * 0.09).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-white/20 pt-3 flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span>
                        {planDetails?.currency === 'INR' ? '₹' : '$'}
                        {((planDetails?.price || 99) * 1.09).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full md:w-1/2 bg-gray-50 flex flex-col">
          <div className="border-b border-gray-200 bg-white p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-gray-900 mb-2">Secure Payment</h2>
            <p className="text-sm text-gray-500">Complete your purchase safely and securely</p>
          </div>

          <div className="flex-1 flex flex-col p-8 md:p-10">
            <div className="flex-1 max-w-md mx-auto w-full">
              <div className="mb-8">
                <h3 className="text-xl font-medium text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-700">{subtitle}</p>
              </div>

              {renderStep()}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between max-w-md mx-auto w-full">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={handleBack} className="pl-4 border-gray-300 bg-black">
                  <div className="flex items-center space-x-2">
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </div>
                </Button>
              ) : (
                <div /> /* Spacer */
              )}
              
              <Button variant="outline" onClick={handleNext} disabled={isProcessing} className="min-w-[140px] flex justify-center bg-black  text-white">
                {isProcessing ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{currentStep === 3 ? 'Complete Payment' : 'Continue'}</span>
                    {currentStep !== 3 && <ArrowRight size={16} />}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;