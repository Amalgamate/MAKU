import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

// ─── Block type definitions ───────────────────────────────────────────────────

export type BlockType =
  | 'hero'
  | 'stats'
  | 'services'
  | 'text_image'
  | 'cta'
  | 'contact'
  | 'testimonial'
  | 'gallery';

export interface HeroBlock {
  type: 'hero';
  heading: string;
  subheading: string;
  primaryBtnLabel: string;
  primaryBtnUrl: string;
  secondaryBtnLabel: string;
  secondaryBtnUrl: string;
  backgroundImage?: string;
}

export interface StatItem { icon: string; label: string; value: string; }
export interface StatsBlock { type: 'stats'; heading: string; items: StatItem[]; }

export interface ServiceItem { icon: string; title: string; description: string; }
export interface ServicesBlock { type: 'services'; heading: string; subheading: string; items: ServiceItem[]; }

export interface TextImageBlock {
  type: 'text_image';
  heading: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  imagePosition: 'left' | 'right';
  btnLabel?: string;
  btnUrl?: string;
}

export interface CtaBlock {
  type: 'cta';
  heading: string;
  subheading: string;
  btnLabel: string;
  btnUrl: string;
  bgColor?: string;
}

export interface ContactBlock {
  type: 'contact';
  heading: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapEmbedUrl?: string;
}

export interface TestimonialItem { name: string; role: string; quote: string; avatarUrl?: string; }
export interface TestimonialBlock { type: 'testimonial'; heading: string; items: TestimonialItem[]; }

export interface GalleryItem { url: string; caption?: string; }
export interface GalleryBlock { type: 'gallery'; heading: string; items: GalleryItem[]; }

export type Block =
  | HeroBlock | StatsBlock | ServicesBlock | TextImageBlock
  | CtaBlock | ContactBlock | TestimonialBlock | GalleryBlock;

// ─── Website Settings entity ──────────────────────────────────────────────────

@Entity('website_settings')
export class WebsiteSettings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200, default: 'MAKU' })
  siteName!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  tagline!: string | null;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl!: string | null;

  @Column({ name: 'header_logo_url', type: 'text', nullable: true })
  headerLogoUrl!: string | null;

  @Column({ name: 'footer_logo_url', type: 'text', nullable: true })
  footerLogoUrl!: string | null;

  @Column({ name: 'favicon_url', type: 'text', nullable: true })
  faviconUrl!: string | null;

  @Column({ name: 'primary_color', type: 'varchar', length: 20, default: '#7e2710' })
  primaryColor!: string;

  @Column({ name: 'nav_links', type: 'jsonb', default: '[]' })
  navLinks!: Array<{ label: string; url: string }>;

  @Column({ type: 'jsonb', default: '[]' })
  pages!: WebsitePage[];

  @Column({ name: 'footer_text', type: 'varchar', length: 500, nullable: true })
  footerText!: string | null;

  @Column({ name: 'social_links', type: 'jsonb', default: '{}' })
  socialLinks!: { facebook?: string; twitter?: string; whatsapp?: string; youtube?: string };

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished!: boolean;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

export interface WebsitePage {
  id: string;
  title: string;
  slug: string;        // e.g. 'home', 'impact', 'partners'
  isHomePage: boolean;
  isInNav: boolean;
  blocks: Block[];
  seoTitle?: string;
  seoDescription?: string;
}
