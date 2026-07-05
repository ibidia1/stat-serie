import type { Metadata } from "next";
import AccueilDashboard from "@/components/dashboard/AccueilDashboard";

export const metadata: Metadata = {
  title: "Accueil · QE.tn",
  description: "Votre tableau de bord d'étude QE.tn",
};

export default function DashboardPage() {
  return <AccueilDashboard />;
}
