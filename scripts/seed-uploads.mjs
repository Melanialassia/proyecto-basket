import PDFDocument from "pdfkit";
import { v2 as cloudinary } from "cloudinary";
import { PassThrough } from "stream";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ── Cloudinary config ────────────────────────────────────────────────────────
const envFile = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env"),
  "utf-8",
);
for (const line of envFile.split("\n")) {
  const [k, ...v] = line.split("=");
  if (k && v.length) process.env[k.trim()] = v.join("=").trim();
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Data ─────────────────────────────────────────────────────────────────────
const teams = [
  { id: "team-1", name: "Halcones del Trueno", city: "Austin", wins: 42, losses: 18, color: "#2563EB" },
  { id: "team-2", name: "Osos de Hierro",      city: "Denver", wins: 38, losses: 22, color: "#10B981" },
  { id: "team-3", name: "Rayos Solares",        city: "Phoenix", wins: 35, losses: 25, color: "#F59E0B" },
  { id: "team-4", name: "Titanes de la Tormenta", city: "Miami", wins: 40, losses: 20, color: "#8B5CF6" },
  { id: "team-5", name: "Lobos de Escarcha",    city: "Chicago", wins: 30, losses: 30, color: "#06B6D4" },
  { id: "team-6", name: "Víboras Nocturnas",    city: "Brooklyn", wins: 28, losses: 32, color: "#EC4899" },
];

const players = [
  { teamId: "team-1", name: "Marcus Johnson",  pos: "SG", num: 23, ppg: 28.4, rpg: 6.1, apg: 5.8, fg: 48.5 },
  { teamId: "team-1", name: "David Chen",       pos: "PG", num:  1, ppg: 18.2, rpg: 3.5, apg: 9.4, fg: 45.8 },
  { teamId: "team-1", name: "Jamal Williams",   pos: "PF", num: 34, ppg: 16.7, rpg: 9.8, apg: 2.3, fg: 52.1 },
  { teamId: "team-2", name: "Tyler Anderson",   pos: "SF", num: 11, ppg: 21.3, rpg: 5.4, apg: 3.7, fg: 46.9 },
  { teamId: "team-2", name: "Andre Mitchell",   pos: "C",  num:  5, ppg: 14.8, rpg: 11.2, apg: 1.5, fg: 58.4 },
  { teamId: "team-3", name: "Kevin Brooks",     pos: "PG", num:  7, ppg: 22.1, rpg: 4.2, apg: 8.1, fg: 44.2 },
  { teamId: "team-3", name: "DeShawn Harris",   pos: "SG", num: 22, ppg: 19.5, rpg: 3.8, apg: 4.2, fg: 47.3 },
  { teamId: "team-4", name: "Chris Rodriguez",  pos: "SF", num:  0, ppg: 25.6, rpg: 7.3, apg: 4.5, fg: 49.8 },
  { teamId: "team-4", name: "Terrence White",   pos: "PG", num: 15, ppg: 16.4, rpg: 3.2, apg: 10.1, fg: 43.5 },
  { teamId: "team-5", name: "Brandon Lee",      pos: "PF", num: 33, ppg: 15.2, rpg: 8.9, apg: 2.8, fg: 51.3 },
  { teamId: "team-5", name: "Isaiah Taylor",    pos: "SG", num:  3, ppg: 20.8, rpg: 4.5, apg: 3.9, fg: 46.1 },
  { teamId: "team-6", name: "Ryan Garcia",      pos: "C",  num: 10, ppg: 13.5, rpg: 10.4, apg: 1.8, fg: 55.2 },
];

// Plays per quarter (generic basketball jugadas)
const playsTemplates = [
  (p, q) => `Q${q} 10:45 — #${p.num} ${p.name} anota bandeja por el lado derecho (+2)`,
  (p, q) => `Q${q}  9:30 — #${p.num} ${p.name} triples desde la esquina izquierda (+3)`,
  (p, q) => `Q${q}  8:12 — #${p.num} ${p.name} asistencia a corte al aro`,
  (p, q) => `Q${q}  7:00 — #${p.num} ${p.name} rebote ofensivo y putback (+2)`,
  (p, q) => `Q${q}  5:45 — #${p.num} ${p.name} tiro en suspensión desde la media distancia (+2)`,
  (p, q) => `Q${q}  4:20 — #${p.num} ${p.name} robo de balón, contraataque rápido (+2)`,
  (p, q) => `Q${q}  3:05 — #${p.num} ${p.name} +1 línea de tiros libres (2/2)`,
  (p, q) => `Q${q}  1:50 — #${p.num} ${p.name} bloqueo, inicia transición ofensiva`,
];

function generatePlays(teamPlayers, total = 20) {
  const lines = [];
  for (let i = 0; i < total; i++) {
    const player = teamPlayers[i % teamPlayers.length];
    const quarter = Math.min(4, Math.floor(i / 5) + 1);
    const tpl = playsTemplates[i % playsTemplates.length];
    lines.push(tpl(player, quarter));
  }
  return lines;
}

// ── PDF builder ───────────────────────────────────────────────────────────────
function buildPDF(team, teamPlayers) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers = [];
    doc.on("data", (b) => buffers.push(b));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const W = doc.page.width - 100; // usable width

    // ── Header ────────────────────────────────────────────────────────────────
    doc.rect(50, 50, W, 60).fill("#1E293B");
    doc.fillColor("#FFFFFF").fontSize(20).font("Helvetica-Bold")
      .text(team.name, 60, 63, { width: W - 20 });
    doc.fontSize(11).font("Helvetica")
      .text(`${team.city}  ·  Temporada 2024-2025  ·  Record: ${team.wins}W – ${team.losses}L`, 60, 90, { width: W - 20 });

    doc.moveDown(3);

    // ── Section: Estadísticas de Jugadores ───────────────────────────────────
    doc.fillColor("#1E293B").fontSize(13).font("Helvetica-Bold")
      .text("ESTADÍSTICAS DE JUGADORES", 50, doc.y);
    doc.moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    const cols = { num: 50, name: 80, pos: 240, ppg: 275, rpg: 320, apg: 365, fg: 410 };

    doc.rect(50, tableTop, W, 20).fill("#334155");
    doc.fillColor("#FFFFFF").fontSize(9).font("Helvetica-Bold");
    doc.text("#",       cols.num,  tableTop + 6);
    doc.text("Jugador", cols.name, tableTop + 6);
    doc.text("Pos",     cols.pos,  tableTop + 6);
    doc.text("PPG",     cols.ppg,  tableTop + 6);
    doc.text("RPG",     cols.rpg,  tableTop + 6);
    doc.text("APG",     cols.apg,  tableTop + 6);
    doc.text("FG%",     cols.fg,   tableTop + 6);

    let rowY = tableTop + 22;
    teamPlayers.forEach((p, i) => {
      const bg = i % 2 === 0 ? "#F8FAFC" : "#FFFFFF";
      doc.rect(50, rowY, W, 18).fill(bg);
      doc.fillColor("#1E293B").fontSize(9).font("Helvetica");
      doc.text(String(p.num),  cols.num,  rowY + 5);
      doc.text(p.name,         cols.name, rowY + 5);
      doc.text(p.pos,          cols.pos,  rowY + 5);
      doc.text(String(p.ppg),  cols.ppg,  rowY + 5);
      doc.text(String(p.rpg),  cols.rpg,  rowY + 5);
      doc.text(String(p.apg),  cols.apg,  rowY + 5);
      doc.text(`${p.fg}%`,     cols.fg,   rowY + 5);
      rowY += 18;
    });

    doc.y = rowY + 16;

    // ── Section: Jugadas del Partido ─────────────────────────────────────────
    doc.fillColor("#1E293B").fontSize(13).font("Helvetica-Bold")
      .text("JUGADAS DEL PARTIDO — PARTIDO #1 (LOCAL)", 50, doc.y);
    doc.moveDown(0.5);

    const plays = generatePlays(teamPlayers, 24);
    plays.forEach((line, i) => {
      const bg = i % 2 === 0 ? "#F8FAFC" : "#FFFFFF";
      doc.rect(50, doc.y, W, 16).fill(bg);
      doc.fillColor("#374151").fontSize(8.5).font("Helvetica").text(line, 55, doc.y + 4, { width: W - 10 });
      doc.moveDown(0.15);
    });

    doc.moveDown(1);

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.rect(50, doc.y, W, 1).fill("#CBD5E1");
    doc.moveDown(0.5);
    doc.fillColor("#94A3B8").fontSize(8).font("Helvetica")
      .text(`Generado por CourtVision · ${new Date().toLocaleDateString("es-ES")}`, 50, doc.y, { align: "center", width: W });

    doc.end();
  });
}

// ── Upload to Cloudinary ──────────────────────────────────────────────────────
function uploadBuffer(buffer, publicId, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", folder, public_id: publicId },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
const results = [];

for (const team of teams) {
  const teamPlayers = players.filter((p) => p.teamId === team.id);
  console.log(`Generando PDF para ${team.name}...`);
  const pdfBuffer = await buildPDF(team, teamPlayers);

  const slug = team.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const publicId = `estadisticas_${slug}_2024-25`;

  console.log(`  Subiendo a Cloudinary...`);
  const { url } = await uploadBuffer(pdfBuffer, publicId, `basket/${team.id}`);
  console.log(`  ✓ ${url}`);

  results.push({
    id: `upload-${team.id}`,
    teamId: team.id,
    fileName: `${publicId}.pdf`,
    fileSize: pdfBuffer.length,
    status: "éxito",
    progress: 100,
    cloudinaryUrl: url,
    uploadedAt: new Date().toISOString(),
  });
}

console.log("\n✅ Todos los PDFs subidos. Copia en mock/data.ts:\n");
console.log(JSON.stringify(results, null, 2));
