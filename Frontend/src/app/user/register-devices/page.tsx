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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import * as PricingCard from "@/app/subscription/pricing-card";
import { CheckCircle, CheckCircle2 } from "lucide-react";

export default function RegisterDevicesPage() {
    // Mock data - in production, this would come from your database
    const maxDevices = 3
    const registeredDevices = [
        {
            id: "1",
            name: "MacBook Pro",
            type: "desktop",
            lastActive: "2 hours ago",
            location: "New York, USA",
            isActive: true,
        },
        {
            id: "2",
            name: "iPhone 14 Pro",
            type: "mobile",
            lastActive: "1 day ago",
            location: "New York, USA",
            isActive: false,
        },
        {
            id: "3",
            name: "Samsung Smart TV",
            type: "tv",
            lastActive: "3 days ago",
            location: "New York, USA",
            isActive: false,
        },
    ]

    const getDeviceIcon = (type: string) => {
        switch (type) {
            case "desktop":
                return <IconDeviceDesktop className="h-6 w-6" />
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

    const canAddDevice = registeredDevices.length < maxDevices

    return (
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Registered Devices</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    {/* Manage and monitor devices connected to your account */}
                </p>
            </div>

            {/* Device Limit Overview Card */}
            <Card className="mb-6 @container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50  shadow-lg border-4 p-2 transition-all duration-300 hover:shadow-xl overflow-hidden">
                <PricingCard.Header className=" border-b border-border/40">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <IconShield className="h-5 w-5 " />
                                Device Limit Status
                            </CardTitle>
                            <CardDescription className="mt-1.5">
                                You can register up to {maxDevices} devices with your current plan
                            </CardDescription>
                        </div>
                        <Badge
                            variant="outline"
                            className="bg-red-800 border-4 border-neutral-900  px-4 py-1.5 text-sm font-semibold w-fit"
                        >
                            {registeredDevices.length} / {maxDevices} Devices
                        </Badge>
                    </div>
                </PricingCard.Header>
                <PricingCard.Body className="p-0">
                    <div className="flex items-center gap-3 py-4 px-6 border-b border-dotted border-border/60">
                        <IconAlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                            {canAddDevice
                                ? `You have ${maxDevices - registeredDevices.length} available slot${maxDevices - registeredDevices.length !== 1 ? "s" : ""} remaining`
                                : "Device limit reached. Remove a device to add a new one."}
                        </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-muted-foreground">Usage</span>
                            <span className="text-xs font-semibold text-foreground">
                                {Math.round((registeredDevices.length / maxDevices) * 100)}%
                            </span>
                        </div>
                        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r bg-white transition-all duration-500"
                                style={{ width: `${(registeredDevices.length / maxDevices) * 100}%` }}
                            />
                        </div>
                    </div>
                </PricingCard.Body>
            </Card>

            {/* Registered Devices Grid */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4">Your Devices</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {registeredDevices.map((device) => (
                        <PricingCard.Card
                            key={device.id}
                            className="mb-6 @container/card  bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50  shadow-lg border-0 p-2 transition-all duration-300 hover:shadow-xl overflow-hidden"
                            >

                            <PricingCard.Header className="p-0 rounded-t-lg rounded-b-none ">
                                {/* Device Header */}
                                <div className="p-5  flex  flex-col  ">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2.5 rounded-lg bg-black text-white transition-transform duration-200 group-hover:scale-110">
                                            {getDeviceIcon(device.type)}
                                        </div>
                                        {device.isActive && (
                                            <Badge
                                                variant="outline"
                                                className="bg-green-500/10 text-green-400 border-green-500/30 animate-pulse"
                                            >
                                                <span className="relative flex h-2 w-2 mr-1.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                </span>
                                                Active
                                            </Badge>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-base mb-1">{device.name}</h3>
                                    <p className="text-xs text-muted-foreground capitalize">{device.type}</p>
                                </div>

                            </PricingCard.Header>
                            <PricingCard.Body>
                                {/* Device Details */}
                                <div className="p-5 space-y-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <IconClock className="h-3.5 w-3.5" />
                                        <span>Last active: {device.lastActive}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <IconMapPin className="h-3.5 w-3.5" />
                                        <span>{device.location}</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full bg-red-800 hover:bg-red-600 text-white border-1 border-neutral-900  hover:text-white transition-colors"
                                >
                                    <IconX className="h-4 w-4 mr-2" />
                                    Remove Device
                                </Button>
                            </PricingCard.Body>

                            {/* Device Actions
                            <div className="p-4 border-t border-border/40 bg-muted/10">
                            </div> */}
                        </PricingCard.Card>
                    ))}

                    {/* Add New Device Card */}
                    {canAddDevice  && (
                        <PricingCard.Card 
                        className="mb-6 @container/card flex justify-center bg-gradient-to-b from-neutral-800 to-neutral-900/90  overflow-hidden border-dashed border-2 border-border/60 transition-all duration-300 hover:border-primary/50 hover:shadow-lg group cursor-pointer">
                            <PricingCard.Body className="p-0 flex justify-center items-center ">
                                <div className="flex flex-col items-center justify-center px-6 text-center h-full">
                                        <IconPlus className="h-16 w-16  rounded-xl  bg-muted/50  shadow  text-white" />
                                    
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
            </div>

            {/* Bottom Section - Tips and Security */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Device Management Tips */}
                <Card className="mb-6  @container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50  shadow-lg border-4 p-2 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <PricingCard.Header className="border-b border-border/40 ">
                        <CardTitle className="text-base flex items-center gap-2">
                            <IconCheck className="h-5 w-5 text-green-400" />
                            Management Tips
                        </CardTitle>
                    </PricingCard.Header>
                    <PricingCard.Body className="p-0">
                        <div className="divide-y divide-dotted divide-border/60">
                            <div className="flex items-start gap-3 py-4 px-6">
                                <div className="flex-shrink-0 mt-1">
                                    <CheckCircle2 className=" rounded-full bg-" />
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
                <Card className="mb-6  @container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50  shadow-lg border-4 p-2 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <PricingCard.Header className="border-b ">
                        <CardTitle className="text-base flex items-center gap-2">
                            <IconAlertCircle className="h-5 w-5 " />
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
                            <Button variant="default" size="sm" className="flex-1 bg-red-800 hover:bg-red-700 border-1 ">
                                Contact Support
                            </Button>
                        </div>
                    </PricingCard.Body>
                </Card>
            </div>
        </div>
    )
}
