'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SignUpPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        contact: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error and success state when user starts typing
        if (error) {
            setError('');
            setShowError(false);
        }
        if (isSuccess) {
            setIsSuccess(false);
        }
    };

    const showErrorWithAnimation = (message: string) => {
        setError(message);
        setShowError(true);

        // Auto-hide shake animation after 1 second, but keep error message
        setTimeout(() => {
            setShowError(false);
        }, 1000);
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Clear error message when user clicks signup button again
        setError('');
        setShowError(false);
       

        // Validation
        if (!formData.firstName.trim()) {
            showErrorWithAnimation('First name is required');
            return;
        }
        if (!formData.lastName.trim()) {
            showErrorWithAnimation('Last name is required');
            return;
        }
        if (!formData.email.trim()) {
            showErrorWithAnimation('Email is required');
            return;
        }
        if (!formData.email.includes('@gmail.com')) {
            showErrorWithAnimation('Please enter a valid email address');
            return;
        }
        if (!formData.password.trim()) {
            showErrorWithAnimation('Password is required');
            return;
        }
        if (formData.password.length < 6) {
            showErrorWithAnimation('Password must be at least 6 characters');
            return;
        }
        if (!formData.confirmPassword.trim()) {
            showErrorWithAnimation('Please confirm your password');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            showErrorWithAnimation('Passwords do not match');
            return;
        }
        if (!formData.contact.trim()) {
            showErrorWithAnimation('Contact number is required');
            return;
        }
        if (!agreeTerms) {
            showErrorWithAnimation('Please agree to the privacy terms');
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Show success state
            setIsSuccess(true);
            toast.success('Account created successfully! Welcome to CineStream!');

            // Show redirecting state after success
            setTimeout(() => {
                setIsRedirecting(true);

                // Redirect to home page
                setTimeout(() => {
                    router.push('/');
                }, 1000);
            }, 1000);
        } catch (err) {
            showErrorWithAnimation(err instanceof Error ? err.message : 'Account creation failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="min-h-screen relative overflow-hidden bg-[#141414]">
            {/* Same Animated Background as Login Page */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Animated Progress Circles */}
                {/* Large Circle - 900px */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px]">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 900 900">
                        {/* Background circle */}
                        <circle
                            cx="450"
                            cy="450"
                            r="449"
                            fill="none"
                            stroke="rgb(75 85 99 / 0.3)"
                            strokeWidth="1"
                        />
                        {/* First progress arc - starts from left side */}
                        <motion.circle
                            cx="450"
                            cy="450"
                            r="449"
                            fill="none"
                            stroke="#99989D"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeDasharray={`${Math.PI * 449 * 0.1} ${15 * Math.PI * 449}`}
                            animate={{
                                strokeDashoffset: [
                                    0,
                                    -2 * Math.PI * 449
                                ]
                            }}
                            transition={{
                                duration: 180,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                        {/* Second progress arc - starts from right side (opposite) */}
                        <motion.circle
                            cx="450"
                            cy="450"
                            r="449"
                            fill="none"
                            stroke="#99989D"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeDasharray={`${Math.PI * 449 * 0.08} ${18 * Math.PI * 449}`}
                            animate={{
                                strokeDashoffset: [
                                    -Math.PI * 449,
                                    -Math.PI * 449 - 2 * Math.PI * 449
                                ]
                            }}
                            transition={{
                                duration: 180,
                                repeat: Infinity,
                                ease: "linear",
                                delay: 15
                            }}
                        />
                    </svg>
                </div>

                {/* Medium Circle - 700px */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px]">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 700 700">
                        {/* Background circle */}
                        <circle
                            cx="350"
                            cy="350"
                            r="349"
                            fill="none"
                            stroke="rgb(107 114 128 / 0.25)"
                            strokeWidth="1"
                        />
                        {/* First progress arc - starts from top */}
                        <motion.circle
                            cx="350"
                            cy="350"
                            r="349"
                            fill="none"
                            stroke="#99989D"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeDasharray={`${Math.PI * 349 * 0.12} ${12 * Math.PI * 349}`}
                            animate={{
                                strokeDashoffset: [
                                    0,
                                    -2 * Math.PI * 349
                                ]
                            }}
                            transition={{
                                duration: 150,
                                repeat: Infinity,
                                ease: "linear",
                                delay: 5
                            }}
                        />
                        {/* Second progress arc - starts from bottom (opposite) */}
                        <motion.circle
                            cx="350"
                            cy="350"
                            r="349"
                            fill="none"
                            stroke="#99989D"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeDasharray={`${Math.PI * 349 * 0.09} ${15 * Math.PI * 349}`}
                            animate={{
                                strokeDashoffset: [
                                    -Math.PI * 349,
                                    -Math.PI * 349 - 2 * Math.PI * 349
                                ]
                            }}
                            transition={{
                                duration: 150,
                                repeat: Infinity,
                                ease: "linear",
                                delay: 20
                            }}
                        />
                    </svg>
                </div>

                {/* Inner Circle - 500px */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 500 500">
                        {/* Background circle */}
                        <circle
                            cx="250"
                            cy="250"
                            r="249"
                            fill="none"
                            stroke="rgb(156 163 175 / 0.2)"
                            strokeWidth="1"
                        />
                        {/* First progress arc */}
                        <motion.circle
                            cx="250"
                            cy="250"
                            r="249"
                            fill="none"
                            stroke="#99989D"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeDasharray={`${Math.PI * 249 * 0.14} ${10 * Math.PI * 249}`}
                            animate={{
                                strokeDashoffset: [
                                    0,
                                    -2 * Math.PI * 249
                                ]
                            }}
                            transition={{
                                duration: 120,
                                repeat: Infinity,
                                ease: "linear",
                                delay: 8
                            }}
                        />
                        {/* Second progress arc with 300s gap after first */}
                        <motion.circle
                            cx="250"
                            cy="250"
                            r="249"
                            fill="none"
                            stroke="#99989D"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeDasharray={`${Math.PI * 249 * 0.11} ${12 * Math.PI * 249}`}
                            animate={{
                                strokeDashoffset: [
                                    0,
                                    -2 * Math.PI * 249
                                ]
                            }}
                            transition={{
                                duration: 120,
                                repeat: Infinity,
                                ease: "linear",
                                delay: 28
                            }}
                        />
                    </svg>
                </div>

                {/* Animated diagonal lines with Framer Motion */}
                <motion.div
                    className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-500/30 to-transparent transform rotate-45 origin-center"
                    animate={{
                        opacity: [0.3, 0.8, 0.3],
                        scaleX: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-500/30 to-transparent transform -rotate-45 origin-center"
                    animate={{
                        opacity: [0.3, 0.8, 0.3],
                        scaleX: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />

                {/* Additional animated lines */}
                <motion.div
                    className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-600/25 to-transparent transform rotate-45 origin-center"
                    animate={{
                        opacity: [0.25, 0.6, 0.25]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                />
                <motion.div
                    className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-600/25 to-transparent transform -rotate-45 origin-center"
                    animate={{
                        opacity: [0.25, 0.6, 0.25]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 3
                    }}
                />

                {/* Vertical and horizontal lines */}
                <motion.div
                    className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-600/20 to-transparent"
                    animate={{
                        opacity: [0.2, 0.5, 0.2],
                        scaleX: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5
                    }}
                />
                <motion.div
                    className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-gray-600/20 to-transparent"
                    animate={{
                        opacity: [0.2, 0.5, 0.2],
                        scaleY: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2.5
                    }}
                />

                {/* Corner geometric elements with rotation animation */}
                <div
                    className="absolute top-16 left-16 w-24 h-24 border border-gray-500/20 transform rotate-45 animate-pulse"
                    style={{ animationDuration: '5s', animationDelay: '1s' }}
                ></div>
                <div
                    className="absolute top-16 right-16 w-20 h-20 border border-gray-500/20 transform rotate-45 animate-pulse"
                    style={{ animationDuration: '4s', animationDelay: '2s' }}
                ></div>
                <div
                    className="absolute bottom-16 left-16 w-28 h-28 border border-gray-500/20 transform rotate-45 animate-pulse"
                    style={{ animationDuration: '6s', animationDelay: '3s' }}
                ></div>
                <div
                    className="absolute bottom-16 right-16 w-16 h-16 border border-gray-500/20 transform rotate-45 animate-pulse"
                    style={{ animationDuration: '3s', animationDelay: '0.5s' }}
                ></div>

                {/* Subtle dot pattern */}
                <div className="absolute inset-0 opacity-50">
                    <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <div className="absolute top-1/4 right-1/3 w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <div className="absolute top-2/3 left-2/3 w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <div className="absolute top-1/6 right-1/6 w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
                {/* Signup Card with same shaking animation */}
                <motion.div
                    className=" max-w-md bg-[#19191b] border-[#5e5e5e]/10 backdrop-blur-xl rounded-3xl p-5 border"
                    animate={showError ? {
                        x: [0, -3, 3, -3, 3, -2, 2, -2, 2, -1, 1, -1, 1, 0],
                        scale: [1, 0.995, 1, 0.995, 1, 0.996, 1],
                    } : {
                        x: 0,
                        scale: 1
                    }}
                    transition={{
                        duration: showError ? 1 : 0.3,
                        ease: "linear"
                    }}
                >
                    {/* Logo/Brand */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4 shadow-lg">
                            <div className="w-5 h-5 bg-white rounded-md transform rotate-45"></div>
                        </div>
                        <h1 className="heading-card font-bold text-white/90 mb-1">Create Account</h1>
                        <p className="text-[#828080] micro-text mb-3">Join CineStream today</p>

                        {/* Error Message - Below tagline */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -10,
                                    scale: 0.9
                                }}
                                transition={{
                                    duration: 0.3,
                                    ease: "easeInOut"
                                }}
                                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                            >
                                <p className="text-red-400 text-xs font-medium">{error}</p>
                            </motion.div>
                        )}
                    </div>

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        {/* First Name and Last Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label htmlFor="firstName" className="block micro-text font-medium text-[#828080] mb-1 sm:mb-2">
                                    First Name
                                </label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0a0a0a] text-[#828080] border-none rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-all duration-200"
                                    placeholder="John"
                                    required
                                    responsive={true}
                                    touchOptimized={true}
                                    suppressHydrationWarning
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block micro-text font-medium text-[#828080] mb-1 sm:mb-2">
                                    Last Name
                                </label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0a0a0a] text-[#828080] border-none rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-all duration-200"
                                    placeholder="Doe"
                                    required
                                    responsive={true}
                                    touchOptimized={true}
                                    suppressHydrationWarning
                                />
                            </div>
                        </div>
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block micro-text font-medium text-[#828080] mb-1 sm:mb-2">
                                Email
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full bg-[#0a0a0a] text-[#828080] border-none rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-all duration-200"
                                placeholder="john.doe@example.com"
                                required
                                responsive={true}
                                touchOptimized={true}
                                suppressHydrationWarning
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block micro-text font-medium text-[#828080] mb-1 sm:mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0a0a0a] border-none rounded-lg pr-12 sm:pr-14 text-[#828080] placeholder:text-gray-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-all duration-200"
                                    placeholder="••••••••••••"
                                    required
                                    responsive={true}
                                    touchOptimized={true}
                                    suppressHydrationWarning
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="touch-target absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors p-2 rounded-md hover:bg-gray-700/20"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                                </button>
                            </div>
                        </div>
                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block micro-text font-medium text-[#828080] mb-1 sm:mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#0a0a0a] border-none rounded-lg pr-12 sm:pr-14 text-[#828080] placeholder:text-gray-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-all duration-200"
                                    placeholder="••••••••••••"
                                    required
                                    responsive={true}
                                    touchOptimized={true}
                                    suppressHydrationWarning
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="touch-target absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors p-2 rounded-md hover:bg-gray-700/20"
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Contact Field */}
                        <div>
                            <label htmlFor="contact" className="block micro-text font-medium text-[#828080] mb-1 sm:mb-2">
                                Contact Number
                            </label>
                            <PhoneInput
                                id="contact"
                                name="contact"
                                value={formData.contact}
                                onChange={(value) => setFormData(prev => ({ ...prev, contact: value }))}
                                placeholder="Enter phone number"
                                required
                                responsive={true}
                                touchOptimized={true}
                            />
                        </div>
                        {/* Privacy Terms Checkbox */}
                        <div className="flex items-start space-x-2 sm:space-x-3">
                            <input
                                type="checkbox"
                                id="agreeTerms"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="mt-1 h-4 w-4 sm:h-5 sm:w-5 text-blue-600 bg-[#0a0a0a] border-gray-600 rounded focus:ring-blue-500 focus:ring-2 touch-target cursor-pointer"
                                required
                            />
                            <label htmlFor="agreeTerms" className="micro-text text-[#828080] leading-relaxed">
                                I agree to the{' '}
                                <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                                    Privacy Policy
                                </Link>
                                {' '}and{' '}
                                <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                                    Terms of Service
                                </Link>
                            </label>
                        </div>

                        {/* Signup Button */}
                        <Button
                            type="submit"
                            disabled={isLoading || isSuccess || isRedirecting}
                            className={`w-full font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative flex items-center justify-center ${isRedirecting
                                ? 'bg-blue-600 hover:bg-blue-600 text-white'
                                : isSuccess
                                    ? 'bg-green-600 hover:bg-green-600 text-white'
                                    : 'bg-[#006BFF] hover:bg-[#006BFF] text-white/80'
                                }`}
                            responsive={true}
                            touchOptimized={true}
                            suppressHydrationWarning
                        >
                            {isRedirecting ? (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="flex items-center justify-center gap-2"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                    >
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </motion.div>
                                    <span>Redirecting...</span>
                                </motion.div>
                            ) : isSuccess ? (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Account Created</span>
                                </motion.div>
                            ) : isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                    </motion.div>
                                    <span>Creating account...</span>
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                    </form>
                    {/* Divider */}
                    <div className="my-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-[1.5px] bg-blend-darken border-[#16161b]"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 text-[#828080]" style={{ background: '#19191b' }}>Or sign up with</span>
                            </div>
                        </div>
                    </div>

                    {/* Social Signup Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5" suppressHydrationWarning>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 border-[#16161b] bg-[#1C1C1E] transition-all duration-200 text-xs"
                            suppressHydrationWarning
                        >
                            <svg className="h-3 w-3 mr-1 text-[#99989D]" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className='text-[#99989D]'>Google</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 border-[#16161b] bg-[#1C1C1E] transition-all duration-200 text-xs"
                            suppressHydrationWarning
                        >
                            <svg className="h-3 w-3 mr-1 text-[#99989D]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                            <span className='text-[#99989D]'>Apple</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 border-[#16161b] bg-[#1C1C1E] text-white transition-all duration-200 text-xs"
                            suppressHydrationWarning
                        >
                            <svg className="h-3 w-3 mr-1 text-[#99989D]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span className='text-[#99989D]'>Facebook</span>
                        </Button>
                    </div>

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-[#5e5e5e] text-xs">
                            Already have an account? {' '}{'  '}
                            <Link
                                href="/login"
                                className="text-[#A1A1A6] py-1 px-2 border-[#5e5e5e]/10 border-2 rounded-sm hover:text-[#006BFF] font-medium transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}