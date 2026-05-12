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
import { playerSchema, type PlayerSchemaType, type PlayerFormInput } from "@/lib/schemas";
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
    const matchesSearch =
      `${player.firstName} ${player.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesTeam =
      teamFilter === "all" || player.teamId === teamFilter;
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
      toast.success("Player deleted successfully");
      setDeleteTarget(null);
    }
  };

  const getTeamName = (teamId: string) =>
    teams.find((t) => t.id === teamId)?.name ?? "Unknown";

  const getTeamColor = (teamId: string) =>
    teams.find((t) => t.id === teamId)?.logoColor ?? "#94A3B8";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Players"
        description="Manage player roster and statistics"
        actionLabel="Add Player"
        actionIcon={Plus}
        onAction={openCreate}
      />

      {/* Filters */}
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar jugadores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={teamFilter} onValueChange={(val) => setTeamFilter(val ?? "all")}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={positionFilter} onValueChange={(val) => setPositionFilter(val ?? "all")}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              <SelectItem value="PG">PG</SelectItem>
              <SelectItem value="SG">SG</SelectItem>
              <SelectItem value="SF">SF</SelectItem>
              <SelectItem value="PF">PF</SelectItem>
              <SelectItem value="C">C</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      {filteredPlayers.length === 0 ? (
        <EmptyState
          title="No players found"
          description="Get started by adding your first player."
        >
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Player
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
                        <DropdownMenuItem render={<Link href={`/players/${player.id}`} />}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(player)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(player)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingPlayer ? "Edit Player" : "Add Player"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input {...form.register("firstName")} placeholder="Marcus" />
                {form.formState.errors.firstName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input {...form.register("lastName")} placeholder="Johnson" />
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
                  onValueChange={(val) => { if (val) form.setValue("teamId", val); }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
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
                    if (val) form.setValue(
                      "position",
                      val as "PG" | "SG" | "SF" | "PF" | "C"
                    )
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PG">Point Guard (PG)</SelectItem>
                    <SelectItem value="SG">Shooting Guard (SG)</SelectItem>
                    <SelectItem value="SF">Small Forward (SF)</SelectItem>
                    <SelectItem value="PF">Power Forward (PF)</SelectItem>
                    <SelectItem value="C">Center (C)</SelectItem>
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
                <Input
                  {...form.register("height")}
                  placeholder={`6'5"`}
                />
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
              <Label>Weight (lbs)</Label>
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
                Cancel
              </Button>
              <Button type="submit">
                {editingPlayer ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Player"
        description={`Are you sure you want to delete "${deleteTarget?.firstName} ${deleteTarget?.lastName}"? This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
