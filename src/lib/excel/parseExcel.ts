import * as XLSX from 'xlsx';
import { ExtractedPlayer } from '../types';

export interface ParseExcelResult {
  players: ExtractedPlayer[];
  totalCount: number;
  duplicateCount: number;
  warnings: string[];
}

const COMMON_HEADER_TERMS = [
  'name',
  'player',
  'players',
  'player name',
  'player_name',
  'names',
  'participant',
  'participants',
  'sr no',
  'sr. no',
  's.no',
  'no',
  'id',
];

export async function parseExcelFile(file: File): Promise<ParseExcelResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('The uploaded Excel file contains no sheets.');
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert worksheet to 2D array of raw values
        const rows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          blankrows: false,
          defval: '',
        });

        if (rows.length === 0) {
          throw new Error('The uploaded Excel file is empty.');
        }

        const rawNames: string[] = [];

        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
          const row = rows[rowIndex];
          if (!row || !Array.isArray(row) || row.length === 0) continue;

          // Find first non-empty cell in row
          let nameCell = '';
          for (let col = 0; col < row.length; col++) {
            const val = String(row[col] || '').trim();
            if (val.length > 0) {
              nameCell = val;
              break;
            }
          }

          if (!nameCell) continue;

          // Check if first row is a header
          if (rowIndex === 0) {
            const lowerCell = nameCell.toLowerCase();
            if (COMMON_HEADER_TERMS.includes(lowerCell)) {
              continue; // Skip header row
            }
          }

          rawNames.push(nameCell);
        }

        if (rawNames.length === 0) {
          throw new Error('No valid player names found in the Excel file.');
        }

        const seenNames = new Set<string>();
        const players: ExtractedPlayer[] = [];
        const warnings: string[] = [];
        let duplicateCount = 0;

        rawNames.forEach((name, index) => {
          const trimmed = name.trim();
          if (!trimmed) return;

          const lowerName = trimmed.toLowerCase();
          const isDup = seenNames.has(lowerName);

          if (isDup) {
            duplicateCount++;
            warnings.push(`Duplicate player name detected: "${trimmed}"`);
          } else {
            seenNames.add(lowerName);
          }

          players.push({
            id: `p-${index + 1}-${Math.random().toString(36).substr(2, 6)}`,
            name: trimmed,
            isDuplicate: isDup,
          });
        });

        resolve({
          players,
          totalCount: players.length,
          duplicateCount,
          warnings,
        });
      } catch (err: unknown) {
        reject(err instanceof Error ? err : new Error('Failed to parse Excel file.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file from disk.'));
    };

    reader.readAsArrayBuffer(file);
  });
}
