import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { taskApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, User, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import TaskForm from '@/components/forms/task-form';
import type {
  TaskWithRelations,
  WeeklyScheduleWithRelations,
} from '@shared/schema';

interface TaskCardProps {
  task: TaskWithRelations;
  weeklySchedule: WeeklyScheduleWithRelations;
}

export default function TaskCard({ task, weeklySchedule }: TaskCardProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const deleteTaskMutation = useMutation({
    mutationFn: taskApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = () => {
    deleteTaskMutation.mutate(task.id);
  };

  const getCustomerColorClass = (customerName: string) => {
    // Simple hash function to get consistent colors
    const hash = customerName.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    const colors = [
      'text-primary',
      'text-secondary',
      'text-accent',
      'text-support',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <>
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-medium ${getCustomerColorClass(
                task.customer.name
              )}`}>
              {task.customer.name}
            </span>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-500">
                <span className="text-blue-600">{task.estimatedHours}h</span>
                <span className="mx-1">/</span>
                <span className="text-secondary">{task.actualHours}h</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditForm(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 focus:text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <p className="text-sm text-gray-900 mb-2 line-clamp-2">
            {task.notes}
          </p>

          <div className="flex items-center justify-between">
            <Badge
              variant={task.billable ? 'default' : 'secondary'}
              className={
                task.billable ? 'bg-secondary text-secondary-foreground' : ''
              }>
              {task.billable ? (
                <>
                  <DollarSign className="w-3 h-3 mr-1" />
                  Billable
                </>
              ) : (
                <>
                  <User className="w-3 h-3 mr-1" />
                  Personal
                </>
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {showEditForm && (
        <TaskForm
          task={task}
          weeklySchedule={weeklySchedule}
          onClose={() => setShowEditForm(false)}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
