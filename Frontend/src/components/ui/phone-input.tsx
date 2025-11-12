'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface PhoneInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    onChange?: (value: string) => void;
    responsive?: boolean;
    touchOptimized?: boolean;
}

interface Country {
    code: string;
    name: string;
    dialCode: string;
    flag: string;
}

const countries: Country[] = [
    { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
    { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
    { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
    { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
    { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
    { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
    { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
    { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
    { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
];

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ className, onChange, value, responsive = true, touchOptimized = true, ...props }, ref) => {
        const [selectedCountry, setSelectedCountry] = React.useState<Country>(countries[0]);
        const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
        const [phoneNumber, setPhoneNumber] = React.useState('');
        const dropdownRef = React.useRef<HTMLDivElement>(null);

        // Close dropdown when clicking outside
        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsDropdownOpen(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;
            // Remove non-digits
            const cleaned = inputValue.replace(/\D/g, '');

            // Format based on selected country
            let formatted = cleaned;
            if (selectedCountry.code === 'US' || selectedCountry.code === 'CA') {
                // Format as (XXX) XXX-XXXX for US/Canada
                if (cleaned.length >= 6) {
                    formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
                } else if (cleaned.length >= 3) {
                    formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
                }
            } else if (selectedCountry.code === 'IN') {
                // Format as XXXXX XXXXX for India
                if (cleaned.length > 5) {
                    formatted = `${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
                }
            } else if (selectedCountry.code === 'GB') {
                // Format as XXXX XXX XXXX for UK
                if (cleaned.length > 7) {
                    formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 11)}`;
                } else if (cleaned.length > 4) {
                    formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
                }
            } else if (selectedCountry.code === 'AU') {
                // Format as XXXX XXX XXX for Australia
                if (cleaned.length > 7) {
                    formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`;
                } else if (cleaned.length > 4) {
                    formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
                }
            }

            setPhoneNumber(formatted);

            if (onChange) {
                onChange(`${selectedCountry.dialCode} ${formatted}`);
            }
        };

        const handleCountrySelect = (country: Country) => {
            setSelectedCountry(country);
            setIsDropdownOpen(false);

            if (onChange) {
                onChange(`${country.dialCode} ${phoneNumber}`);
            }
        };

        return (
            <div className="relative flex">
                {/* Country Selector */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={cn(
                            "flex items-center gap-2 rounded-l-md border border-r-0 border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200",
                            responsive ? "form-input-responsive w-16 sm:w-20 text-xs sm:text-sm" : "h-10 px-3 text-sm w-20",
                            touchOptimized && "touch-target",
                            "justify-center"
                        )}
                    >
                        <span className="text-base">{selectedCountry.flag}</span>
                        <ChevronDown className="h-3 w-3 opacity-50" />
                    </button>

                    {/* Dropdown */}
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 z-50 w-64 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {countries.map((country) => (
                                <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => handleCountrySelect(country)}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-left"
                                >
                                    <span className="text-base">{country.flag}</span>
                                    <span className="flex-1">{country.name}</span>
                                    <span className="text-muted-foreground">{country.dialCode}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Phone Number Input */}
                <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        {selectedCountry.dialCode}
                    </div>
                    <input
                        type="tel"
                        className={cn(
                            "flex w-full rounded-r-md border border-l-0 border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                            responsive ? "form-input-responsive pl-10 sm:pl-12 pr-3 sm:pr-4" : "h-10 pl-12 pr-3 py-2 text-sm",
                            touchOptimized && "touch-target",
                            className
                        )}
                        ref={ref}
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        {...props}
                    />
                </div>
            </div>
        );
    }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };