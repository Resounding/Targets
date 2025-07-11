import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { taskApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { formatWeekRange } from "@/lib/date-utils";
import { Download, Plus, ChevronLeft, ChevronRight, Clock, DollarSign } from "lucide-react";
import TaskForm from "@/components/forms/task-form";
import type { WeeklyScheduleWithRelations } from "@shared/schema";

interface HeaderProps {
  currentWeek: { year: number; week: number };
  onWeekChange: (year: number, week: number) => void;
  weeklySchedule?: WeeklyScheduleWithRelations;
}

export default function Header({ currentWeek, onWeekChange, weeklySchedule }: HeaderProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);

  const { data: tasks } = useQuery({
    queryKey: ["/api/tasks", weeklySchedule?.id],
    queryFn: () => weeklySchedule ? taskApi.getBySchedule(weeklySchedule.id) : Promise.resolve([]),
    enabled: !!weeklySchedule,
  });

  const calculateWeeklyTotals = () => {
    if (!tasks) return { totalEstimatedHours: 0, totalActualHours: 0, estimatedRevenue: 0, actualRevenue: 0 };
    
    const totalEstimatedHours = tasks.reduce((sum, task) => sum + parseFloat(task.estimatedHours), 0);
    const totalActualHours = tasks.reduce((sum, task) => sum + parseFloat(task.actualHours), 0);
    const estimatedRevenue = tasks
      .filter(task => task.billable)
      .reduce((sum, task) => sum + (parseFloat(task.estimatedHours) * parseFloat(task.customer.billingRate)), 0);
    const actualRevenue = tasks
      .filter(task => task.billable)
      .reduce((sum, task) => sum + (parseFloat(task.actualHours) * parseFloat(task.customer.billingRate)), 0);
    
    return { totalEstimatedHours, totalActualHours, estimatedRevenue, actualRevenue };
  };

  const weeklyTotals = calculateWeeklyTotals();

  const handlePreviousWeek = () => {
    let { year, week } = currentWeek;
    week -= 1;
    if (week < 1) {
      week = 52; // Approximate - most years have 52 weeks
      year -= 1;
    }
    onWeekChange(year, week);
  };

  const handleNextWeek = () => {
    let { year, week } = currentWeek;
    week += 1;
    if (week > 52) {
      week = 1;
      year += 1;
    }
    onWeekChange(year, week);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <h2 className="text-xl font-semibold text-neutral">Weekly Schedule</h2>
              <p className="text-sm text-gray-500">
                {formatWeekRange(currentWeek.year, currentWeek.week)} • Week {currentWeek.week}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousWeek}
                className="p-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextWeek}
                className="p-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            {weeklySchedule && (weeklyTotals.totalEstimatedHours > 0 || weeklyTotals.totalActualHours > 0) && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-blue-600">
                  <Clock className="w-4 h-4" />
                  <span>Est: {weeklyTotals.totalEstimatedHours}h</span>
                </div>
                <div className="flex items-center space-x-1 text-secondary">
                  <Clock className="w-4 h-4" />
                  <span>Act: {weeklyTotals.totalActualHours}h</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-600">
                  <DollarSign className="w-4 h-4" />
                  <span>Est: ${weeklyTotals.estimatedRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1 text-secondary">
                  <DollarSign className="w-4 h-4" />
                  <span>Act: ${weeklyTotals.actualRevenue.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              onClick={() => setShowTaskForm(true)}
              className="bg-primary hover:bg-primary/90"
              disabled={!weeklySchedule}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </header>

      {showTaskForm && weeklySchedule && (
        <TaskForm
          weeklySchedule={weeklySchedule}
          onClose={() => setShowTaskForm(false)}
        />
      )}
    </>
  );
}
