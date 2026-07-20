'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Zap, BarChart3, Users, FileText, Lock, Cloud } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-2xl font-bold text-accent">BusinessOS</div>
          <Link href="/dashboard" className="rounded-lg bg-primary/20 px-6 py-2.5 font-medium text-accent hover:bg-primary/30">
            Sign In
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative min-h-screen flex items-center justify-center px-6 pt-20"
      >
        <div className="mx-auto max-w-4xl text-center space-y-8">
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-block">
            <div className="rounded-full border border-border/40 bg-primary/5 px-4 py-2 text-sm text-accent">
              ✨ The AI-powered operating system for modern businesses
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div variants={itemVariants}>
            <h1 className="text-6xl font-bold tracking-tight sm:text-7xl">
              Everything your business
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                needs in one place
              </span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p variants={itemVariants} className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Manage people, work, documents, communication, approvals, and analytics with BusinessOS. 
            One intelligent workspace for the modern enterprise.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-primary/20 px-8 py-4 font-medium text-accent hover:bg-primary/30 transition-colors"
            >
              Get Started
              <ArrowRight size={20} />
            </Link>
            <button className="inline-flex items-center gap-2 rounded-lg border border-border/40 px-8 py-4 font-medium hover:bg-card/40 transition-colors">
              Watch Demo
            </button>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            variants={itemVariants}
            className="mt-12 rounded-2xl border border-border/40 bg-card/40 p-2"
          >
            <div className="h-96 rounded-lg bg-gradient-to-br from-primary/10 via-card to-accent/10 flex items-center justify-center">
              <span className="text-muted-foreground">Dashboard Preview</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative py-24 px-6"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-5xl font-bold tracking-tight">Powerful Features</h2>
            <p className="mt-4 text-xl text-muted-foreground">Everything you need to run your business efficiently</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {[
              { icon: Users, title: 'Team Management', description: 'Organize and manage your entire team in one place' },
              { icon: BarChart3, title: 'Analytics', description: 'Real-time insights into your business performance' },
              { icon: FileText, title: 'Document Management', description: 'Centralized storage for all your documents' },
              { icon: Zap, title: 'AI Powered', description: 'Get intelligent suggestions and automation' },
              { icon: Lock, title: 'Enterprise Security', description: 'Bank-grade security for your data' },
              { icon: Cloud, title: 'Cloud Native', description: 'Access from anywhere, always synced' },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="rounded-lg border border-border/40 bg-card/40 p-8 hover:bg-card/60 transition-all"
              >
                <feature.icon size={32} className="mb-4 text-accent" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative py-24 px-6 bg-card/30"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-5xl font-bold tracking-tight">Trusted by Leading Teams</h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid gap-8 md:grid-cols-3"
          >
            {[
              { name: 'Sarah Chen', role: 'CTO at TechCorp', testimonial: 'BusinessOS transformed how our team collaborates. Highly recommended!' },
              { name: 'Michael Rodriguez', role: 'Founder at StartupXYZ', testimonial: 'Finally, a platform that does everything we need without the complexity.' },
              { name: 'Emily Parker', role: 'Operations Manager', testimonial: 'The best investment we made for our operations this year.' },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="rounded-lg border border-border/40 bg-card/60 p-6"
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-accent">★</span>
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground">"{testimonial.testimonial}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative py-24 px-6"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-5xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-xl text-muted-foreground">Choose the perfect plan for your business</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid gap-8 md:grid-cols-3"
          >
            {[
              { name: 'Starter', price: '$99', features: ['Up to 10 users', 'Basic analytics', 'Email support'] },
              { name: 'Professional', price: '$299', features: ['Up to 50 users', 'Advanced analytics', 'Priority support', 'Custom integrations'], featured: true },
              { name: 'Enterprise', price: 'Custom', features: ['Unlimited users', 'Custom solutions', '24/7 support', 'Dedicated account manager'] },
            ].map((plan, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`rounded-lg border p-8 transition-all ${
                  plan.featured
                    ? 'border-accent bg-primary/5 scale-105'
                    : 'border-border/40 bg-card/40'
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-muted-foreground">/month</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-accent" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full rounded-lg px-6 py-3 font-medium transition-colors ${
                  plan.featured
                    ? 'bg-primary/20 text-accent hover:bg-primary/30'
                    : 'border border-border/40 hover:bg-card/60'
                }`}>
                  Get Started
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative py-24 px-6"
      >
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2 variants={itemVariants} className="text-5xl font-bold tracking-tight">
            Ready to transform your business?
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-4 text-xl text-muted-foreground">
            Join thousands of companies using BusinessOS to streamline their operations.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-primary/20 px-8 py-4 font-medium text-accent hover:bg-primary/30 transition-colors"
            >
              Start Free Trial
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="border-t border-border/40 bg-card/40 py-12 px-6"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Features</a></li>
                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Docs</a></li>
                <li><a href="#" className="hover:text-foreground">API</a></li>
                <li><a href="#" className="hover:text-foreground">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 BusinessOS. All rights reserved.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
