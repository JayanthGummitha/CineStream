'use client';

import React, { useState, useEffect, lazy, Suspense, memo } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import StepIndicator from './StepIndicator';
import { Button } from '@/components/ui/button';
import SimpleBg from './SimpleBg';
import SilkCanvas from './SilkCanvas'

import { Label } from '@/components/ui/label';

// Lazy load step components for better code splitting
const Step1PaymentMethod = lazy(() => import('./Steps/Step1PaymentMethod'));
const Step2BillingInfo = lazy(() => import('./Steps/Step2BillingInfo'));
const Step3Review = lazy(() => import('./Steps/Step3Review'));
const Step4Success = lazy(() => import('./Steps/Step4Success'));

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
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Suppress browser extension errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('message channel closed')) {
        event.preventDefault();
        return true;
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Sample coupon codes (in production, validate these on the backend)
  const validCoupons: Record<string, number> = {
    'WELCOME10': 10,
    'SAVE20': 20,
    'SPECIAL25': 25,
    'NEWYEAR15': 15,
  };

  const handleApplyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (validCoupons[code]) {
      setAppliedCoupon({ code, discount: validCoupons[code] });
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Calculate prices with discount
  const calculatePrices = () => {
    const basePrice = planDetails?.price || 99;
    const discountAmount = appliedCoupon ? (basePrice * appliedCoupon.discount) / 100 : 0;
    const priceAfterDiscount = basePrice - discountAmount;
    const tax = priceAfterDiscount * 0.09;
    const total = priceAfterDiscount + tax;

    return {
      basePrice,
      discountAmount,
      priceAfterDiscount,
      tax,
      total
    };
  };

  // Extract plan details from URL parameters
  useEffect(() => {
    const planId = searchParams.get('planId');
    const planName = searchParams.get('planName');
    const price = searchParams.get('price');
    const billingCycle = searchParams.get('billingCycle') as 'monthly' | 'annual';
    const currency = searchParams.get('currency');

    // Only update if we have all required params and planDetails is not already set
    if (planId && planName && price && billingCycle && currency && !planDetails) {
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
    }
  }, []); // Empty dependency array - only run once on mount

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
    const stepProps = {
      data: formData,
      updateData: updateFormData,
      planDetails,
      appliedCoupon,
      calculatePrices
    };

    return (
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
        </div>
      }>
        {currentStep === 1 && <Step1PaymentMethod {...stepProps} />}
        {currentStep === 2 && <Step2BillingInfo data={formData} updateData={updateFormData} />}
        {currentStep === 3 && <Step3Review {...stepProps} />}
      </Suspense>
    );
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
      {currentStep === 4 && (
        <Suspense fallback={null}>
          <Step4Success 
            data={formData} 
            planDetails={planDetails} 
            onReset={handleReset}
            appliedCoupon={appliedCoupon}
            calculatePrices={calculatePrices}
          />
        </Suspense>
      )}

      <div className={`w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[750px] transition-all duration-500 ${currentStep === 4 ? 'scale-95 opacity-50 blur-sm pointer-events-none' : ''}`}>

        {/* Left Sidebar */}
        <div className="w-full md:w-1/2 relative bg-gray-600 backdrop-blur-[1px] text-white flex flex-col overflow-hidden">
          {/* <SimpleBg /> */}
          <SilkCanvas/>

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

              <div className="mt-3 space-y-6">
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
                        {calculatePrices().basePrice.toFixed(2)}
                      </span>
                    </div>


                    {/* Coupon Input */}
                    <div className=" grid space-y-2">
                      <Label>Discount: </Label>
                      <div className="flex space-x-2">
                        <input
                          type="password"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value);
                            setCouponError('');
                          }}
                          disabled={!!appliedCoupon}
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                          onClick={appliedCoupon ? handleRemoveCoupon : handleApplyCoupon}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors"
                        >
                          {appliedCoupon ? 'Clear' : 'Apply'}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-red-400 text-xs mt-2">{couponError}</p>
                      )}
                      {appliedCoupon && (
                        <p className="text-green-400 text-xs mt-2">
                          ✓ Coupon code applied successfully!
                        </p>
                      )}
                    </div>

                    {/* Discount */}
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-400">
                        <span className="flex items-center space-x-2">
                          <span>Discount ({appliedCoupon.discount}%)</span>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-xs cursor-pointer text-red-400 hover:text-red-300 underline"
                          >
                            Remove
                          </button>
                        </span>
                        <span>
                          -{planDetails?.currency === 'INR' ? '₹' : '$'}
                          {calculatePrices().discountAmount.toFixed(2)}
                        </span>
                      </div>
                    )}


                    <div className="flex justify-between">
                      <span className="text-gray-300">Tax (9%)</span>
                      <span>
                        {planDetails?.currency === 'INR' ? '₹' : '$'}
                        {calculatePrices().tax.toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t border-white/20 pt-3 flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span>
                        {planDetails?.currency === 'INR' ? '₹' : '$'}
                        {calculatePrices().total.toFixed(2)}
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



