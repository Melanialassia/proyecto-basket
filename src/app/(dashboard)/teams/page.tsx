"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/ui/page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useTeamsStore } from "@/store/teams";
import { usePlayersStore } from "@/store/players";
import { teamSchema, type TeamSchemaType } from "@/lib/schemas";
import { getWinPercentage } from "@/lib/utils";
import type { Team } from "@/types";

export default function TeamsPage() {
  const { teams, addTeam, updateTeam, deleteTeam } = useTeamsStore();
  const players = usePlayersStore((s) => s.players);
  const [search, setSearch] = useState("");
  const [conferenceFilter, setConferenceFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);

  const form = useForm<TeamSchemaType>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      abbreviation: "",
      city: "",
      conference: "Este",
      division: "",
      logoColor: "#2563EB",
    },
  });

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(search.toLowerCase()) ||
      team.city.toLowerCase().includes(search.toLowerCase());
    const matchesConference =
      conferenceFilter === "all" || team.conference === conferenceFilter;
    return matchesSearch && matchesConference;
  });

  const openCreate = () => {
    setEditingTeam(null);
    form.reset({
      name: "",
      abbreviation: "",
      city: "",
      conference: "Este",
      division: "",
      logoColor: "#2563EB",
    });
    setDialogOpen(true);
  };

  const openEdit = (team: Team) => {
    setEditingTeam(team);
    form.reset({
      name: team.name,
      abbreviation: team.abbreviation,
      city: team.city,
      conference: team.conference,
      division: team.division,
      logoColor: team.logoColor,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: TeamSchemaType) => {
    if (editingTeam) {
      updateTeam(editingTeam.id, data);
      toast.success("Equipo actualizado exitosamente");
    } else {
      addTeam(data);
      toast.success("Equipo creado exitosamente");
    }
    setDialogOpen(false);
    form.reset();
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteTeam(deleteTarget.id);
      toast.success("Equipo eliminado exitosamente");
      setDeleteTarget(null);
    }
  };

  const getPlayerCount = (teamId: string) =>
    players.filter((p) => p.teamId === teamId).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipos"
        description="Gestiona tus equipos de baloncesto"
        actionLabel="Agregar equipo"
        actionIcon={Plus}
        onAction={openCreate}
      />

      {/* Filtros */}
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar equipos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={conferenceFilter}
            onValueChange={(val) => setConferenceFilter(val ?? "all")}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Todas las conferencias">
                {(
                  {
                    all: "Todas las conferencias",
                    Este: "Este",
                    Oeste: "Oeste",
                  } as Record<string, string>
                )[conferenceFilter] ?? "Todas las conferencias"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las conferencias</SelectItem>
              <SelectItem value="Este">Este</SelectItem>
              <SelectItem value="Oeste">Oeste</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tabla */}
      {filteredTeams.length === 0 ? (
        <EmptyState
          title="No se encontraron equipos"
          description="Comienza creando tu primer equipo."
        >
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar equipo
          </Button>
        </EmptyState>
      ) : (
        <Card className="border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Conferencia</TableHead>
                <TableHead>División</TableHead>
                <TableHead className="text-center">Jugadores</TableHead>
                <TableHead className="text-center">Récord</TableHead>
                <TableHead className="text-center">% Victorias</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.map((team) => (
                <TableRow key={team.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ backgroundColor: team.logoColor }}
                      >
                        {team.abbreviation}
                      </div>
                      <span className="font-medium text-foreground">
                        {team.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {team.city}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {team.conference}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {team.division}
                  </TableCell>
                  <TableCell className="text-center">
                    {getPlayerCount(team.id)}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {team.wins}-{team.losses}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm">
                    {getWinPercentage(team.wins, team.losses)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          render={<Link href={`/teams/${team.id}`} />}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(team)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(team)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Diálogo Crear/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTeam ? "Editar Equipo" : "Crear Equipo"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre del Equipo</Label>
                <Input {...form.register("name")} placeholder="Halcones del Trueno" />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Abreviación</Label>
                <Input
                  {...form.register("abbreviation")}
                  placeholder="HT"
                  maxLength={4}
                />
                {form.formState.errors.abbreviation && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.abbreviation.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input {...form.register("city")} placeholder="Buenos Aires" />
                {form.formState.errors.city && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>División</Label>
                <Input {...form.register("division")} placeholder="Sur" />
                {form.formState.errors.division && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.division.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Conferencia</Label>
                <Select
                  value={form.watch("conference")}
                  onValueChange={(val) =>
                    form.setValue("conference", val as "Este" | "Oeste")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Este">
                      {form.watch("conference") === "Oeste" ? "Oeste" : "Este"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Este">Este</SelectItem>
                    <SelectItem value="Oeste">Oeste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color del Logo</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    {...form.register("logoColor")}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                  />
                  <Input
                    {...form.register("logoColor")}
                    className="flex-1"
                    placeholder="#2563EB"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">{editingTeam ? "Actualizar" : "Crear"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmación de eliminación */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Eliminar Equipo"
        description={`¿Estás seguro de que quieres eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
