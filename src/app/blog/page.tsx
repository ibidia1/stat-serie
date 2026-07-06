import type { Metadata } from "next";
import BlogPage from "@/components/blog/BlogPage";

export const metadata: Metadata = {
  title: "Blog · QE.tn",
  description:
    "Guides pratiques pour étudiants en médecine : méthodologie, organisation, gestion du stress, conseils concours et actualités de la plateforme QE.tn.",
};

export default function Blog() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <BlogPage />
    </main>
  );
}
