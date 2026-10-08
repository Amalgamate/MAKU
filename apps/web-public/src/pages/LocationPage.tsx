import React from 'react';

export default function LocationPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Operational Area</h1>
      <p className="text-gray-600 mb-12">
        MAKU operates across Merti Sub-County and parts of Isiolo County. View our borehole points,
        market locations, and member distribution on the map.
      </p>
      <div className="rounded-xl border border-dashed border-gray-300 p-16 text-center text-gray-400">
        Interactive GIS map — coming in Phase 4
      </div>
    </div>
  );
}
