"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-start/10 via-bg-surface to-accent-end/5" />
          <div className="absolute inset-0 border border-accent-start/10 rounded-2xl" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent-start/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent-end/10 rounded-full blur-[100px]" />

          <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Ready to evolve your{" "}
              <span className="gradient-text">intelligence</span>?
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Join thousands at the forefront of AI-powered learning. Rakshak AI
              adapts to you — making education personal, accessible, and
              boundless.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight size={18} />}
                >
                  Get Beta Access
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="secondary" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
