import fs from 'fs';
import path from 'path';
import type {
  User, Tageswort, Wochenthema, These, ForschungsBeitrag,
  Gebet, Video, Aktion, SpendenRecord
} from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');

function readJson<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T[];
}

function writeJson<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Users
export function getUsers(): User[] {
  return readJson<User>('users.json');
}
export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}
export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email === email);
}
export function saveUser(user: User): void {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  writeJson('users.json', users);
}

// Tageswort
export function getTageswortList(): Tageswort[] {
  return readJson<Tageswort>('tageswort.json');
}
export function getTodayTageswort(): Tageswort | undefined {
  const today = new Date().toISOString().split('T')[0];
  const list = getTageswortList();
  return list.find(t => t.date === today && t.published) || list.filter(t => t.published).at(-1);
}
export function getTageswortById(id: string): Tageswort | undefined {
  return getTageswortList().find(t => t.id === id);
}
export function saveTageswort(entry: Tageswort): void {
  const list = getTageswortList();
  const idx = list.findIndex(t => t.id === entry.id);
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  writeJson('tageswort.json', list);
}

// Wochenthema
export function getWochenthemaList(): Wochenthema[] {
  return readJson<Wochenthema>('wochenthema.json');
}
export function getCurrentWochenthema(): Wochenthema | undefined {
  const published = getWochenthemaList().filter(w => w.status === 'published');
  return published.at(-1);
}
export function getWochenthemaById(id: string): Wochenthema | undefined {
  return getWochenthemaList().find(w => w.id === id);
}
export function saveWochenthema(entry: Wochenthema): void {
  const list = getWochenthemaList();
  const idx = list.findIndex(w => w.id === entry.id);
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  writeJson('wochenthema.json', list);
}

// Thesen
export function getThesen(): These[] {
  return readJson<These>('thesen.json');
}
export function getApprovedThesen(): These[] {
  return getThesen().filter(t => t.status === 'approved');
}
export function getTheseById(id: string): These | undefined {
  return getThesen().find(t => t.id === id);
}
export function saveThese(these: These): void {
  const list = getThesen();
  const idx = list.findIndex(t => t.id === these.id);
  if (idx >= 0) list[idx] = these;
  else list.push(these);
  writeJson('thesen.json', list);
}

// Forschung
export function getForschung(): ForschungsBeitrag[] {
  return readJson<ForschungsBeitrag>('forschung.json');
}
export function getApprovedForschung(): ForschungsBeitrag[] {
  return getForschung().filter(f => f.status === 'approved');
}
export function saveForschung(beitrag: ForschungsBeitrag): void {
  const list = getForschung();
  const idx = list.findIndex(f => f.id === beitrag.id);
  if (idx >= 0) list[idx] = beitrag;
  else list.push(beitrag);
  writeJson('forschung.json', list);
}

// Gebete
export function getGebete(): Gebet[] {
  return readJson<Gebet>('gebete.json');
}
export function getApprovedGebete(): Gebet[] {
  return getGebete().filter(g => g.status === 'approved');
}
export function saveGebet(gebet: Gebet): void {
  const list = getGebete();
  const idx = list.findIndex(g => g.id === gebet.id);
  if (idx >= 0) list[idx] = gebet;
  else list.push(gebet);
  writeJson('gebete.json', list);
}

// Videos
export function getVideos(): Video[] {
  return readJson<Video>('videos.json');
}
export function getApprovedVideos(): Video[] {
  return getVideos().filter(v => v.status === 'approved');
}
export function saveVideo(video: Video): void {
  const list = getVideos();
  const idx = list.findIndex(v => v.id === video.id);
  if (idx >= 0) list[idx] = video;
  else list.push(video);
  writeJson('videos.json', list);
}

// Aktionen
export function getAktionen(): Aktion[] {
  return readJson<Aktion>('aktionen.json');
}
export function getApprovedAktionen(): Aktion[] {
  return getAktionen().filter(a => a.status === 'approved');
}
export function saveAktion(aktion: Aktion): void {
  const list = getAktionen();
  const idx = list.findIndex(a => a.id === aktion.id);
  if (idx >= 0) list[idx] = aktion;
  else list.push(aktion);
  writeJson('aktionen.json', list);
}

// Spenden
export function getSpenden(): SpendenRecord[] {
  return readJson<SpendenRecord>('spenden.json');
}
export function saveSpende(spende: SpendenRecord): void {
  const list = getSpenden();
  list.push(spende);
  writeJson('spenden.json', list);
}
