import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { WebsiteSettings, type WebsitePage, type Block } from './website.entity';
import { v4 as uuidv4 } from 'uuid';

// Default pages when first initialised
const DEFAULT_PAGES: WebsitePage[] = [
  {
    id: uuidv4(),
    title: 'Home',
    slug: 'home',
    isHomePage: true,
    isInNav: true,
    blocks: [
      {
        type: 'hero',
        heading: 'Empowering Pastoralists in Merti, Isiolo',
        subheading: 'MAKU — Merti Animal Key Users — is a farmer-led cooperative providing livestock marketing, water access, financial services, and training to smallholder pastoralists.',
        primaryBtnLabel: 'Join as a Member',
        primaryBtnUrl: '/register',
        secondaryBtnLabel: 'Member Login →',
        secondaryBtnUrl: 'https://app.maku.trendscore.co.ke/login',
      },
      {
        type: 'stats',
        heading: 'Our Impact at a Glance',
        items: [
          { icon: 'Users', label: 'Registered Members', value: '1,200+' },
          { icon: 'Beef',  label: 'Livestock Marketed', value: '8,400+' },
          { icon: 'Droplets', label: 'Boreholes Managed', value: '12' },
          { icon: 'Users', label: 'Common Interest Groups', value: '34' },
        ],
      },
      {
        type: 'services',
        heading: 'What We Do',
        subheading: 'MAKU provides a range of services to support pastoralist livelihoods.',
        items: [
          { icon: 'Beef',     title: 'Livestock Marketing', description: 'Organised market days connecting members to fair-price buyers.' },
          { icon: 'Droplets', title: 'Water Access', description: 'Managing boreholes and issuing water vouchers to member households.' },
          { icon: 'Sprout',   title: 'Honey & Beekeeping', description: 'Supporting members in honey production and collective marketing.' },
          { icon: 'Milk',     title: 'Dairy & Milk', description: 'Collecting, chilling, and marketing milk to reduce post-harvest losses.' },
          { icon: 'TrendingUp', title: 'Feedlot Services', description: 'Fattening livestock during off-peak seasons to maximise sale prices.' },
          { icon: 'Landmark', title: 'Finance & Savings', description: 'Member savings groups, cooperative finance, and NGO grant administration.' },
        ],
      },
      {
        type: 'cta',
        heading: 'Ready to Join MAKU?',
        subheading: 'Register as a member today and gain access to cooperative services, market days, water vouchers, and more.',
        btnLabel: 'Register Now',
        btnUrl: '/register',
        bgColor: '#7e2710',
      },
    ],
    seoTitle: 'MAKU — Merti Animal Key Users Cooperative',
    seoDescription: 'Empowering pastoralist communities in Merti, Isiolo County, Kenya.',
  },
  {
    id: uuidv4(),
    title: 'Our Impact',
    slug: 'impact',
    isHomePage: false,
    isInNav: true,
    blocks: [
      { type: 'hero', heading: 'Our Impact', subheading: 'Stories, data, and evidence of MAKU\'s work in Merti and Isiolo County.', primaryBtnLabel: '', primaryBtnUrl: '', secondaryBtnLabel: '', secondaryBtnUrl: '' },
    ],
  },
  {
    id: uuidv4(),
    title: 'Partners',
    slug: 'partners',
    isHomePage: false,
    isInNav: true,
    blocks: [
      { type: 'hero', heading: 'NGO & Partners', subheading: 'MAKU collaborates with development partners and NGOs to deliver services to pastoralist communities.', primaryBtnLabel: '', primaryBtnUrl: '', secondaryBtnLabel: '', secondaryBtnUrl: '' },
    ],
  },
  {
    id: uuidv4(),
    title: 'Find Us',
    slug: 'find-us',
    isHomePage: false,
    isInNav: true,
    blocks: [
      {
        type: 'contact',
        heading: 'Find MAKU',
        address: 'MAKU Offices, Merti Town, Merti Sub-County, Isiolo County, Kenya',
        phone: '+254 700 000 000',
        email: 'info@maku.coop',
        hours: 'Monday–Friday: 8:00 AM – 5:00 PM | Saturday: 8:00 AM – 1:00 PM',
      },
    ],
  },
];

@Injectable()
export class WebsiteService {
  constructor(
    @InjectRepository(WebsiteSettings)
    private readonly repo: Repository<WebsiteSettings>,
  ) {}

  // ── Get or create the single website settings record ─────────────────────

  async getSettings(): Promise<WebsiteSettings> {
    let settings = await this.repo.findOne({ where: {} });
    if (!settings) {
      settings = this.repo.create({
        siteName: 'MAKU',
        tagline: 'Merti Animal Key Users Cooperative',
        primaryColor: '#7e2710',
        navLinks: [
          { label: 'Home', url: '/' },
          { label: 'Our Impact', url: '/impact' },
          { label: 'Partners', url: '/partners' },
          { label: 'Find Us', url: '/find-us' },
        ],
        pages: DEFAULT_PAGES,
        footerText: '© ' + new Date().getFullYear() + ' Merti Animal Key Users. Merti, Isiolo County, Kenya.',
        isPublished: true,
      });
      await this.repo.save(settings);
    }
    return settings;
  }

  async updateSettings(data: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    const s = await this.getSettings();
    Object.assign(s, data);
    return this.repo.save(s);
  }

  // ── Pages ─────────────────────────────────────────────────────────────────

  async getPage(slug: string): Promise<WebsitePage | null> {
    const s = await this.getSettings();
    return s.pages.find((p) => p.slug === slug) ?? null;
  }

  async addPage(page: Omit<WebsitePage, 'id'>): Promise<WebsiteSettings> {
    const s = await this.getSettings();
    s.pages = [...s.pages, { ...page, id: uuidv4() }];
    return this.repo.save(s);
  }

  async updatePage(pageId: string, data: Partial<WebsitePage>): Promise<WebsiteSettings> {
    const s = await this.getSettings();
    s.pages = s.pages.map((p) => p.id === pageId ? { ...p, ...data } : p);
    return this.repo.save(s);
  }

  async deletePage(pageId: string): Promise<WebsiteSettings> {
    const s = await this.getSettings();
    s.pages = s.pages.filter((p) => p.id !== pageId);
    return this.repo.save(s);
  }

  // ── Blocks ────────────────────────────────────────────────────────────────

  async addBlock(pageId: string, block: Block): Promise<WebsiteSettings> {
    const s = await this.getSettings();
    s.pages = s.pages.map((p) =>
      p.id === pageId ? { ...p, blocks: [...p.blocks, block] } : p,
    );
    return this.repo.save(s);
  }

  async updateBlocks(pageId: string, blocks: Block[]): Promise<WebsiteSettings> {
    const s = await this.getSettings();
    s.pages = s.pages.map((p) => p.id === pageId ? { ...p, blocks } : p);
    return this.repo.save(s);
  }

  // ── Publish ───────────────────────────────────────────────────────────────

  async publish(): Promise<WebsiteSettings> {
    const s = await this.getSettings();
    s.isPublished = true;
    s.publishedAt = new Date();
    return this.repo.save(s);
  }
}
