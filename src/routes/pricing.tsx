import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — Aura Analytics" },
      { name: "description", content: "Simple, transparent pricing for AI-powered data analytics." },
    ],
  }),
});

const plans = [
  {
    name: "Starter",
    price: "Free",
    desc: "For individuals exploring data analytics.",
    features: ["5 datasets", "Basic analysis", "CSV & JSON support", "Community support", "7-day data retention"],
    cta: "Get Started",
    variant: "outline" as const,
  },
  {
    name: "Professional",
    price: "$49",
    period: "/month",
    desc: "For teams that need deeper insights.",
    features: ["Unlimited datasets", "Advanced AI analysis", "All file formats", "Priority support", "Unlimited retention", "Custom dashboards", "Export reports"],
    cta: "Start Free Trial",
    variant: "warm" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For organizations with advanced needs.",
    features: ["Everything in Pro", "SSO & SAML", "Dedicated support", "Custom integrations", "SLA guarantees", "On-premise option", "Team management"],
    cta: "Contact Sales",
    variant: "sage" as const,
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <h1 className="font-heading text-5xl sm:text-6xl mb-4">Simple pricing</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start free and scale as you grow. No hidden fees, cancel anytime.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`bg-card rounded-2xl p-8 border flex flex-col ${
                  plan.popular ? "border-primary shadow-lg scale-[1.02]" : "border-border/50"
                }`}
              >
                {plan.popular && (
                  <span className="text-xs font-medium bg-primary text-primary-foreground px-3 py-1 rounded-full w-fit mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="font-heading text-2xl">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-3 mb-2">
                  <span className="font-heading text-4xl">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
                <div className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-sage shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <Link to="/signup">
                  <Button variant={plan.variant} className="w-full rounded-xl">
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
