// Regenera la tabla de proyectos del README con los repositorios públicos del usuario.
// Sin dependencias. Uso: node scripts/update-projects.mjs  (GITHUB_TOKEN opcional, sube el límite de la API)
import { readFile, writeFile } from "node:fs/promises";

const USER = "Dreex14";
const EXCLUDE = new Set(["dreex14", "profiles-links"]); // repos que no se listan (minúsculas)
const START = "<!-- PROJECTS:START -->";
const END = "<!-- PROJECTS:END -->";

const headers = { Accept: "application/vnd.github+json", "User-Agent": "profile-readme-updater" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const res = await fetch(`https://api.github.com/users/${USER}/repos?type=owner&sort=pushed&per_page=100`, { headers });
if (!res.ok) throw new Error(`GitHub API ${res.status}`);
const repos = (await res.json()).filter((r) => !r.fork && !r.archived && !r.private && !EXCLUDE.has(r.name.toLowerCase()));
if (!repos.length) throw new Error("No hay repositorios que mostrar: no toco el README.");

const cell = (t) => (t || "—").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
const rows = repos.map((r) => `| **[${r.name}](${r.html_url})** | ${cell(r.description)} |`);
const table = ["| Proyecto | Qué hace |", "|:---|:---|", ...rows].join("\n");

const readme = await readFile("README.md", "utf8");
const a = readme.indexOf(START), b = readme.indexOf(END);
if (a < 0 || b < a) throw new Error("Faltan los marcadores PROJECTS:START / PROJECTS:END en README.md");
const next = `${readme.slice(0, a + START.length)}\n${table}\n${readme.slice(b)}`;
if (next === readme) console.log("Sin cambios.");
else { await writeFile("README.md", next); console.log(`Tabla actualizada (${repos.length} proyectos).`); }
