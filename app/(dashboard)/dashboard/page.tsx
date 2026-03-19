import { Header } from "@/components/layout/Header";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentCandidatures } from "@/components/dashboard/RecentCandidatures";
import { TodaysRappels } from "@/components/dashboard/TodaysRappels";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Tableau de bord"
        description="Vue d'ensemble de vos candidatures"
      />
      <div className="flex-1 p-6 space-y-6">
        <StatsCards />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <RecentCandidatures />
          </div>
          <div>
            <TodaysRappels />
          </div>
        </div>
      </div>
    </div>
  );
}
