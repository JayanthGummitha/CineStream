'use client'
import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Check, ChevronDown, ChevronUp, CreditCard } from 'lucide-react';
import { FormData, PlanDetails } from '../page';

interface Step4Props {
  data: FormData;
  planDetails: PlanDetails | null;
  onReset: () => void;
}

const Step4Success: React.FC<Step4Props> = ({ data, planDetails, onReset }) => {
  const [showReceipt, setShowReceipt] = useState(true);

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22C55E', '#4ADE80', '#BBF7D0', '#F1F5F9', '#10B981']
    });
  };

  useEffect(() => {
    // Initial delay to match transition
    const timer = setTimeout(() => {
      fireConfetti();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  const nextMonth = new Date();
  
  // Calculate next billing date based on billing cycle
  if (planDetails?.billingCycle === 'annual') {
    nextMonth.setFullYear(nextMonth.getFullYear() + 1);
  } else {
    nextMonth.setMonth(nextMonth.getMonth() + 1);
  }
  
  const nextBilling = nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Calculate amounts
  const subtotal = planDetails?.price || 99.00;
  const tax = subtotal * 0.09;
  const total = subtotal + tax;
  const currencySymbol = planDetails?.currency === 'INR' ? '₹' : '$';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <style>{`
        @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.98); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes pulse-ring { 0%, 100% { opacity: 0.9; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.1); } }
        .modal-animation { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .pulse-animation { animation: pulse-ring 2s ease-in-out infinite; }
      `}</style>
      
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onReset} />

      {/* Modal */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 modal-animation">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3 text-green-500">
                <Check size={24} strokeWidth={3} />
              </div>
              <h3 className="text-gray-900 text-lg font-semibold">Payment successful</h3>
            </div>
            <button 
              onClick={onReset}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          <div className="py-2">
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Your payment has been processed successfully.
              A receipt has been sent to your email.
            </p>
            
            {/* Receipt Section */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showReceipt ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 mb-6">
                <div className="flex justify-between mb-4">
                  <span className="text-xs font-bold tracking-wider text-gray-400">ORDER #23491</span>
                  <span className="text-xs font-bold tracking-wider text-gray-400">{today}</span>
                </div>
                
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    {planDetails?.planName || 'Premium Plan'} Subscription
                  </h4>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      {planDetails?.billingCycle === 'annual' ? 'Annual Plan' : 'Monthly Plan'}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {currencySymbol}{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Next billing date: {nextBilling}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{currencySymbol}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (9%)</span>
                    <span className="text-gray-900">{currencySymbol}{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold mt-3 pt-3 border-t border-gray-200 text-gray-900">
                    <span>Total</span>
                    <span>{currencySymbol}{total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <div className="bg-white border border-gray-200 rounded p-1 mr-2 shadow-sm">
                       <CreditCard size={14} className="text-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {data.paymentMethod.includes('card')
                        ? `Card ending in ${data.cardNumber.slice(-4) || '****'}` 
                        : data.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <button 
                onClick={fireConfetti}
                className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 active:translate-y-[1px] text-white text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                Celebrate
              </button>
              <button 
                onClick={() => setShowReceipt(!showReceipt)}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors flex items-center justify-center"
              >
                {showReceipt ? 'Hide receipt' : 'Show receipt'}
                {showReceipt ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">Paid just now</span>
                <div className="flex items-center text-xs text-gray-400 font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 pulse-animation shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                  Payment system active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Success;