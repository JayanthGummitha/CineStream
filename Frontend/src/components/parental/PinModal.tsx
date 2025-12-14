'use client';

import { useState, useRef, useEffect } from 'react';
import { useParentalControls } from '@/hooks/useParentalControls';
import { verifyProfilePin } from '@/lib/parental-controls';
import { useProfiles } from '@/contexts/ProfileContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';

interface PinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
  title?: string;
  description?: string;
  mode?: 'verify' | 'set' | 'change';
  /** Target profile ID for verification (used when switching profiles) */
  targetProfileId?: string;
}

export function PinModal({
  open,
  onOpenChange,
  onVerified,
  title = 'Enter PIN',
  description = 'Enter your 4-digit PIN to continue.',
  mode = 'verify',
  targetProfileId,
}: PinModalProps) {
  const { verifyPin, setPin } = useParentalControls();
  const { accountProfiles } = useProfiles();
  const [pin, setLocalPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const accountId = accountProfiles?.accountId || 'demo-user-123';

  useEffect(() => {
    if (open) {
      setLocalPin(['', '', '', '']);
      setConfirmPin(['', '', '', '']);
      setStep('enter');
      setError(null);
      setAttemptsRemaining(null);
      setLockedUntil(null);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open]);

  const handlePinChange = (index: number, value: string, isConfirm = false) => {
    if (value && !/^\d$/.test(value)) return;

    const currentPin = isConfirm ? confirmPin : pin;
    const setCurrentPin = isConfirm ? setConfirmPin : setLocalPin;
    const refs = isConfirm ? confirmInputRefs : inputRefs;

    const newPin = [...currentPin];
    newPin[index] = value;
    setCurrentPin(newPin);
    setError(null);

    if (value && index < 3) {
      refs.current[index + 1]?.focus();
    }

    if (value && index === 3 && newPin.every(d => d !== '')) {
      handleSubmit(newPin.join(''), isConfirm);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent, isConfirm = false) => {
    const currentPin = isConfirm ? confirmPin : pin;
    const refs = isConfirm ? confirmInputRefs : inputRefs;

    if (e.key === 'Backspace' && !currentPin[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (pinValue: string, isConfirm = false) => {
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'verify') {
        // If targetProfileId is provided, verify against that profile's PIN
        // Otherwise use the current active profile
        let result;
        if (targetProfileId) {
          result = verifyProfilePin(accountId, targetProfileId, pinValue);
        } else {
          result = verifyPin(pinValue);
        }
        
        if (result.success) {
          onVerified();
          onOpenChange(false);
        } else {
          setError(result.error || 'Incorrect PIN');
          setAttemptsRemaining(result.attemptsRemaining ?? null);
          setLockedUntil(result.lockedUntil ?? null);
          setLocalPin(['', '', '', '']);
          setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
      } else if (mode === 'set' || mode === 'change') {
        if (step === 'enter' && !isConfirm) {
          setStep('confirm');
          setTimeout(() => confirmInputRefs.current[0]?.focus(), 100);
        } else if (isConfirm) {
          const enteredPin = pin.join('');
          if (pinValue !== enteredPin) {
            setError('PINs do not match');
            setConfirmPin(['', '', '', '']);
            setTimeout(() => confirmInputRefs.current[0]?.focus(), 100);
            return;
          }
          setPin(pinValue);
          onVerified();
          onOpenChange(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPinInputs = (
    currentPin: string[],
    refs: React.RefObject<(HTMLInputElement | null)[]>,
    isConfirm = false
  ) => (
    <div className="flex justify-center gap-3">
      {currentPin.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { if (refs.current) refs.current[index] = el; }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handlePinChange(index, e.target.value, isConfirm)}
          onKeyDown={(e) => handleKeyDown(index, e, isConfirm)}
          disabled={isLoading || !!lockedUntil}
          className={cn(
            'w-14 h-14 text-center text-2xl font-bold rounded-lg',
            'bg-zinc-800 border-2 text-white',
            'focus:outline-none focus:ring-2 focus:ring-red-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-red-500' : 'border-zinc-700'
          )}
        />
      ))}
    </div>
  );

  const getTitle = () => {
    if (mode === 'set') return 'Set PIN';
    if (mode === 'change') return step === 'enter' ? 'Enter New PIN' : 'Confirm New PIN';
    return title;
  };

  const getDescription = () => {
    if (mode === 'set') {
      return step === 'enter' 
        ? 'Create a 4-digit PIN to protect this profile.' 
        : 'Enter the PIN again to confirm.';
    }
    if (mode === 'change') {
      return step === 'enter'
        ? 'Enter your new 4-digit PIN.'
        : 'Confirm your new PIN.';
    }
    return description;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-zinc-900 border-zinc-800">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-red-500" />
          </div>
          <DialogTitle className="text-white text-xl">{getTitle()}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {step === 'enter' && renderPinInputs(pin, inputRefs)}
          {step === 'confirm' && renderPinInputs(confirmPin, confirmInputRefs, true)}

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {attemptsRemaining !== null && attemptsRemaining > 0 && (
            <p className="text-center text-yellow-400 text-sm">
              {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
            </p>
          )}

          {lockedUntil && (
            <p className="text-center text-red-400 text-sm">
              Too many attempts. Try again after {lockedUntil.toLocaleTimeString()}
            </p>
          )}

          {isLoading && (
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          )}

          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full text-gray-400 hover:text-white"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
