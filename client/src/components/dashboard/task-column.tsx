import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getDayName } from '@/lib/date-utils';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './task-card';
import TaskForm from '@/components/forms/task-form';
import type {
  TaskWithRelations,
  WeeklyScheduleWithRelations,
  TargetWithRelations,
} from '@shared/schema';

interface TaskColumnProps {
  date: Date;
  dayIndex: number;
  tasks: TaskWithRelations[];
  weeklySchedule: WeeklyScheduleWithRelations;
  droppedTarget?: TargetWithRelations | null;
  onClearDroppedTarget?: () => void;
}

export default function TaskColumn({
  date,
  dayIndex,
  tasks,
  weeklySchedule,
  droppedTarget,
  onClearDroppedTarget,
}: TaskColumnProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);

  const { isOver, setNodeRef } = useDroppable({
    id: `task-column-${dayIndex}`,
    data: {
      type: 'task-column',
      date: date,
      dayIndex: dayIndex,
    },
  });

  // Handle when a target is dropped on this column
  useEffect(() => {
    if (droppedTarget) {
      setShowTaskForm(true);
    }
  }, [droppedTarget]);

  const calculateDayTotals = () => {
    const totalEstimatedHours = tasks.reduce(
      (sum, task) => sum + parseFloat(task.estimatedHours),
      0
    );
    const totalActualHours = tasks.reduce(
      (sum, task) => sum + parseFloat(task.actualHours),
      0
    );
    const estimatedRevenue = tasks
      .filter((task) => task.billable)
      .reduce(
        (sum, task) =>
          sum +
          parseFloat(task.estimatedHours) *
            parseFloat(task.customer.billingRate),
        0
      );
    const actualRevenue = tasks
      .filter((task) => task.billable)
      .reduce(
        (sum, task) =>
          sum +
          parseFloat(task.actualHours) * parseFloat(task.customer.billingRate),
        0
      );

    return {
      totalEstimatedHours,
      totalActualHours,
      estimatedRevenue,
      actualRevenue,
    };
  };

  const dayTotals = calculateDayTotals();

  return (
    <>
      <div
        ref={setNodeRef}
        className={`bg-white rounded-lg border border-gray-200 flex flex-col transition-all duration-200 ${
          isOver
            ? 'bg-blue-50 border-blue-400 border-2 shadow-lg ring-2 ring-blue-200'
            : ''
        }`}>
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-neutral">
                {getDayName(dayIndex)}
              </h3>
              <p className="text-xs text-gray-500">{format(date, 'MMM d')}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTaskForm(true)}
              className="p-1 h-6 w-6">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          {(dayTotals.totalEstimatedHours > 0 ||
            dayTotals.totalActualHours > 0) && (
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Est Hours:</span>
                <span className="font-medium text-blue-600">
                  {dayTotals.totalEstimatedHours}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Act Hours:</span>
                <span className="font-medium text-secondary">
                  {dayTotals.totalActualHours}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Est Rev:</span>
                <span className="font-medium text-blue-600">
                  ${dayTotals.estimatedRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Act Rev:</span>
                <span className="font-medium text-secondary">
                  ${dayTotals.actualRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 p-3 space-y-3 min-h-[400px] relative">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              weeklySchedule={weeklySchedule}
            />
          ))}

          {tasks.length === 0 && !isOver && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No tasks scheduled</p>
            </div>
          )}

          {isOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50/50 border-2 border-dashed border-blue-300 rounded-lg">
              <div className="text-center text-blue-600">
                <Plus className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">
                  Drop target here to create task
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showTaskForm && (
        <TaskForm
          weeklySchedule={weeklySchedule}
          defaultDate={date}
          preSelectedTarget={droppedTarget || undefined}
          onClose={() => {
            setShowTaskForm(false);
            onClearDroppedTarget?.();
          }}
        />
      )}
    </>
  );
}
