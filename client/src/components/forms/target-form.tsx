import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { targetApi, customerApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { insertTargetSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import type { WeeklyScheduleWithRelations, Target, InsertTarget } from "@shared/schema";
import { z } from "zod";

const formSchema = insertTargetSchema.extend({
  customerId: z.number().min(1, "Customer is required"),
  targetHours: z.string().min(1, "Target hours is required"),
});

interface TargetFormProps {
  weeklySchedule: WeeklyScheduleWithRelations;
  target?: Target;
  onClose: () => void;
}

export default function TargetForm({ weeklySchedule, target, onClose }: TargetFormProps) {
  const { toast } = useToast();
  const isEditing = !!target;

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: customerApi.getAll,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weeklyScheduleId: weeklySchedule.id,
      customerId: target?.customerId || 0,
      targetHours: target?.targetHours || "",
      goal: target?.goal || "",
    },
  });

  const createTargetMutation = useMutation({
    mutationFn: targetApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/targets"] });
      toast({
        title: "Success",
        description: "Target created successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create target",
        variant: "destructive",
      });
    },
  });

  const updateTargetMutation = useMutation({
    mutationFn: (data: Partial<InsertTarget>) => targetApi.update(target!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/targets"] });
      toast({
        title: "Success",
        description: "Target updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update target",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const targetData: InsertTarget = {
      weeklyScheduleId: weeklySchedule.id,
      customerId: data.customerId,
      targetHours: data.targetHours,
      goal: data.goal,
    };

    if (isEditing) {
      updateTargetMutation.mutate(targetData);
    } else {
      createTargetMutation.mutate(targetData);
    }
  };

  const isPending = createTargetMutation.isPending || updateTargetMutation.isPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isEditing ? "Edit Target" : "Add New Target"}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer</Label>
            <Select
              value={form.watch("customerId")?.toString()}
              onValueChange={(value) => form.setValue("customerId", parseInt(value))}
              disabled={isPending}
            >
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
              <p className="text-sm text-red-600">{form.formState.errors.customerId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetHours">Target Hours</Label>
            <Input
              id="targetHours"
              type="number"
              step="0.5"
              min="0"
              {...form.register("targetHours")}
              placeholder="20"
              disabled={isPending}
            />
            {form.formState.errors.targetHours && (
              <p className="text-sm text-red-600">{form.formState.errors.targetHours.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Goal</Label>
            <Textarea
              id="goal"
              {...form.register("goal")}
              placeholder="Describe what you want to accomplish..."
              rows={3}
              disabled={isPending}
            />
            {form.formState.errors.goal && (
              <p className="text-sm text-red-600">{form.formState.errors.goal.message}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90">
              {isPending ? "Saving..." : isEditing ? "Update Target" : "Add Target"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
