import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Brain, Shield, Zap, Upload, TrendingUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import heroImage from "@/assets/hero-landscape.jpg";
import abstractImage from "@/assets/abstract-shapes.jpg";
import aerialImage from "@/assets/landscape-aerial.jpg";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Aura — AI-Powered Data Analytics" },
      { name: "description", content: "Transform raw data into actionable insights with AI-powered analytics. Upload, analyze, and visualize your data effortlessly." },
    ],
  }),
});

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-heading text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[0.95]"
          >
            Browse everything.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Upload your data. Let AI uncover the patterns, trends, and insights that matter most to your business.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to="/upload">
              <Button variant="hero" size="lg">
                Get Started <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="rounded-full">
                View Pricing
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-5xl mx-auto mt-16 relative"
        >
          <div className="absolute -left-8 top-1/3 w-32 h-48 bg-sage/30 rounded-2xl -z-10" />
          <div className="absolute -right-8 top-1/3 w-32 h-48 bg-sage/30 rounded-2xl -z-10" />
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-border/30">
            <img
              src={heroImage}
              alt="Analytics dashboard showing data visualization over landscape"
              width={1920}
              height={1080}
              className="w-full h-auto"
            />
          </div>
        </motion.div>

        {/* Trust Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="max-w-4xl mx-auto mt-12 flex flex-wrap justify-center gap-8 text-xs text-muted-foreground"
        >
          {["Enterprise Ready", "SOC 2 Compliant", "99.9% Uptime", "GDPR Ready", "256-bit Encryption"].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              {item}
            </div>
          ))}
        </motion.div>
      </section>

      {/* We've Cracked the Code */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp}>
            <h2 className="font-heading text-4xl sm:text-5xl mb-3">We've cracked the code.</h2>
            <p className="text-muted-foreground max-w-lg">
              Our AI analyzes your data in seconds, delivering insights that used to take weeks.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: <Brain className="w-5 h-5" />, title: "AI-Powered Analysis", desc: "Deep learning models automatically detect patterns, correlations, and anomalies in your data." },
              { icon: <Zap className="w-5 h-5" />, title: "Instant Results", desc: "Get comprehensive analysis in under 30 seconds, no matter the size of your dataset." },
              { icon: <BarChart3 className="w-5 h-5" />, title: "Smart Visualizations", desc: "Auto-generated charts, heatmaps, and dashboards tailored to your specific data." },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                {...stagger}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:shadow-md transition-shadow"
              >
                <div className="p-3 rounded-xl bg-accent/50 w-fit mb-4">{feature.icon}</div>
                <h3 className="font-heading text-xl mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* See the Big Picture */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <h2 className="font-heading text-4xl sm:text-5xl mb-6">See the Big Picture</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                From correlation matrices to regression analysis, our platform gives you a complete statistical overview with natural-language explanations.
              </p>
              <div className="space-y-4">
                {[
                  "Automatic column type detection and data profiling",
                  "AI-driven anomaly and outlier detection",
                  "Predictive trend forecasting with confidence scores",
                  "Natural-language summaries of every insight",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    {...stagger}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-sage/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-sage">{i + 1}</span>
                    </div>
                    <p className="text-sm">{item}</p>
                  </motion.div>
                ))}
              </div>
              <Link to="/upload" className="inline-block mt-8">
                <Button variant="outline" className="rounded-full">
                  Try It Free <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <img
                src={abstractImage}
                alt="Abstract 3D shapes representing data analysis"
                width={800}
                height={600}
                className="rounded-2xl shadow-lg"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Aura - Pricing Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Pricing</p>
            <h2 className="font-heading text-4xl sm:text-5xl mb-3">Why Choose Aura?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-4">
              Compare features across plans and see why leading teams choose Aura.
            </p>
            <Link to="/pricing">
              <Button variant="outline" size="sm" className="rounded-full mb-10">
                Compare Plans
              </Button>
            </Link>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="bg-card rounded-2xl border border-border/50 overflow-hidden"
          >
            <div className="grid grid-cols-4 text-sm">
              <div className="p-4 font-medium text-left border-b border-border/50">Feature</div>
              <div className="p-4 font-medium border-b border-border/50">Aura</div>
              <div className="p-4 font-medium border-b border-border/50 text-muted-foreground">Competitor A</div>
              <div className="p-4 font-medium border-b border-border/50 text-muted-foreground">Competitor B</div>
              {[
                ["AI-Powered Analysis", "✓", "Partial", "✗"],
                ["Unlimited Datasets", "✓", "Up to 10", "Up to 5"],
                ["Real-time Processing", "✓", "Batch only", "Batch only"],
                ["Natural Language Insights", "✓", "✗", "✗"],
                ["Custom Dashboards", "✓", "✓", "Limited"],
              ].map(([feature, ...values]) => (
                <React.Fragment key={feature}>
                  <div className="p-4 text-left text-sm border-b border-border/30">{feature}</div>
                  {values.map((v, i) => (
                    <div key={i} className={`p-4 text-sm border-b border-border/30 ${i === 0 ? "text-sage font-medium" : "text-muted-foreground"}`}>
                      {v}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden"
            >
              <img
                src={abstractImage}
                alt="Testimonial visual"
                width={800}
                height={600}
                className="w-full h-64 lg:h-80 object-cover rounded-2xl"
                loading="lazy"
              />
            </motion.div>
            <motion.div {...fadeUp} className="lg:pl-8">
              <blockquote className="font-heading text-2xl sm:text-3xl leading-snug">
                "I was skeptical, but Aura has completely transformed the way I manage my business. The data visualizations are so clear and intuitive."
              </blockquote>
              <p className="mt-4 text-sm text-muted-foreground">— Sarah Chen, VP of Analytics at TechCorp</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Your Success */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-heading text-4xl sm:text-5xl">Map Your Success</h2>
            <Link to="/upload">
              <Button variant="warm" size="sm" className="rounded-full hidden sm:inline-flex">
                Start Free <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { step: "01", title: "Upload Data", desc: "Drag and drop your CSV, Excel, JSON, or XML files into the workspace." },
              { step: "02", title: "AI Analysis", desc: "Our engine automatically cleans, profiles, and analyzes your data." },
              { step: "03", title: "Get Insights", desc: "Receive visual reports, predictions, and actionable recommendations." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                {...stagger}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <p className="font-heading text-5xl text-muted-foreground/30 mb-3">{item.step}</p>
                <h3 className="font-heading text-xl mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden"
          >
            <img
              src={aerialImage}
              alt="Aerial landscape representing data journey"
              width={1920}
              height={600}
              className="w-full h-64 sm:h-80 object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <h2 className="font-heading text-4xl sm:text-5xl mb-4">Connect with us</h2>
            <p className="text-muted-foreground mb-8">
              Start transforming your data into insights today. No credit card required.
            </p>
            <Link to="/signup">
              <Button variant="warm" size="lg" className="rounded-full w-full sm:w-auto px-16">
                Start Free Trial
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import React from "react";
