"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Eye,
  Trash2,
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
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useGamesStore } from "@/store/games";
import { useTeamsStore } from "@/store/teams";
import { useSeasonsStore } from "@/store/seasons";
import {
  gameSchema,
  type GameSchemaType,
  type GameFormInput,
} from "@/lib/schemas";
import { formatDate } from "@/lib/utils";
import type { Game } from "@/types";

export default function GamesPage() {
  const { games, addGame, updateGame, deleteGame } = useGamesStore();
  const teams = useTeamsStore((s) => s.teams);
  const seasons = useSeasonsStore((s) => s.seasons);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Game | null>(null);

  const form = useForm<GameFormInput, unknown, GameSchemaType>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      seasonId: seasons[0]?.id ?? "",
      homeTeamId: "",
      awayTeamId: "",
      homeScore: 0,
      awayScore: 0,
      date: "",
      venue: "",
    },
  });

  const filteredGames = games.filter((game) => {
    const homeTeam = teams.find((t) => t.id === game.homeTeamId);
    const awayTeam = teams.find((t) => t.id === game.awayTeamId);
    const matchesSearch =
      (homeTeam?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (awayTeam?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      game.venue.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || game.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedGames = [...filteredGames].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const openCreate = () => {
    setEditingGame(null);
    form.reset({
      seasonId: seasons[0]?.id ?? "",
      homeTeamId: teams[0]?.id ?? "",
      awayTeamId: teams[1]?.id ?? "",
      homeScore: 0,
      awayScore: 0,
      date: "",
      venue: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (game: Game) => {
    setEditingGame(game);
    form.reset({
      seasonId: game.seasonId,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
      date: game.date,
      venue: game.venue,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: GameSchemaType) => {
    if (editingGame) {
      const status =
        data.homeScore > 0 || data.awayScore > 0
          ? "completado"
          : editingGame.status;
      updateGame(editingGame.id, { ...data, status });
      toast.success("Partido actualizado");
    } else {
      addGame(data);
      toast.success("Partido creado");
    }
    setDialogOpen(false);
    form.reset();
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteGame(deleteTarget.id);
      toast.success("Partido eliminado");
      setDeleteTarget(null);
    }
  };

  const getTeamName = (teamId: string) =>
    teams.find((t) => t.id === teamId)?.name ?? "Desconocido";
  const getTeamAbbr = (teamId: string) =>
    teams.find((t) => t.id === teamId)?.abbreviation ?? "???";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partidos"
        description="Programa y registra partidos de baloncesto"
        actionLabel="Agregar Partido"
        actionIcon={Plus}
        onAction={openCreate}
      />

      {/* Filters */}
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar partidos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val ?? "all")}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Todos">
                {(
                  {
                    all: "Todos",
                    programado: "Programado",
                    en_progreso: "En Progreso",
                    completado: "Completado",
                  } as Record<string, string>
                )[statusFilter] ?? "Todos"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="programado">Programado</SelectItem>
              <SelectItem value="en_progreso">En Progreso</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      {sortedGames.length === 0 ? (
        <EmptyState
          title="No se encontraron partidos"
          description="Crea tu primer partido."
        >
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Partido
          </Button>
        </EmptyState>
      ) : (
        <Card className="border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Local</TableHead>
                <TableHead className="text-center">Marcador</TableHead>
                <TableHead>Visitante</TableHead>
                <TableHead>Sede</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedGames.map((game) => (
                <TableRow key={game.id} className="group">
                  <TableCell className="text-muted-foreground">
                    {formatDate(game.date)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {getTeamName(game.homeTeamId)}
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold">
                    {game.status === "completado"
                      ? `${game.homeScore} - ${game.awayScore}`
                      : "— : —"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {getTeamName(game.awayTeamId)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {game.venue}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={game.status} />
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
                          render={<Link href={`/games/${game.id}`} />}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(game)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(game)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingGame ? "Editar Partido" : "Programar Partido"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Temporada</Label>
              <Select
                value={form.watch("seasonId")}
                onValueChange={(val) => {
                  if (val) form.setValue("seasonId", val);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar temporada">
                    {seasons.find((s) => s.id === form.watch("seasonId"))?.name ?? "Seleccionar temporada"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="end" side="bottom">
                  {seasons.map((season) => (
                    <SelectItem key={season.id} value={season.id}>
                      {season.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Equipo Local</Label>
                <Select
                  value={form.watch("homeTeamId")}
                  onValueChange={(val) => {
                    if (val) form.setValue("homeTeamId", val);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar equipo">
                      {teams.find((t) => t.id === form.watch("homeTeamId"))?.name ?? "Seleccionar equipo"}
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
              </div>
              <div className="space-y-2">
                <Label>Equipo Visitante</Label>
                <Select
                  value={form.watch("awayTeamId")}
                  onValueChange={(val) => {
                    if (val) form.setValue("awayTeamId", val);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar equipo">
                      {teams.find((t) => t.id === form.watch("awayTeamId"))?.name ?? "Seleccionar equipo"}
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
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Puntos Local</Label>
                <Input
                  {...form.register("homeScore", { valueAsNumber: true })}
                  type="number"
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Puntos Visitante</Label>
                <Input
                  {...form.register("awayScore", { valueAsNumber: true })}
                  type="number"
                  min={0}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input {...form.register("date")} type="date" />
                {form.formState.errors.date && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.date.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Sede</Label>
                <Input
                  {...form.register("venue")}
                  placeholder="Thunder Arena"
                />
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
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Eliminar Partido"
        description="¿Estás seguro de que quieres eliminar este partido? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
      />
    </div>
  );
}
