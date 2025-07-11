import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, AlertTriangle, GripVertical, Edit2 } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import TargetForm from '@/components/forms/target-form';
import type {
  WeeklyScheduleWithRelations,
  TargetWithRelations,
  TaskWithRelations,
} from '@shared/schema';

interface TargetsSidebarProps {
  weeklySchedule: WeeklyScheduleWithRelations;
  targets: TargetWithRelations[];
  tasks: TaskWithRelations[];
}

interface DraggableTargetCardProps {
  target: TargetWithRelations;
  progress: {
    allocatedHours: number;
    targetHours: number;
    percentage: number;
    remainingHours: number;
  };
  onEdit: (target: TargetWithRelations) => void;
}

function DraggableTargetCard({ target, progress, onEdit }: DraggableTargetCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `target-${target.id}`,
      data: {
        type: 'target',
        target: target,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group bg-gray-50 border-gray-200 transition-all duration-200 hover:shadow-md hover:border-gray-300 ${
        isDragging ? 'opacity-50 scale-105' : ''
      }`}
      {...attributes}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="cursor-grab active:cursor-grabbing p-1 -m-1 rounded hover:bg-gray-200"
              {...listeners}
            >
              <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
            </div>
            <h4 className="font-medium text-neutral">{target.customer.name}</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              ${target.customer.billingRate}/hr
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(target)}
              className="p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3">{target.goal}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Target Hours</span>
            <span className="font-medium">{progress.targetHours}h</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Allocated Hours</span>
            <span className="font-medium text-secondary">
              {progress.allocatedHours}h
            </span>
          </div>

          <Progress value={progress.percentage} className="h-2" />

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {Math.round(progress.percentage)}% allocated
            </span>
            {progress.remainingHours > 0 && (
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-800 border-yellow-200">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {progress.remainingHours}h remaining
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TargetsSidebar({
  weeklySchedule,
  targets,
  tasks,
}: TargetsSidebarProps) {
  const [showTargetForm, setShowTargetForm] = useState(false);
  const [editingTarget, setEditingTarget] = useState<TargetWithRelations | null>(null);

  const handleEditTarget = (target: TargetWithRelations) => {
    setEditingTarget(target);
    setShowTargetForm(true);
  };

  const handleCloseForm = () => {
    setShowTargetForm(false);
    setEditingTarget(null);
  };

  const calculateTargetProgress = (target: TargetWithRelations) => {
    const targetTasks = tasks.filter((task) => task.targetId === target.id);
    const allocatedHours = targetTasks.reduce(
      (sum, task) => sum + parseFloat(task.estimatedHours),
      0
    );
    const targetHours = parseFloat(target.targetHours);
    const percentage =
      targetHours > 0 ? (allocatedHours / targetHours) * 100 : 0;

    return {
      allocatedHours,
      targetHours,
      percentage: Math.min(percentage, 100),
      remainingHours: Math.max(targetHours - allocatedHours, 0),
    };
  };


  return (
    <>
      <aside className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-neutral">Week Targets</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingTarget(null);
                setShowTargetForm(true);
              }}
              className="p-1 h-6 w-6">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-sm text-gray-500">Progress tracking</p>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Overall Goal */}
          <div className="bg-gradient-to-r from-primary to-support text-white rounded-lg p-4">
            <h4 className="font-medium mb-2">Weekly Goal</h4>
            <p className="text-sm opacity-90">{weeklySchedule.overallGoal}</p>
          </div>

          {/* Target Progress Cards */}
          {targets.map((target) => {
            const progress = calculateTargetProgress(target);

            return (
              <DraggableTargetCard
                key={target.id}
                target={target}
                progress={progress}
                onEdit={handleEditTarget}
              />
            );
          })}

          {targets.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Target className="w-12 h-12 mx-auto mb-4" />
              <p className="text-sm mb-2">No targets set</p>
              <p className="text-xs">Add targets to track your progress</p>
            </div>
          )}
        </div>
      </aside>

      {showTargetForm && (
        <TargetForm
          weeklySchedule={weeklySchedule}
          target={editingTarget || undefined}
          onClose={handleCloseForm}
        />
      )}
    </>
  );
}
