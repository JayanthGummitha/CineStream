import React from 'react';
import { ShieldCheck, CheckSquare, Square } from 'lucide-react';
import { FormData, PlanDetails } from '../page';

interface Step3Props {
  data: FormData;
  updateData: (fields: Partial<FormData>) => void;
  planDetails: PlanDetails | null;
}

const Step3Review: React.FC<Step3Props> = ({ data, updateData, planDetails }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Plan Details */}
      {planDetails && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
          <h4 className="font-medium text-gray-900 mb-4">Selected Plan</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Plan</span>
              <span className="font-semibold text-gray-900">{planDetails.planName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Billing Cycle</span>
              <span className="font-medium text-gray-900 capitalize">{planDetails.billingCycle}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount</span>
              <span className="font-semibold text-gray-900">
                {planDetails.currency === 'INR' ? '₹' : '$'}{planDetails.price.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-blue-200 pt-3 flex justify-between">
              <span className="text-gray-900 font-semibold">Total (incl. 9% tax)</span>
              <span className="font-bold text-lg text-gray-900">
                {planDetails.currency === 'INR' ? '₹' : '$'}{(planDetails.price * 1.09).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h4 className="font-medium text-gray-900 mb-4">Payment Summary</h4>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Payment method</span>
            <span className="font-medium capitalize text-gray-900">
              {data.paymentMethod}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {data.paymentMethod.includes('card') ? 'Card ending in' : 'Payment via'}
            </span>
            <span className="font-medium text-right text-gray-900">
              {data.paymentMethod.includes('card')
                ? (data.cardNumber.length > 4 ? data.cardNumber.slice(-4) : '****')
                : data.paymentMethod}
            </span>
          </div>

          <div className="flex justify-between text-sm">
             <span className="text-gray-600">Billing to</span>
             <span className="font-medium text-right text-gray-900">{data.cardName || 'Not provided'}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="text-blue-600 mt-0.5 shrink-0" size={20} />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Secure Payment</p>
            <p className="text-blue-700 mt-0.5 leading-relaxed">
              Your payment information is encrypted using 256-bit SSL technology and secure.
            </p>
          </div>
        </div>
      </div>

      <div 
        className="flex items-center cursor-pointer group"
        onClick={() => updateData({ agreed: !data.agreed })}
      >
        <div className={`mr-3 transition-colors ${data.agreed ? 'text-black' : 'text-gray-300 group-hover:text-gray-400'}`}>
          {data.agreed ? <CheckSquare size={20} /> : <Square size={20} />}
        </div>
        <span className="text-sm text-gray-600 select-none">
          I agree to the <span className="underline hover:text-gray-900">Terms of Service</span> and <span className="underline hover:text-gray-900">Privacy Policy</span>
        </span>
      </div>
    </div>
  );
};

export default Step3Review;