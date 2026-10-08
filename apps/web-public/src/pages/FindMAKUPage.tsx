import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function FindMAKUPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Find MAKU</h1>
      <p className="text-gray-600 mb-12">Reach our offices or contact us by phone and email.</p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Contact Details</h2>
          <ul className="space-y-4 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-brand-700" />
              <span>MAKU Offices, Merti Town<br />Merti Sub-County, Isiolo County<br />Kenya</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="shrink-0 text-brand-700" />
              <a href="tel:+254700000000" className="hover:text-brand-700 transition-colors">
                +254 700 000 000
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="shrink-0 text-brand-700" />
              <a href="mailto:info@maku.coop" className="hover:text-brand-700 transition-colors">
                info@maku.coop
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Clock size={18} className="mt-0.5 shrink-0 text-brand-700" />
              <span>Monday – Friday: 8:00 AM – 5:00 PM<br />Saturday: 8:00 AM – 1:00 PM</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400">
          Map embed — coming in Phase 4
        </div>
      </div>
    </div>
  );
}
