import React from 'react';
import { CreditCard, Wallet, Smartphone, Building2, Clock, Banknote } from 'lucide-react';
import { FormData, PaymentMethod, PlanDetails } from '../page';
import * as PricingCard from '@/app/subscription/pricing-card';

interface Step1Props {
  data: FormData;
  updateData: (fields: Partial<FormData>) => void;
  planDetails: PlanDetails | null;
}

const Step1PaymentMethod: React.FC<Step1Props> = ({ data, updateData, planDetails }) => {
  const paymentOptions: { 
    value: PaymentMethod; 
    label: string; 
    icon: React.ReactNode;
    description?: string;
  }[] = [
    { 
      value: 'Credit card', 
      label: 'Credit Card', 
      icon: <CreditCard size={20} />,
      description: 'Visa, Mastercard, AmEx, Discover'
    },
    { 
      value: 'Debit card', 
      label: 'Debit Card', 
      icon: <CreditCard size={20} />,
      description: 'Visa, Mastercard'
    },
    { 
      value: 'Apple Pay', 
      label: 'Apple Pay', 
      icon: <Smartphone size={20} />,
      description: 'Fast & secure checkout'
    },
    { 
      value: 'Google Pay', 
      label: 'Google Pay', 
      icon: <Wallet size={20} />,
      description: 'Quick payment with Google'
    },
    { 
      value: 'PayPal', 
      label: 'PayPal', 
      icon: <Wallet size={20} />,
      description: 'Pay with your PayPal account'
    },
    // { 
    //   value: 'Affirm', 
    //   label: 'Affirm', 
    //   icon: <Clock size={20} />,
    //   description: 'Buy now, pay later in installments'
    // },
    // { 
    //   value: 'Klarna', 
    //   label: 'Klarna', 
    //   icon: <Clock size={20} />,
    //   description: 'Split payment into 4 interest-free payments'
    // },
    // { 
    //   value: 'ACH Bank Transfer', 
    //   label: 'ACH Bank Transfer', 
    //   icon: <Building2 size={20} />,
    //   description: 'Direct payment from US bank account'
    // },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Plan Summary Card */}
      {planDetails && (
        <div className=" rounded-xl p-5 @container/card bg-gradient-to-b from-black/90 to-black/90 border-black/80  shadow-lg border-1 transition-all duration-300 hover:shadow-xl overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-white text-lg mb-1">
                {planDetails.planName}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {planDetails.billingCycle === 'annual' ? 'Billed annually' : 'Billed monthly'}
              </p>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-white">
                  {planDetails.currency === 'INR' ? '₹' : '$'}{planDetails.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-600">
                  / {planDetails.billingCycle === 'annual' ? 'year' : 'month'}
                </span>
              </div>
            </div>
            <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {planDetails.billingCycle === 'annual' ? 'Annual' : 'Monthly'}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {paymentOptions.map((option) => (
          <label
            key={option.value}
            className={`flex items-center p-4 border-2 rounded-xl cursor-pointer bg-white transition-all duration-200 ${
              data.paymentMethod === option.value
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="payment"
              value={option.value}
              checked={data.paymentMethod === option.value}
              onChange={() => updateData({ paymentMethod: option.value })}
              className="mr-3 w-4 h-4 appearance-none rounded-full border-2 border-gray-300 checked:bg-green-500 checked:border-green-500 relative cursor-pointer transition-all flex-shrink-0 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-white before:opacity-0 checked:before:opacity-100"
            />
            <div className="flex items-center space-x-3 flex-1">
              <div className="text-gray-600 flex-shrink-0">{option.icon}</div>
              <div className="flex-1">
                <span className="font-medium text-black block">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-gray-500 block mt-0.5">{option.description}</span>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Card Preview - Only show for card payments */}
      {/* {(data.paymentMethod === 'Debit card' || data.paymentMethod === 'Credit card') && (
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl transform transition-transform duration-500 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black opacity-10 rounded-full blur-xl"></div>

          <div className="relative z-10 flex justify-between items-start mb-8">
            <div className="w-12 h-8 bg-white/20 rounded flex items-center justify-center backdrop-blur-sm">
              <CreditCard size={20} className="opacity-80" />
            </div>
            <span className="text-xs font-bold tracking-widest opacity-75">
              {data.paymentMethod === 'Debit card' ? 'DEBIT' : 'VISA'}
            </span>
          </div>

          <div className="relative z-10 space-y-5">
            <div className="text-xl font-mono tracking-widest drop-shadow-sm">
              {data.cardNumber || '•••• •••• •••• 1234'}
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] font-bold tracking-wider opacity-75 mb-1">
                  CARDHOLDER
                </div>
                <div className="text-sm font-medium tracking-wide uppercase truncate max-w-[150px]">
                  {data.cardName || 'JOHN DOE'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold tracking-wider opacity-75 mb-1">
                  EXPIRES
                </div>
                <div className="text-sm font-medium tracking-wide">
                  {data.expiry || '12/28'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* PayPal Info */}
      {data.paymentMethod === 'PayPal' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Wallet className="text-blue-600" size={24} />
            <div>
              <p className="font-medium text-gray-900">PayPal Payment</p>
              <p className="text-sm text-gray-600">
                You'll be redirected to PayPal to complete your payment securely.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Apple Pay Info */}
      {data.paymentMethod === 'Apple Pay' && (
        <div className="bg-gray-50 border border-gray-300 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Smartphone className="text-gray-900" size={24} />
            <div>
              <p className="font-medium text-gray-900">Apple Pay</p>
              <p className="text-sm text-gray-600">
                Complete your payment quickly and securely using Apple Pay.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Google Pay Info */}
      {data.paymentMethod === 'Google Pay' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Wallet className="text-green-600" size={24} />
            <div>
              <p className="font-medium text-gray-900">Google Pay</p>
              <p className="text-sm text-gray-600">
                Fast and secure payment with your Google account.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Affirm Info */}
      {/* {data.paymentMethod === 'Affirm' && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Clock className="text-purple-600" size={24} />
            <div>
              <p className="font-medium text-gray-900">Affirm - Buy Now, Pay Later</p>
              <p className="text-sm text-gray-600">
                Split your payment into monthly installments with 0% APR options available.
              </p>
            </div>
          </div>
        </div>
      )} */}

      {/* Klarna Info */}
      {/* {data.paymentMethod === 'Klarna' && (
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Clock className="text-pink-600" size={24} />
            <div>
              <p className="font-medium text-gray-900">Klarna - Pay in 4</p>
              <p className="text-sm text-gray-600">
                Split your payment into 4 interest-free payments, paid every 2 weeks.
              </p>
            </div>
          </div>
        </div>
      )} */}

      {/* ACH Bank Transfer Info */}
      {/* {data.paymentMethod === 'ACH Bank Transfer' && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Building2 className="text-indigo-600" size={24} />
            <div>
              <p className="font-medium text-gray-900">ACH Bank Transfer</p>
              <p className="text-sm text-gray-600">
                Direct payment from your US bank account. Processing may take 3-5 business days.
              </p>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Step1PaymentMethod;