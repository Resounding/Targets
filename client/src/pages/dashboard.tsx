import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentWeek } from "@/lib/date-utils";
import { weeklyScheduleApi } from "@/lib/api";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import WeeklyView from "@/components/dashboard/weekly-view";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus } from "lucide-react";
import WeeklyScheduleForm from "@/components/forms/weekly-schedule-form";

export default function Dashboard() {
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const { data: weeklySchedule, isLoading, error } = useQuery({
    queryKey: ["/api/weekly-schedules", currentWeek.year, currentWeek.week],
    queryFn: () => weeklyScheduleApi.getByWeek(currentWeek.year, currentWeek.week),
    retry: false,
  });

  const handleWeekChange = (year: number, week: number) => {
    setCurrentWeek({ year, week });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading weekly schedule...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !weeklySchedule) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header 
            currentWeek={currentWeek}
            onWeekChange={handleWeekChange}
            weeklySchedule={undefined}
          />
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Weekly Schedule Found</h3>
                <p className="text-muted-foreground mb-4">
                  Create a weekly schedule for week {currentWeek.week} of {currentWeek.year} to get started.
                </p>
                <Button onClick={() => setShowScheduleForm(true)} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Weekly Schedule
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        {showScheduleForm && (
          <WeeklyScheduleForm
            currentWeek={currentWeek}
            onClose={() => setShowScheduleForm(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentWeek={currentWeek}
          onWeekChange={handleWeekChange}
          weeklySchedule={weeklySchedule}
        />
        {weeklySchedule && (
          <WeeklyView 
            weeklySchedule={weeklySchedule}
            currentWeek={currentWeek}
          />
        )}
      </div>
    </div>
  );
}
