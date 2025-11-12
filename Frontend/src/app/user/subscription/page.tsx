import {
  IconCreditCard,
  IconCheck,
  IconAlertCircle,
  IconCalendar,
  IconReceipt,
  IconArrowRight,
  IconDownload,
  IconSparkles,
  IconShield,
  IconCrown
} from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SUBSCRIPTION_PLANS } from "@/lib/constants"
import { BadgeDollarSign, CreditCard } from "lucide-react"

export default function SubscriptionPage() {
  const currentPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === "premium")
  const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const billingHistory = [
    { date: "Jan 15, 2025", amount: currentPlan?.price, status: "Paid", invoice: "INV-2025-001" },
    { date: "Dec 15, 2024", amount: currentPlan?.price, status: "Paid", invoice: "INV-2024-012" },
    { date: "Nov 15, 2024", amount: currentPlan?.price, status: "Paid", invoice: "INV-2024-011" },
  ]

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Subscription & Billing</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your subscription plan, payment methods, and billing history
        </p>
      </div>

      {/* Current Plan Card */}
      <Card className="mb-6 @container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50  shadow-lg border-4 p-2 transition-all duration-300 hover:shadow-xl overflow-hidden">
        <div className=" p-6 border-b-4 border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg ">
                <BadgeDollarSign className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">{currentPlan?.name}</h2>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                    <span className="relative flex h-2 w-2 mr-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Your current subscription plan</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-bold">
                {currentPlan?.currency}{currentPlan?.price}
              </span>
              <span className="text-muted-foreground">/{currentPlan?.billing}</span>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {/* Features Section */}
          <div className="p-6  border-border/40">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Plan Features
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-2">
                <div className=" rounded-full bg-white border-2 border-white">

                  <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>

                <span className="text-sm">{currentPlan?.features.profiles} User Profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className=" rounded-full bg-white border-2 border-white">

                  <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">{currentPlan?.features.maxDevices} Devices</span>
              </div>
              <div className="flex items-center gap-2">
                <div className=" rounded-full bg-white border-2 border-white">

                  <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">{currentPlan?.features.quality} Quality</span>
              </div>
              {currentPlan?.features.adFree && (
                <div className="flex items-center gap-2">
                  <div className=" rounded-full bg-white border-2 border-white">

                  <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                  <span className="text-sm">Ad-Free Experience</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="default" className="flex-1 sm:flex-none   
                                      bg-gradient-to-b from-red-500 to-red-600 hover:border-2 hover:border-neutral-900"
>
                <IconSparkles className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none">
                Change Plan
              </Button>
              <Button variant="ghost" className="flex-1 sm:flex-none text-destructive hover:text-destructive hover:bg-destructive/10">
                Cancel Subscription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Info Grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Next Billing Date */}
      <Card className="@container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50  shadow-lg border-4 p-2 transition-all duration-300 hover:shadow-xl overflow-hidden">
          <CardHeader className=" border-b-2 border-border/40">
            <CardTitle className="text-base flex items-center gap-2">
              <IconCalendar className="h-5 w-5 " />
              Next Billing Date
            </CardTitle>
          </CardHeader>
          <CardContent className="p-1 ">
            <p className="text-2xl font-bold">{nextBillingDate}</p>
            <p className="text-sm text-muted-foreground">
              You will be charged {currentPlan?.currency}{currentPlan?.price} on this date
            </p>
             
            
          </CardContent>
              <CardFooter>
                 <Button className=" p-3 w-full justify-center rounded-lg border-2 bg-black text-white hover:bg-red-700 text-xs w-100% flex items-center gap-2">
                <IconShield className="h-4 w-4" />
                Auto-renewal enabled
              </Button>
              </CardFooter>
        </Card>

        {/* Payment Method */}
      <Card className="@container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50  shadow-lg border-4 p-2 transition-all duration-300 hover:shadow-xl overflow-hidden">
          <CardHeader className="  border-b-2 border-border/40">
            <CardTitle className="text-base flex items-center gap-2">
              <IconCreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 ">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded ">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">•••• •••• •••• 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/2025</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                Verified
              </Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Update Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card className="mb-6 @container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50  shadow-lg border-4 p-2 transition-all duration-300 hover:shadow-xl overflow-hidden">
        <CardHeader className=" border-b border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <IconReceipt className="h-5 w-5 " />
                Billing History
              </CardTitle>
              <CardDescription className="mt-1">
                View and download your past invoices
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 ">
          <div className="divide-y divide-dotted divide-border/60">
            {billingHistory.map((invoice, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <IconReceipt className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">{invoice.date}</p>
                    <p className="text-sm text-muted-foreground">{currentPlan?.name} Plan</p>
                    <p className="text-xs text-muted-foreground mt-1">{invoice.invoice}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:ml-auto">
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                    {invoice.status}
                  </Badge>
                  <span className="font-bold text-lg">{currentPlan?.currency}{invoice.amount}</span>
                  <Button variant="ghost" size="sm">
                    <IconDownload className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card className="mb-6 @container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50  shadow-lg border-4 p-2 transition-all duration-300 hover:shadow-xl overflow-hidden">
        <CardHeader className=" border-b border-border/40">
          <CardTitle className="text-base flex items-center gap-2">
            <IconSparkles className="h-5 w-5" />
            Available Plans
          </CardTitle>
          <CardDescription>
            Compare and switch to a different plan that suits your needs
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isCurrentPlan = plan.id === currentPlan?.id
              const isUpgrade = plan.price > (currentPlan?.price || 0)

              return (
                <div
                  key={plan.id}
                  className={`p-5 rounded-lg border transition-all duration-300 ${isCurrentPlan
                      ? "border-2 bg-muted/50 shadow-lg"
                      : "border-border/40 bg-card hover:border-neutral-700 hover:shadow-md"
                    }`}
                >
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        {isCurrentPlan && (
                          <Badge variant="default" className="text-xs bg-accent border-2 border-neutral-600" >
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold gap-1 ">{plan.currency}{" "}{plan.price}</span>
                        <span className="text-sm text-muted-foreground">/{plan.billing}</span>
                      </div>
                    </div>

                    <div className=" text-sm grid  grid-flow-col grid-cols-3  justify-items-center">
                     
                      <div className="flex items-center gap-2 ">
                        <IconCheck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{plan.features.profiles} Profiles</span>
                      </div>
                      <div className="flex items-center gap-2 ">
                        <IconCheck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{plan.features.quality}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconCheck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{plan.features.maxDevices} Devices</span>
                      </div>
                      {plan.features.adFree && (
                        <div className="flex items-center gap-2">
                          <IconCheck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span>Ad-Free</span>
                        </div>
                      )}
                    </div>

                    {!isCurrentPlan && (
                      <Button
                        variant={isUpgrade ? "default" : "outline"}
                        size="sm"
                        className="w-full bg-gradient-to-b from-red-500 to-red-600 hover:border-2 hover:border-neutral-900"
                      >
                        {isUpgrade ? (
                          <>
                            <IconArrowRight className="mr-2 h-4 w-4" />
                            Upgrade
                          </>
                        ) : (
                          "Switch Plan"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card className="@container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50  shadow-lg border-4 p-2 transition-all duration-300 hover:shadow-xl overflow-hidden">
        <CardHeader className=" border-b border-border/40">
          <CardTitle className="text-base flex items-center gap-2">
            <IconAlertCircle className="h-5 w-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Contact our support team for assistance with billing, plan changes, or cancellations. We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm" 
                        className="flex-1 bg-gradient-to-b from-red-500 to-red-600 hover:border-2 hover:border-neutral-900"
            >
              View FAQ
            </Button>
            <Button variant="default" size="sm" 
                        className="flex-1 bg-gradient-to-b from-red-500 to-red-600 hover:border-2 hover:border-neutral-900"
            >
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
