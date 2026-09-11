import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    emoji: z.string().default("📓"),
    readingTime: z.string().default("3 min"),
    order: z.number().default(0),
  }),
});

export const collections = { blog };
