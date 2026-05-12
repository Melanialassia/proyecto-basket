import { z } from "zod";

export const teamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  abbreviation: z
    .string()
    .min(2, "Abbreviation must be 2-4 characters")
    .max(4, "Abbreviation must be 2-4 characters")
    .toUpperCase(),
  city: z.string().min(2, "City is required"),
  conference: z.enum(["Este", "Oeste"], {
    message: "Select a conference",
  }),
  division: z.string().min(2, "Division is required"),
  logoColor: z.string().min(4, "Select a color"),
});

export const playerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  teamId: z.string().min(1, "Select a team"),
  number: z.coerce
    .number()
    .int()
    .min(0, "Number must be 0-99")
    .max(99, "Number must be 0-99"),
  position: z.enum(["PG", "SG", "SF", "PF", "C"], {
    message: "Select a position",
  }),
  height: z.string().min(2, "Height is required"),
  weight: z.coerce.number().min(100, "Weight must be at least 100 lbs"),
  age: z.coerce.number().int().min(18, "Age must be 18+").max(50, "Age must be under 50"),
});

export const seasonSchema = z.object({
  name: z.string().min(3, "Season name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isActive: z.boolean(),
});

export const gameSchema = z.object({
  seasonId: z.string().min(1, "Select a season"),
  homeTeamId: z.string().min(1, "Select home team"),
  awayTeamId: z.string().min(1, "Select away team"),
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),
  date: z.string().min(1, "Game date is required"),
  venue: z.string().min(2, "Venue is required"),
});

export type TeamSchemaType = z.infer<typeof teamSchema>;
export type PlayerSchemaType = z.infer<typeof playerSchema>;
export type SeasonSchemaType = z.infer<typeof seasonSchema>;
export type GameSchemaType = z.infer<typeof gameSchema>;

// Input types for React Hook Form (handles z.coerce input being unknown)
export type GameFormInput = z.input<typeof gameSchema>;
export type PlayerFormInput = z.input<typeof playerSchema>;
