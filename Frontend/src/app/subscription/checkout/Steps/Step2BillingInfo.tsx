import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard } from 'lucide-react';
import { FormData } from '../page';

interface Step2Props {
  data: FormData;
  updateData: (fields: Partial<FormData>) => void;
}

// Card type detection function
const detectCardType = (cardNumber: string): { type: string; icon: string } => {
  const number = cardNumber.replace(/\s/g, '');
  
  // Visa: starts with 4
  if (/^4/.test(number)) {
    return { type: 'Visa', icon: '💳' };
  }
  
  // Mastercard: starts with 51-55 or 2221-2720
  if (/^5[1-5]/.test(number) || /^2(2[2-9][0-9]|[3-6][0-9]{2}|7[0-1][0-9]|720)/.test(number)) {
    return { type: 'Mastercard', icon: '💳' };
  }
  
  // American Express: starts with 34 or 37
  if (/^3[47]/.test(number)) {
    return { type: 'AmEx', icon: '💳' };
  }
  
  // Discover: starts with 6011, 622126-622925, 644-649, or 65
  if (/^6011|^622(1(2[6-9]|[3-9][0-9])|[2-8][0-9]{2}|9([0-1][0-9]|2[0-5]))|^64[4-9]|^65/.test(number)) {
    return { type: 'Discover', icon: '💳' };
  }
  
  return { type: '', icon: '' };
};

// Format card number with spaces
const formatCardNumber = (value: string): string => {
  const number = value.replace(/\s/g, '');
  const groups = number.match(/.{1,4}/g);
  return groups ? groups.join(' ') : number;
};

const Step2BillingInfo: React.FC<Step2Props> = ({ data, updateData }) => {
  // Detect card type based on card number
  const cardInfo = useMemo(() => detectCardType(data.cardNumber), [data.cardNumber]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (/^\d*$/.test(value) && value.length <= 16) {
      updateData({ cardNumber: formatCardNumber(value) });
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    if (value.length <= 5) {
      updateData({ expiry: value });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <Label htmlFor="cardNumber" className='text-black'>Card Number</Label>
        <div className="relative mt-1.5">
          <Input 
            id="cardNumber"
             className="pr-20 w-full bg-black text-[white] border-none rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-all duration-200"

            placeholder="1234 5678 9012 3456" 
            value={data.cardNumber}
            onChange={handleCardNumberChange}
            maxLength={19}
            
          />
          {cardInfo.type && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {cardInfo.type}
              </span>
              <CreditCard size={20} className="text-gray-400" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiry" className='text-black'>Expiry Date</Label>
          <Input 
            id="expiry"
            placeholder="MM/YY" 
                                            className="mt-1.5 w-full bg-black text-[white] border-none rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-all duration-200"

            value={data.expiry}
            onChange={handleExpiryChange}
            maxLength={5}
          
          />
        </div>
        <div>
          <Label htmlFor="cvv" className='text-black'>CVV</Label>
          <Input 
            id="cvv"
                                            className="mt-1.5 w-full bg-black text-[white] border-none rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-all duration-200"

            placeholder="123" 
            value={data.cvv}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 4) {
                updateData({ cvv: value });
              }
            }}
            maxLength={4}
            type="password"
         
          />
        </div>
      </div>

      <div>
        <Label className='text-black'>Cardholder Name</Label>
        <Input 
          id="cardName"
          placeholder="John Doe" 
                                          className="mt-1.5 w-full bg-black text-[white] border-none rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-all duration-200"

          value={data.cardName}
          onChange={(e) => updateData({ cardName: e.target.value })}
          
        />
      </div>

      <div className="border-t border-gray-100 pt-6 mt-2">
        <h4 className="font-medium text-black mb-4">Billing Address</h4>
        <div className="space-y-4">
          <Input 
            placeholder="Street Address" 
             className="w-full bg-black text-[white] border-none rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-all duration-200"

            value={data.address}
            onChange={(e) => updateData({ address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              placeholder="City" 
              value={data.city}
               className="w-full bg-black text-[white] border-none rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-all duration-200"

              onChange={(e) => updateData({ city: e.target.value })}
            />
            <Input 
              placeholder="ZIP Code" 
              value={data.zip}
                                className="w-full bg-black text-[white] border-none rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-all duration-200"
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 5) {
                  updateData({ zip: value });
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2BillingInfo;