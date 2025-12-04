'use client';

import { useState, useEffect } from 'react';
import {
    IconDeviceDesktop,
    IconDeviceMobile,
    IconDeviceTablet,
    IconDeviceTv,
    IconCheck,
    IconX,
    IconPlus,
    IconAlertCircle,
    IconShield,
    IconClock,
    IconMapPin,
} from "@tabler/icons-react"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import * as PricingCard from "@/app/subscription/pricing-card";
import { CheckCircle2 } from "lucide-react";

interface RegisteredDevice {
    id: string;
    name: string;
    type: 'desktop' | 'mobile' | 'tablet' | 'tv';
    lastActive: string;
    location: string;
    isActive: boolean;
    timestamp: string;
}

// Helper function to detect device from User-Agent
const detectDevice = (): { name: string; type: 'desktop' | 'mobile' | 'tablet' | 'tv' } => {
    if (typeof window === 'undefined') return { name: 'Unknown Device', type: 'desktop' };

    const ua = navigator.userAgent;
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';
    let type: 'desktop' | 'mobile' | 'tablet' | 'tv' = 'desktop';

    // Detect browser
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

    // Detect OS and device type
    if (ua.includes('Windows')) {
        os = 'Windows';
        type = 'desktop';
    } else if (ua.includes('Mac OS')) {
        os = 'MacOS';
        type = 'desktop';
    } else if (ua.includes('Linux') && !ua.includes('Android')) {
        os = 'Linux';
        type = 'desktop';
    } else if (ua.includes('Android')) {
        os = 'Android';
        type = ua.includes('Tablet') || ua.includes('Tab') ? 'tablet' : 'mobile';
    } else if (ua.includes('iPhone')) {
        os = 'iOS';
        type = 'mobile';
    } else if (ua.includes('iPad')) {
        os = 'iOS';
        type = 'tablet';
    } else if (ua.includes('Smart TV') || ua.includes('TV')) {
        os = 'Smart TV';
        type = 'tv';
    }

    return { name: `${browser} on ${os}`, type };
};

// Helper to format timestamp
const formatLastActive = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const DEVICES_STORAGE_KEY = 'cinestream_registered_devices';
const MAX_DEVICES = 3;

export default function RegisterDevicesPage() {
    const [registeredDevices, setRegisteredDevices] = useState<RegisteredDevice[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDeviceName, setCurrentDeviceName] = useState<string>('');

    // Detect and register current device
    useEffect(() => {
        setIsClient(true);

        const detectAndRegisterDevice = async () => {
            // Detect device
            const deviceInfo = detectDevice();
            setCurrentDeviceName(deviceInfo.name);

            // Detect location using multiple fallback APIs
            let location = 'Unknown Location';
            
            // Try ipapi.co first (supports HTTPS, CORS-friendly)
            try {
                const response = await fetch('https://ipapi.co/json/', {
                    headers: { 'Accept': 'application/json' }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.city && !data.error) {
                        const city = data.city;
                        const region = data.region || '';
                        const country = data.country_name || data.country_code || '';
                        location = region ? `${city}, ${region}, ${country}` : `${city}, ${country}`;
                    }
                }
            } catch (error) {
                console.warn('ipapi.co failed:', error);
            }
            
            // Fallback to ip-api.com if first attempt failed
            if (location === 'Unknown Location') {
                try {
                    // Note: ip-api.com free tier only works over HTTP, not HTTPS
                    const response = await fetch('http://ip-api.com/json/?fields=status,city,regionName,country');
                    if (response.ok) {
                        const data = await response.json();
                        if (data.status === 'success' && data.city) {
                            const city = data.city;
                            const region = data.regionName || '';
                            const country = data.country || '';
                            location = region ? `${city}, ${region}, ${country}` : `${city}, ${country}`;
                        }
                    }
                } catch (error) {
                    console.warn('ip-api.com failed:', error);
                }
            }
            
            // Fallback to ipinfo.io
            if (location === 'Unknown Location') {
                try {
                    const response = await fetch('https://ipinfo.io/json');
                    if (response.ok) {
                        const data = await response.json();
                        if (data.city) {
                            const city = data.city;
                            const region = data.region || '';
                            const country = data.country || '';
                            location = region ? `${city}, ${region}, ${country}` : `${city}, ${country}`;
                        }
                    }
                } catch (error) {
                    console.warn('ipinfo.io failed:', error);
                }
            }

            // Load existing devices
            const savedDevices = localStorage.getItem(DEVICES_STORAGE_KEY);
            let devices: RegisteredDevice[] = savedDevices ? JSON.parse(savedDevices) : [];

            // Check if current device already exists
            const existingDeviceIndex = devices.findIndex(d => d.name === deviceInfo.name);
            const now = new Date().toISOString();

            if (existingDeviceIndex >= 0) {
                // Update existing device
                devices[existingDeviceIndex] = {
                    ...devices[existingDeviceIndex],
                    lastActive: 'Just now',
                    location,
                    isActive: true,
                    timestamp: now
                };
                // Mark all other devices as inactive
                devices = devices.map((d, i) => ({
                    ...d,
                    isActive: i === existingDeviceIndex,
                    lastActive: i === existingDeviceIndex ? 'Just now' : formatLastActive(d.timestamp)
                }));
            } else if (devices.length < MAX_DEVICES) {
                // Add new device
                const newDevice: RegisteredDevice = {
                    id: `device-${Date.now()}`,
                    name: deviceInfo.name,
                    type: deviceInfo.type,
                    lastActive: 'Just now',
                    location,
                    isActive: true,
                    timestamp: now
                };
                // Mark all existing devices as inactive
                devices = devices.map(d => ({ ...d, isActive: false, lastActive: formatLastActive(d.timestamp) }));
                devices.unshift(newDevice);
            } else {
                // Device limit reached - just update last active times
                devices = devices.map(d => ({
                    ...d,
                    lastActive: formatLastActive(d.timestamp)
                }));
            }

            // Save to localStorage
            localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(devices));
            setRegisteredDevices(devices);
            setIsLoading(false);
        };

        detectAndRegisterDevice();
    }, []);

    const getDeviceIcon = (type: string) => {
        switch (type) {
            case "desktop":
                return <IconDeviceDesktop className="h-10 w-10" />
            case "mobile":
                return <IconDeviceMobile className="h-6 w-6" />
            case "tablet":
                return <IconDeviceTablet className="h-6 w-6" />
            case "tv":
                return <IconDeviceTv className="h-6 w-6" />
            default:
                return <IconDeviceDesktop className="h-6 w-6" />
        }
    }

    const handleRemoveDevice = (deviceId: string) => {
        const updatedDevices = registeredDevices.filter(d => d.id !== deviceId);
        setRegisteredDevices(updatedDevices);
        localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(updatedDevices));
    };

    const canAddDevice = registeredDevices.length < MAX_DEVICES;

    return (
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Registered Devices</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    Manage and monitor devices connected to your account
                </p>
            </div>

            {/* Device Limit Overview Card */}
            <Card className="mb-6 @container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50 shadow-lg border-4 p-2 transition-all duration-300 hover:shadow-xl overflow-hidden">
                <PricingCard.Header className="border-b border-border/40">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <IconShield className="h-5 w-5" />
                                Device Limit Status
                            </CardTitle>
                            <CardDescription className="mt-1.5">
                                You can register up to {MAX_DEVICES} devices with your current plan
                            </CardDescription>
                        </div>
                        <Badge
                            variant="outline"
                            className="bg-red-800 border-4 border-neutral-900 px-4 py-1.5 text-sm font-semibold w-fit"
                        >
                            {registeredDevices.length} / {MAX_DEVICES} Devices
                        </Badge>
                    </div>
                </PricingCard.Header>
                <PricingCard.Body className="p-0">
                    <div className="flex items-center gap-3 py-4 px-6 border-b border-dotted border-border/60">
                        <IconAlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                            {canAddDevice
                                ? `You have ${MAX_DEVICES - registeredDevices.length} available slot${MAX_DEVICES - registeredDevices.length !== 1 ? "s" : ""} remaining`
                                : "Device limit reached. Remove a device to add a new one."}
                        </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-muted-foreground">Usage</span>
                            <span className="text-xs font-semibold text-foreground">
                                {Math.round((registeredDevices.length / MAX_DEVICES) * 100)}%
                            </span>
                        </div>
                        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r bg-white transition-all duration-500"
                                style={{ width: `${(registeredDevices.length / MAX_DEVICES) * 100}%` }}
                            />
                        </div>
                    </div>
                </PricingCard.Body>
            </Card>

            {/* Registered Devices Grid */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Your Devices</h2>
                <div className="grid  gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {!isClient || isLoading ? (
                        // Loading skeleton
                        <div className="col-span-full flex items-center justify-center py-12">
                            <p className="text-muted-foreground">Loading devices...</p>
                        </div>
                    ) : registeredDevices.length === 0 ? (
                        <div className="col-span-full flex items-center justify-center py-12">
                            <p className="text-muted-foreground">No devices registered yet</p>
                        </div>
                    ) : (
                        registeredDevices.map((device) => {
                            const isCurrentDevice = device.name === currentDeviceName;
                            return (
                                <PricingCard.Card
                                    key={device.id}
                                    className="mb-6 @container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50 shadow-lg border-0 p-2 transition-all duration-300 hover:shadow-xl overflow-hidden"
                                >
                                    <PricingCard.Header className="p-0 rounded-t-lg rounded-b-none">
                                        {/* Device Header */}
                                        <div className="p-5 flex items-center flex-col">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="p-1 rounded-lg bg-black text-white transition-transform duration-200 group-hover:scale-110">
                                                    {getDeviceIcon(device.type)}
                                                </div>
                                               
                                            </div>
                                            <h3 className="font-semibold text-base mb-1">{device.name}</h3>
                                            <p className="text-xs text-muted-foreground capitalize">{device.type}</p>
                                        </div>
                                    </PricingCard.Header>
                                    <PricingCard.Body>
                                         <div className="flex flex-row items-end gap-1">
                                                    {device.isActive && (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-green-500/10 text-green-400 border-green-500/30 animate-pulse border-2"
                                                        >
                                                            <span className="relative flex h-2 w-2 mr-1.5">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                            </span>
                                                            Active
                                                        </Badge>
                                                    )}
                                                    {isCurrentDevice && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-1 border-transparent text-xs bg-red-800"
                                                        >
                                                            This device
                                                        </Badge>
                                                    )}
                                                </div>
                                        {/* Device Details */}
                                        <div className="p-2 space-y-3">
                                            
                                            <div 
                                            className="flex items-center gap-2 text-xs text-muted-foreground"
                                            >
                                                <IconClock className="h-3.5 w-3.5" />
                                                <span>Last active: {device.lastActive}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <IconMapPin className="h-3.5 w-3.5" />
                                                <span>{device.location}</span>
                                            </div>
                                        </div>
                                        {!isCurrentDevice && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveDevice(device.id)}
                                                className="w-full bg-red-800 hover:bg-red-600 text-white border-1 border-neutral-900 hover:text-white transition-colors"
                                            >
                                                <IconX className="h-4 w-4 mr-2" />
                                                Remove Device
                                            </Button>
                                        )}
                                    </PricingCard.Body>
                                </PricingCard.Card>
                            );
                        })
                    )}

                    {/* Add New Device Card - inline with devices when devices exist */}
                    {canAddDevice && isClient && !isLoading && registeredDevices.length > 0 && (
                        <PricingCard.Card
                            className="mb-6 @container/card flex justify-center items-center bg-gradient-to-b from-neutral-800 to-neutral-900/90 overflow-hidden border-dashed border-2 border-border/60 transition-all duration-300 hover:border-primary/50 hover:shadow-lg group cursor-pointer min-h-[280px]">
                            <PricingCard.Body className="p-0 flex justify-center items-center">
                                <div className="flex flex-col items-center justify-center px-6 text-center h-full py-8">
                                    <IconPlus className="h-16 w-16 rounded-xl bg-muted/50 shadow text-white" />
                                    <h3 className="font-semibold text-base mt-6 mb-2">Add New Device</h3>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Connect a new device to your account
                                    </p>
                                    <Button variant="outline" size="sm" className="transition-all duration-200">
                                        <IconPlus className="h-4 w-4 mr-2" />
                                        Get Started
                                    </Button>
                                </div>
                            </PricingCard.Body>
                        </PricingCard.Card>
                    )}
                </div>
                
                {/* Add New Device Card - centered when no devices exist */}
                {canAddDevice && isClient && !isLoading && registeredDevices.length === 0 && (
                    <div className="flex items-center justify-center py-8">
                        <PricingCard.Card
                            className="@container/card flex justify-center items-center bg-gradient-to-b from-neutral-800 to-neutral-900/90 overflow-hidden border-dashed border-2 border-border/60 transition-all duration-300 hover:border-primary/50 hover:shadow-lg group cursor-pointer max-w-sm w-full">
                            <PricingCard.Body className="p-0 flex justify-center items-center">
                                <div className="flex flex-col items-center justify-center px-6 text-center h-full py-12">
                                    <IconPlus className="h-16 w-16 rounded-xl bg-muted/50 shadow text-white" />
                                    <h3 className="font-semibold text-base mt-6 mb-2">Add New Device</h3>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Connect a new device to your account
                                    </p>
                                    <Button variant="outline" size="sm" className="transition-all duration-200">
                                        <IconPlus className="h-4 w-4 mr-2" />
                                        Get Started
                                    </Button>
                                </div>
                            </PricingCard.Body>
                        </PricingCard.Card>
                    </div>
                )}
            </div>

            {/* Bottom Section - Tips and Security */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Device Management Tips */}
                <Card className="mb-6 @container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50 shadow-lg border-4 p-2 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <PricingCard.Header className="border-b border-border/40">
                        <CardTitle className="text-base flex items-center gap-2">
                            <IconCheck className="h-5 w-5 text-green-400" />
                            Management Tips
                        </CardTitle>
                    </PricingCard.Header>
                    <PricingCard.Body className="p-0">
                        <div className="divide-y divide-dotted divide-border/60">
                            <div className="flex items-start gap-3 py-4 px-6">
                                <div className="flex-shrink-0 mt-1">
                                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Remove inactive devices to free up slots
                                </p>
                            </div>
                            <div className="flex items-start gap-3 py-4 px-6">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Upgrade your plan for more device slots
                                </p>
                            </div>
                            <div className="flex items-start gap-3 py-4 px-6">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    One device can stream at a time per profile
                                </p>
                            </div>
                            <div className="flex items-start gap-3 py-4 px-6">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Auto sign-out after 30 days of inactivity
                                </p>
                            </div>
                        </div>
                    </PricingCard.Body>
                </Card>

                {/* Security Notice */}
                <Card className="mb-6 @container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50 shadow-lg border-4 p-2 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <PricingCard.Header className="border-b">
                        <CardTitle className="text-base flex items-center gap-2">
                            <IconAlertCircle className="h-5 w-5" />
                            Security Notice
                        </CardTitle>
                    </PricingCard.Header>
                    <PricingCard.Body className="p-6">
                        <p className="text-sm text-muted-foreground mb-4">
                            If you notice any unfamiliar devices, remove them immediately and change your
                            password. Contact support if you suspect unauthorized access.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button variant="outline" size="sm" className="flex-1">
                                Change Password
                            </Button>
                            <Button variant="default" size="sm" className="flex-1 bg-red-800 hover:bg-red-700 border-1">
                                Contact Support
                            </Button>
                        </div>
                    </PricingCard.Body>
                </Card>
            </div>
        </div>
    )
}





