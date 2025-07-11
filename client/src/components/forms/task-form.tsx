import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { taskApi, customerApi, targetApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { insertTaskSchema } from '@shared/schema';
import { formatTaskDate, getWeekDates, getDayName } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import type {
  WeeklyScheduleWithRelations,
  TaskWithRelations,
  TargetWithRelations,
  InsertTask,
} from '@shared/schema';
import { z } from 'zod';

const formSchema = insertTaskSchema.extend({
  customerId: z.number().min(1, 'Customer is required'),
  targetId: z.number().optional(),
  date: z.string().min(1, 'Date is required'),
  estimatedHours: z.string().min(1, 'Estimated hours is required'),
  actualHours: z.string().min(0, 'Actual hours is required'),
});

interface TaskFormProps {
  weeklySchedule: WeeklyScheduleWithRelations;
  task?: TaskWithRelations;
  defaultDate?: Date;
  preSelectedTarget?: TargetWithRelations;
  onClose: () => void;
}

export default function TaskForm({
  weeklySchedule,
  task,
  defaultDate,
  preSelectedTarget,
  onClose,
}: TaskFormProps) {
  const { toast } = useToast();
  const isEditing = !!task;

  const { data: customers } = useQuery({
    queryKey: ['/api/customers'],
    queryFn: customerApi.getAll,
  });

  const { data: targets } = useQuery({
    queryKey: ['/api/targets', weeklySchedule.id],
    queryFn: () => targetApi.getBySchedule(weeklySchedule.id),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weeklyScheduleId: weeklySchedule.id,
      customerId: task?.customerId || preSelectedTarget?.customerId || 0,
      targetId: task?.targetId || preSelectedTarget?.id || undefined,
      date: task?.date || (defaultDate ? formatTaskDate(defaultDate) : ''),
      estimatedHours: task?.estimatedHours || '',
      actualHours: task?.actualHours || '0',
      notes: task?.notes || '',
      billable: task?.billable ?? true,
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: taskApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
      onClose();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: Partial<InsertTask>) => taskApi.update(task!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
      onClose();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const taskData: InsertTask = {
      weeklyScheduleId: weeklySchedule.id,
      customerId: data.customerId,
      targetId: data.targetId || null,
      date: data.date,
      estimatedHours: data.estimatedHours,
      actualHours: data.actualHours,
      notes: data.notes,
      billable: data.billable,
    };

    if (isEditing) {
      updateTaskMutation.mutate(taskData);
    } else {
      createTaskMutation.mutate(taskData);
    }
  };

  const isPending =
    createTaskMutation.isPending || updateTaskMutation.isPending;

  // Get week dates for date selection
  const weekDates = getWeekDates(weeklySchedule.year, weeklySchedule.week);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isEditing ? 'Edit Task' : 'Add New Task'}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetId">Target (optional)</Label>
            <Select
              value={form.watch('targetId')?.toString() || 'none'}
              onValueChange={(value) => {
                const targetId = value === 'none' ? undefined : parseInt(value);
                form.setValue('targetId', targetId);

                // Auto-select customer when target is chosen
                if (targetId && targets) {
                  const selectedTarget = targets.find((t) => t.id === targetId);
                  if (selectedTarget) {
                    form.setValue('customerId', selectedTarget.customerId);
                  }
                }
              }}
              disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select target (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No target</SelectItem>
                {targets?.map((target) => (
                  <SelectItem key={target.id} value={target.id.toString()}>
                    {target.customer.name} - {target.goal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerId">Customer</Label>
            <Select
              value={form.watch('customerId')?.toString()}
              onValueChange={(value) =>
                form.setValue('customerId', parseInt(value))
              }
              disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.name} - ${customer.billingRate}/hr
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.customerId && (
              <p className="text-sm text-red-600">
                {form.formState.errors.customerId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Select
              value={form.watch('date')}
              onValueChange={(value) => form.setValue('date', value)}
              disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                {weekDates.map((date, index) => (
                  <SelectItem
                    key={date.toISOString()}
                    value={formatTaskDate(date)}>
                    {getDayName(index)}, {date.toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.date && (
              <p className="text-sm text-red-600">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.25"
                min="0"
                {...form.register('estimatedHours')}
                placeholder="4"
                disabled={isPending}
              />
              {form.formState.errors.estimatedHours && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.estimatedHours.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualHours">Actual Hours</Label>
              <Input
                id="actualHours"
                type="number"
                step="0.25"
                min="0"
                {...form.register('actualHours')}
                placeholder="0"
                disabled={isPending}
              />
              {form.formState.errors.actualHours && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.actualHours.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Task Description</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Describe the task..."
              rows={3}
              disabled={isPending}
            />
            {form.formState.errors.notes && (
              <p className="text-sm text-red-600">
                {form.formState.errors.notes.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="billable"
              checked={form.watch('billable')}
              onCheckedChange={(checked) =>
                form.setValue('billable', !!checked)
              }
              disabled={isPending}
            />
            <Label htmlFor="billable">Billable</Label>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary hover:bg-primary/90">
              {isPending ? 'Saving...' : isEditing ? 'Update Task' : 'Add Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
