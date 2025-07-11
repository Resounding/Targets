import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { weeklyScheduleApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { insertWeeklyScheduleSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import type { InsertWeeklySchedule } from "@shared/schema";
import { z } from "zod";

const formSchema = insertWeeklyScheduleSchema.extend({
  year: z.number().min(2020).max(2030),
  week: z.number().min(1).max(53),
});

interface WeeklyScheduleFormProps {
  currentWeek: { year: number; week: number };
  onClose: () => void;
}

export default function WeeklyScheduleForm({ currentWeek, onClose }: WeeklyScheduleFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: currentWeek.year,
      week: currentWeek.week,
      overallGoal: "",
    },
  });

  const createWeeklyScheduleMutation = useMutation({
    mutationFn: weeklyScheduleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-schedules"] });
      toast({
        title: "Success",
        description: "Weekly schedule created successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create weekly schedule",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const scheduleData: InsertWeeklySchedule = {
      year: data.year,
      week: data.week,
      overallGoal: data.overallGoal,
    };

    createWeeklyScheduleMutation.mutate(scheduleData);
  };

  const isPending = createWeeklyScheduleMutation.isPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Create Weekly Schedule
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                {...form.register("year", { valueAsNumber: true })}
                disabled={isPending}
              />
              {form.formState.errors.year && (
                <p className="text-sm text-red-600">{form.formState.errors.year.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="week">Week</Label>
              <Input
                id="week"
                type="number"
                {...form.register("week", { valueAsNumber: true })}
                disabled={isPending}
              />
              {form.formState.errors.week && (
                <p className="text-sm text-red-600">{form.formState.errors.week.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="overallGoal">Overall Goal</Label>
            <Textarea
              id="overallGoal"
              {...form.register("overallGoal")}
              placeholder="Describe your main objectives for this week..."
              rows={3}
              disabled={isPending}
            />
            {form.formState.errors.overallGoal && (
              <p className="text-sm text-red-600">{form.formState.errors.overallGoal.message}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90">
              {isPending ? "Creating..." : "Create Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
