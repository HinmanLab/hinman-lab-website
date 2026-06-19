import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const publications = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    authors: z.string(),
    journal: z.string(),
    year: z.number(),
    month: z.string().nullable().optional(),
    volume: z.string().nullable().optional(),
    issue: z.string().nullable().optional(),
    pages: z.string().nullable().optional(),
    pmid: z.string().nullable().optional(),
    pmcid: z.string().nullable().optional(),
    doi: z.string().nullable().optional(),
    url: z.string().url().nullable().optional(),
    featured: z.boolean().optional().default(false),
    senior: z.boolean().optional().default(false),
    first: z.boolean().optional().default(false),
  }),
});

const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    group: z.enum(['PI', 'Project Scientist', 'Postdoc', 'Grad Student', 'Clinical', 'Staff', 'Undergraduate', 'Alumni']),
    order: z.number().optional().default(100),
    photo: z.string().nullable().optional(),
    linkedin: z.string().url().nullable().optional(),
    twitter: z.string().url().nullable().optional(),
    email: z.string().nullable().optional(),
    orcid: z.string().nullable().optional(),
    google_scholar: z.string().url().nullable().optional(),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    image: z.string().nullable().optional(),
    link: z.string().url().nullable().optional(),
  }),
});

const funding = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/funding' }),
  schema: z.object({
    title: z.string(),
    grant: z.string(),
    agency: z.string(),
    role: z.string().optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    active: z.boolean().optional().default(true),
    url: z.string().url().nullable().optional(),
  }),
});

export const collections = { publications, team, news, funding };
