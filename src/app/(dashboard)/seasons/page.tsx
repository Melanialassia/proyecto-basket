"use client";

import { useState } from "react";
import { Plus, Calendar, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useSeasonsStore } from "@/store/seasons";
import { useGamesStore } from "@/store/games";
import { seasonSchema, type SeasonSchemaType } from "@/lib/schemas";
import { formatDate } from "@/lib/utils";
import type { Season } from "@/types";

export default function SeasonsPage() {
  const { seasons, addSeason, updateSeason } = useSeasonsStore();
  const games = useGamesStore((s) => s.games);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);

  const form = useForm<SeasonSchemaType>({
    resolver: zodResolver(seasonSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      isActive: false,
    },
  });

  const openCreate = () => {
    setEditingSeason(null);
    form.reset({ name: "", startDate: "", endDate: "", isActive: false });
    setDialogOpen(true);
  };

  const openEdit = (season: Season) => {
    setEditingSeason(season);
    form.reset({
      name: season.name,
      startDate: season.startDate,
      endDate: season.endDate,
      isActive: season.isActive,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: SeasonSchemaType) => {
    if (editingSeason) {
      updateSeason(editingSeason.id, data);
      toast.success("Season updated");
    } else {
      addSeason(data);
      toast.success("Season created");
    }
    setDialogOpen(false);
    form.reset();
  };

  const getGameCount = (seasonId: string) =>
    games.filter((g) => g.seasonId === seasonId).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seasons"
        description="Manage basketball seasons"
        actionLabel="Add Season"
        actionIcon={Plus}
        onAction={openCreate}
      />

      {seasons.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No seasons"
          description="Create your first season to start tracking games."
        >
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Season
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {seasons.map((season) => (
            <Card
              key={season.id}
              className="group border border-border bg-card shadow-sm transition-all hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={season.isActive ? "active" : "completado"}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={() => openEdit(season)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <h3 className="mb-1 text-base font-semibold text-foreground">
                  {season.name}
                </h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  {formatDate(season.startDate)} — {formatDate(season.endDate)}
                </p>
                <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Partidos</p>
                    <p className="text-sm font-semibold">
                      {getGameCount(season.id)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              {editingSeason ? "Edit Season" : "Crear Temporada"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Season Name</Label>
              <Input
                {...form.register("name")}
                placeholder="2024-2025 Regular Season"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input {...form.register("startDate")} type="date" />
                {form.formState.errors.startDate && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input {...form.register("endDate")} type="date" />
                {form.formState.errors.endDate && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.endDate.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                {...form.register("isActive")}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="isActive" className="text-sm font-normal">
                Active season
              </Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingSeason ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
