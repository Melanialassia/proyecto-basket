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
import { usePlayersStore } from "@/store/players";
import { useTeamsStore } from "@/store/teams";
import {
  playerSchema,
  type PlayerSchemaType,
  type PlayerFormInput,
} from "@/lib/schemas";
import type { Player } from "@/types";

export default function PlayersPage() {
  const { players, addPlayer, updatePlayer, deletePlayer } = usePlayersStore();
  const teams = useTeamsStore((s) => s.teams);
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);

  const form = useForm<PlayerFormInput, unknown, PlayerSchemaType>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      teamId: "",
      number: 0,
      position: "PG",
      height: "",
      weight: 180,
      age: 22,
    },
  });

  const filteredPlayers = players.filter((player) => {
    console.log("AA",player)
    const matchesSearch = `${player.firstName} ${player.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesTeam = teamFilter === "all" || player.teamId === teamFilter;
    const matchesPosition =
      positionFilter === "all" || player.position === positionFilter;
    return matchesSearch && matchesTeam && matchesPosition;
  });

  const openCreate = () => {
    setEditingPlayer(null);
    form.reset({
      firstName: "",
      lastName: "",
      teamId: teams[0]?.id ?? "",
      number: 0,
      position: "PG",
      height: "",
      weight: 180,
      age: 22,
    });
    setDialogOpen(true);
  };

  const openEdit = (player: Player) => {
    setEditingPlayer(player);
    form.reset({
      firstName: player.firstName,
      lastName: player.lastName,
      teamId: player.teamId,
      number: player.number,
      position: player.position,
      height: player.height,
      weight: player.weight,
      age: player.age,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: PlayerSchemaType) => {
    if (editingPlayer) {
      updatePlayer(editingPlayer.id, data);
      toast.success("Jugador actualizado exitosamente");
    } else {
      addPlayer(data);
      toast.success("Jugador creado exitosamente");
    }
    setDialogOpen(false);
    form.reset();
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deletePlayer(deleteTarget.id);
      toast.success("Jugador eliminado exitosamente");
      setDeleteTarget(null);
    }
  };

  const getTeamName = (teamId: string) =>
    teams.find((t) => t.id === teamId)?.name ?? "Desconocido";

  const getTeamColor = (teamId: string) =>
    teams.find((t) => t.id === teamId)?.logoColor ?? "#94A3B8";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jugadores"
        description="Gestiona el plantel de jugadores y estadísticas"
        actionLabel="Agregar jugador"
        actionIcon={Plus}
        onAction={openCreate}
      />

      {/* Filtros */}
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Buscar jugador</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar jugadores..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Filtrar por equipo</Label>
            <Select
              value={teamFilter}
              onValueChange={(val) => setTeamFilter(val ?? "all")}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Todos los equipos">
                  {teamFilter === "all"
                    ? "Todos los equipos"
                    : (teams.find((t) => t.id === teamFilter)?.name ?? "Todos los equipos")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los equipos</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Filtrar por posición</Label>
            <Select
              value={positionFilter}
              onValueChange={(val) => setPositionFilter(val ?? "all")}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Todas las posiciones">
                  {(
                    {
                      all: "Todas las posiciones",
                      PG: "Base (PG)",
                      SG: "Escolta (SG)",
                      SF: "Alero (SF)",
                      PF: "Ala-Pívot (PF)",
                      C: "Pívot (C)",
                    } as Record<string, string>
                  )[positionFilter] ?? "Todas las posiciones"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las posiciones</SelectItem>
                <SelectItem value="PG">Base (PG)</SelectItem>
                <SelectItem value="SG">Escolta (SG)</SelectItem>
                <SelectItem value="SF">Alero (SF)</SelectItem>
                <SelectItem value="PF">Ala-Pívot (PF)</SelectItem>
                <SelectItem value="C">Pívot (C)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      {filteredPlayers.length === 0 ? (
        <EmptyState
          title="No se encontraron jugadores"
          description="Comienza agregando tu primer jugador."
        >
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar jugador
          </Button>
        </EmptyState>
      ) : (
        <Card className="border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Jugador</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Pos</TableHead>
                <TableHead className="text-center">PPG</TableHead>
                <TableHead className="text-center">RPG</TableHead>
                <TableHead className="text-center">APG</TableHead>
                <TableHead className="text-center">FG%</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.map((player) => (
                <TableRow key={player.id} className="group">
                  <TableCell className="font-mono text-muted-foreground">
                    {player.number}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: getTeamColor(player.teamId) }}
                      >
                        {player.firstName[0]}
                        {player.lastName[0]}
                      </div>
                      <span className="font-medium text-foreground">
                        {player.firstName} {player.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getTeamName(player.teamId)}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex h-6 w-8 items-center justify-center rounded bg-muted text-xs font-medium">
                      {player.position}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {player.stats.pointsPerGame}
                  </TableCell>
                  <TableCell className="text-center">
                    {player.stats.reboundsPerGame}
                  </TableCell>
                  <TableCell className="text-center">
                    {player.stats.assistsPerGame}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm">
                    {player.stats.fieldGoalPercentage}%
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
                          render={<Link href={`/players/${player.id}`} />}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(player)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(player)}
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
              {editingPlayer ? "Editar Jugador" : "Agregar jugador"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input {...form.register("firstName")} placeholder="Marcos" />
                {form.formState.errors.firstName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input {...form.register("lastName")} placeholder="García" />
                {form.formState.errors.lastName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Equipo</Label>
                <Select
                  value={form.watch("teamId")}
                  onValueChange={(val) => {
                    if (val) form.setValue("teamId", val);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar equipo">
                      {teams.find((t) => t.id === form.watch("teamId"))?.name ?? "Seleccionar equipo"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.teamId && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.teamId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Posición</Label>
                <Select
                  value={form.watch("position")}
                  onValueChange={(val) => {
                    if (val)
                      form.setValue(
                        "position",
                        val as "PG" | "SG" | "SF" | "PF" | "C",
                      );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar posición">
                      {
                        {
                          PG: "Base (PG)",
                          SG: "Escolta (SG)",
                          SF: "Alero (SF)",
                          PF: "Ala-Pívot (PF)",
                          C: "Pívot (C)",
                        }[form.watch("position")]
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PG">Base (PG)</SelectItem>
                    <SelectItem value="SG">Escolta (SG)</SelectItem>
                    <SelectItem value="SF">Alero (SF)</SelectItem>
                    <SelectItem value="PF">Ala-Pívot (PF)</SelectItem>
                    <SelectItem value="C">Pívot (C)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Número</Label>
                <Input
                  {...form.register("number", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  max={99}
                />
                {form.formState.errors.number && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.number.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Altura</Label>
                <Input {...form.register("height")} placeholder={`1.98m`} />
              </div>
              <div className="space-y-2">
                <Label>Edad</Label>
                <Input
                  {...form.register("age", { valueAsNumber: true })}
                  type="number"
                  min={18}
                  max={50}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Peso (kg)</Label>
              <Input
                {...form.register("weight", { valueAsNumber: true })}
                type="number"
                min={100}
              />
              {form.formState.errors.weight && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.weight.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingPlayer ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmación de eliminación */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Eliminar Jugador"
        description={`¿Estás seguro de que quieres eliminar a "${deleteTarget?.firstName} ${deleteTarget?.lastName}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
