import { Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { Card, Badge } from '@maku/ui';
import { useCommoditySummary } from '../hooks/useCommodities';
import type { CommodityType } from '../services/commodities.service';

const COMMODITY_INFO: Record<CommodityType, { label: string; desc: string; to: string; emoji: string; unit: string }> = {
  honey:        { label: 'Honey & Beekeeping', desc: 'Collection, processing, and cooperative sale of honey.', to: '/commodities/honey',        emoji: '🍯', unit: 'kg' },
  dairy:        { label: 'Dairy / Milk',         desc: 'Daily milk collection per member, chilling, and bulk sale.', to: '/commodities/dairy',    emoji: '🥛', unit: 'litres' },
  hides:        { label: 'Hides & Skins',        desc: 'Collection, grading, and bulk sale of hides and skins.', to: '/commodities/hides',        emoji: '🟤', unit: 'pieces' },
  poultry:      { label: 'Poultry',              desc: 'Flock management, production records, and sales.', to: '/commodities/poultry',            emoji: '🐔', unit: 'birds' },
  bones:        { label: 'Bones & Horns',        desc: 'Collection and sale of bones and horns.', to: '/commodities/bones',                       emoji: '🦴', unit: 'kg' },
  conservation: { label: 'Environmental',        desc: 'Track conservation activities and impact reporting.', to: '/commodities/conservation',    emoji: '🌱', unit: 'units' },
};

export default function CommoditiesPage() {
  const { data: summary = [] } = useCommoditySummary();

  const summaryMap = Object.fromEntries(summary.map((s) => [s.commodityType, s]));

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700"><Sprout size={22} /></div>
        <div>
          <h1 className="section-heading">Commodity Modules</h1>
          <p className="text-sm text-gray-500">Manage MAKU's diverse commodity operations</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.entries(COMMODITY_INFO) as [CommodityType, typeof COMMODITY_INFO[CommodityType]][]).map(([type, info]) => {
          const stats = summaryMap[type];
          return (
            <Link key={type} to={info.to}>
              <Card className="h-full hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{info.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">{info.label}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{info.desc}</p>
                  </div>
                </div>
                {stats ? (
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400">Collections</p>
                      <p className="font-semibold text-gray-900">{stats.totalQuantity.toFixed(1)} {info.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Sales value</p>
                      <p className="font-semibold text-green-700">KES {stats.totalValue.toLocaleString()}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 pt-3 border-t border-gray-100">No transactions yet</p>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
