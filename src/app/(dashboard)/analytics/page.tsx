"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, Users, Trophy } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KPICard } from "@/components/ui/kpi-card";
import { PageHeader } from "@/components/ui/page-header";
import { useTeamsStore } from "@/store/teams";
import { usePlayersStore } from "@/store/players";
import { useGamesStore } from "@/store/games";
import { getWinPercentage } from "@/lib/utils";

const CHART_COLORS = [
  "#2563EB",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
];

const tooltipStyle = {
  contentStyle: {
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    fontSize: "12px",
  },
};

export default function EstadísticasPage() {
  const teams = useTeamsStore((s) => s.teams);
  const players = usePlayersStore((s) => s.players);
  const games = useGamesStore((s) => s.games);
  const [selectedTeam, setSelectedTeam] = useState<string>("all");

  const completedGames = games.filter((g) => g.status === "completado");

  const filteredPlayers =
    selectedTeam === "all"
      ? players
      : players.filter((p) => p.teamId === selectedTeam);

  // KPIs
  const avgPPG =
    filteredPlayers.length > 0
      ? (
          filteredPlayers.reduce((sum, p) => sum + p.stats.pointsPerGame, 0) /
          filteredPlayers.length
        ).toFixed(1)
      : "0";

  const avgRPG =
    filteredPlayers.length > 0
      ? (
          filteredPlayers.reduce((sum, p) => sum + p.stats.reboundsPerGame, 0) /
          filteredPlayers.length
        ).toFixed(1)
      : "0";

  const avgAPG =
    filteredPlayers.length > 0
      ? (
          filteredPlayers.reduce((sum, p) => sum + p.stats.assistsPerGame, 0) /
          filteredPlayers.length
        ).toFixed(1)
      : "0";

  const avgFG =
    filteredPlayers.length > 0
      ? (
          filteredPlayers.reduce(
            (sum, p) => sum + p.stats.fieldGoalPercentage,
            0,
          ) / filteredPlayers.length
        ).toFixed(1)
      : "0";

  // Team comparison data for bar chart
  const teamComparisonData = teams.map((team) => {
    const teamPlayers = players.filter((p) => p.teamId === team.id);
    const avgPts =
      teamPlayers.length > 0
        ? teamPlayers.reduce((sum, p) => sum + p.stats.pointsPerGame, 0) /
          teamPlayers.length
        : 0;
    const avgReb =
      teamPlayers.length > 0
        ? teamPlayers.reduce((sum, p) => sum + p.stats.reboundsPerGame, 0) /
          teamPlayers.length
        : 0;
    const avgAst =
      teamPlayers.length > 0
        ? teamPlayers.reduce((sum, p) => sum + p.stats.assistsPerGame, 0) /
          teamPlayers.length
        : 0;
    return {
      name: team.abbreviation,
      PPG: Number(avgPts.toFixed(1)),
      RPG: Number(avgReb.toFixed(1)),
      APG: Number(avgAst.toFixed(1)),
    };
  });

  // Scoring trend data (simulated monthly data)
  const scoringTrends = [
    { month: "Oct", PPG: 18.2, RPG: 6.1, APG: 4.5 },
    { month: "Nov", PPG: 19.5, RPG: 6.4, APG: 4.8 },
    { month: "Dec", PPG: 20.1, RPG: 6.8, APG: 5.1 },
    { month: "Jan", PPG: 21.3, RPG: 7.0, APG: 5.3 },
    { month: "Feb", PPG: 20.8, RPG: 7.2, APG: 5.6 },
    { month: "Mar", PPG: 22.1, RPG: 7.5, APG: 5.9 },
  ];

  // Position distribution for pie chart
  const positionCounts = filteredPlayers.reduce(
    (acc, player) => {
      acc[player.position] = (acc[player.position] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const positionData = Object.entries(positionCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Top scorers
  const topScorers = [...filteredPlayers]
    .sort((a, b) => b.stats.pointsPerGame - a.stats.pointsPerGame)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Estadísticas"
          description="Análisis del rendimiento del equipo y de los jugadores"
        />
        <Select
          value={selectedTeam}
          onValueChange={(val) => setSelectedTeam(val ?? "all")}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Todos">
              {selectedTeam === "all"
                ? "Todos"
                : (teams.find((t) => t.id === selectedTeam)?.name ?? "Todos")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Puntos promedio por partido"
          value={avgPPG}
          change={5.2}
          changeLabel="vs el mes pasado"
          icon={TrendingUp}
        />
        <KPICard
          title="Promedio de rebotes por partido"
          value={avgRPG}
          change={3.1}
          changeLabel="vs el mes pasado"
          icon={BarChart3}
        />
        <KPICard
          title="Asistencias promedio por partido"
          value={avgAPG}
          change={2.8}
          changeLabel="vs el mes pasado"
          icon={Users}
        />
        <KPICard
          title="Promedio FG%
"
          value={`${avgFG}%`}
          change={1.5}
          changeLabel="vs el mes pasado"
          icon={Trophy}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scoring Trends */}
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Tendencias de Puntuación</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scoringTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="PPG"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="RPG"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="APG"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Comparison */}
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Comparación de Equipos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Bar dataKey="PPG" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="RPG" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="APG" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Position Distribution + Top Scorers */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pie Chart */}
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Distribución por Posición</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={positionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {positionData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Scorers Table */}
        <Card className="border border-border bg-card shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Máximos Anotadores</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="players">
              <TabsList>
                <TabsTrigger value="players">Jugadores</TabsTrigger>
                <TabsTrigger value="teams">Equipos</TabsTrigger>
              </TabsList>

              <TabsContent value="players">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30px]">#</TableHead>
                      <TableHead>Jugador</TableHead>
                      <TableHead className="text-center">PPG</TableHead>
                      <TableHead className="text-center">RPG</TableHead>
                      <TableHead className="text-center">APG</TableHead>
                      <TableHead className="text-center">FG%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topScorers.map((player, i) => {
                      const team = teams.find((t) => t.id === player.teamId);
                      return (
                        <TableRow key={player.id}>
                          <TableCell className="text-muted-foreground">
                            {i + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="flex h-6 w-6 items-center justify-center rounded text-[8px] font-bold text-white"
                                style={{
                                  backgroundColor: team?.logoColor ?? "#94A3B8",
                                }}
                              >
                                {team?.abbreviation}
                              </div>
                              <span className="font-medium">
                                {player.firstName} {player.lastName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-semibold">
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
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="teams">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipo</TableHead>
                      <TableHead className="text-center">V</TableHead>
                      <TableHead className="text-center">D</TableHead>
                      <TableHead className="text-center">% Vic</TableHead>
                      <TableHead className="text-center">Jugadores</TableHead>
                      <TableHead className="text-center">Prom PPG</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...teams]
                      .sort(
                        (a, b) =>
                          b.wins / (b.wins + b.losses || 1) -
                          a.wins / (a.wins + a.losses || 1),
                      )
                      .map((team) => {
                        const teamPlayers = players.filter(
                          (p) => p.teamId === team.id,
                        );
                        const avgPts =
                          teamPlayers.length > 0
                            ? (
                                teamPlayers.reduce(
                                  (sum, p) => sum + p.stats.pointsPerGame,
                                  0,
                                ) / teamPlayers.length
                              ).toFixed(1)
                            : "0.0";
                        return (
                          <TableRow key={team.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div
                                  className="flex h-7 w-7 items-center justify-center rounded text-[9px] font-bold text-white"
                                  style={{
                                    backgroundColor: team.logoColor,
                                  }}
                                >
                                  {team.abbreviation}
                                </div>
                                <span className="font-medium">{team.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium text-emerald-600">
                              {team.wins}
                            </TableCell>
                            <TableCell className="text-center font-medium text-red-500">
                              {team.losses}
                            </TableCell>
                            <TableCell className="text-center font-mono">
                              {getWinPercentage(team.wins, team.losses)}
                            </TableCell>
                            <TableCell className="text-center">
                              {teamPlayers.length}
                            </TableCell>
                            <TableCell className="text-center font-semibold">
                              {avgPts}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
