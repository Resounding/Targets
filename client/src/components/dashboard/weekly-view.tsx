import { useQuery } from "@tanstack/react-query";
import { taskApi, targetApi } from "@/lib/api";
import { getWeekDates } from "@/lib/date-utils";
import TaskColumn from "./task-column";
import TargetsSidebar from "./targets-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useState, useRef } from "react";
import type { WeeklyScheduleWithRelations, TargetWithRelations } from "@shared/schema";

interface WeeklyViewProps {
  weeklySchedule: WeeklyScheduleWithRelations;
  currentWeek: { year: number; week: number };
}

export default function WeeklyView({ weeklySchedule, currentWeek }: WeeklyViewProps) {
  const weekDates = getWeekDates(currentWeek.year, currentWeek.week);
  const [droppedTargetInfo, setDroppedTargetInfo] = useState<{
    target: TargetWithRelations;
    dayIndex: number;
  } | null>(null);

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks", weeklySchedule.id],
    queryFn: () => taskApi.getBySchedule(weeklySchedule.id),
  });

  const { data: targets, isLoading: targetsLoading } = useQuery({
    queryKey: ["/api/targets", weeklySchedule.id],
    queryFn: () => targetApi.getBySchedule(weeklySchedule.id),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active.data.current) return;
    
    // Check if we're dragging a target over a task column
    if (
      active.data.current.type === 'target' && 
      over.data.current?.type === 'task-column'
    ) {
      const target = active.data.current.target as TargetWithRelations;
      const dayIndex = over.data.current.dayIndex as number;
      
      // Set the dropped target info so the TaskColumn can handle it
      setDroppedTargetInfo({ target, dayIndex });
    }
  };

  const clearDroppedTarget = () => {
    setDroppedTargetInfo(null);
  };

  if (tasksLoading || targetsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading weekly data...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex-1 flex overflow-hidden">
        {/* Task Columns */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-6 gap-4 min-w-[1200px]">
            {weekDates.map((date, index) => (
              <TaskColumn
                key={date.toISOString()}
                date={date}
                dayIndex={index}
                tasks={tasks?.filter(task => task.date === date.toISOString().split('T')[0]) || []}
                weeklySchedule={weeklySchedule}
                droppedTarget={droppedTargetInfo?.dayIndex === index ? droppedTargetInfo.target : null}
                onClearDroppedTarget={clearDroppedTarget}
              />
            ))}
          </div>
        </div>

        {/* Targets Sidebar */}
        <TargetsSidebar
          weeklySchedule={weeklySchedule}
          targets={targets || []}
          tasks={tasks || []}
        />
      </div>
    </DndContext>
  );
}
