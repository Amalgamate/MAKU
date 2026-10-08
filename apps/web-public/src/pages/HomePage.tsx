import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Beef, Droplets, Sprout, ArrowRight } from 'lucide-react';
import { useCmsPage, useCmsSettings } from '../hooks/useWebsiteCms';
import { BlockRenderer } from '../components/BlockRenderer';

const APP_URL = import.meta.env['VITE_APP_URL'] ?? 'https://app.maku.trendscore.co.ke';

// ─── Static fallback content (shown when CMS has no home page) ───────────────

const stats = [
  { label: 'Registered Members', value: '1,200+', icon: <Users size={28} className="text-brand-700" /> },
  { label: 'Livestock Marketed', value: '8,400+', icon: <Beef size={28} className="text-brand-700" /> },
  { label: 'Boreholes Managed', value: '12', icon: <Droplets size={28} className="text-brand-700" /> },
  { label: 'Common Interest Groups', value: '34', icon: <Sprout size={28} className="text-brand-700" /> },
];

function StaticHome() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 to-brand-800 py-24 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Empowering Pastoralists<br />in Merti, Isiolo
          </h1>
          <p className="mt-6 text-lg text-brand-100 max-w-2xl mx-auto">
            MAKU — Merti Animal Key Users — is a farmer-led cooperative providing livestock
            marketing, water access, financial services, and training to smallholder pastoralists.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-brand-700 hover:bg-green-50 transition-colors"
            >
              Join as a Member
            </Link>
            <a
              href={`${APP_URL}/login`}
              className="rounded-md border border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Member Login →
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white" aria-label="Key statistics">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-12">Our Impact at a Glance</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-3 rounded-xl border border-gray-100 p-6 text-center shadow-sm">
                {s.icon}
                <span className="text-3xl font-extrabold text-gray-900">{s.value}</span>
                <span className="text-sm text-gray-500">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="py-16 bg-gray-50" aria-labelledby="services-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 id="services-heading" className="text-2xl font-bold text-gray-900 mb-10 text-center">What We Do</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Livestock Marketing', desc: 'Organised market days connecting our members to fair-price buyers for cattle, goats, camels, and sheep.' },
              { title: 'Water Access', desc: 'Managing boreholes and issuing water vouchers to ensure equitable water distribution across member households.' },
              { title: 'Honey & Beekeeping', desc: 'Supporting members in honey production, processing, and collective marketing.' },
              { title: 'Dairy & Milk', desc: 'Collecting, chilling, and marketing milk to reduce post-harvest losses and improve income.' },
              { title: 'Feedlot Services', desc: 'Fattening livestock during off-peak seasons to maximise sale prices.' },
              { title: 'Finance & Savings', desc: 'Member savings groups, cooperative finance management, and NGO grant administration.' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-700 text-white text-center" aria-label="Call to action">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold mb-4">Ready to Join MAKU?</h2>
          <p className="text-brand-100 mb-8">
            Register as a member today and gain access to cooperative services, market days, water
            vouchers, and more.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-brand-700 hover:bg-green-50 transition-colors"
          >
            Register Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function HomePage() {
  const { page, isLoading } = useCmsPage('home');
  const { data: settings } = useCmsSettings();

  // Update page title from CMS settings
  useEffect(() => {
    if (settings?.siteName) {
      document.title = settings.siteName;
    }
  }, [settings]);

  // While loading, show static content (avoids blank screen)
  if (isLoading) return <StaticHome />;

  // If CMS has a published home page with blocks, render it; otherwise fall back
  if (page && page.blocks.length > 0) {
    return (
      <>
        {page.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </>
    );
  }

  return <StaticHome />;
}
