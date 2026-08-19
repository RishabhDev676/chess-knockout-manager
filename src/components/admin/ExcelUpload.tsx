'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, User, RefreshCw } from 'lucide-react';
import { parseExcelFile, ParseExcelResult } from '../../lib/excel/parseExcel';
import { ExtractedPlayer } from '../../lib/types';
import { Button } from '../ui/Button';

interface ExcelUploadProps {
  onConfirmPlayers: (tournamentName: string, players: ExtractedPlayer[]) => Promise<void>;
  isLoading?: boolean;
}

export const ExcelUpload: React.FC<ExcelUploadProps> = ({
  onConfirmPlayers,
  isLoading = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [tournamentName, setTournamentName] = useState('Monsoon Sports Chess 2026');
  const [parsedResult, setParsedResult] = useState<ParseExcelResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setErrorMsg('Please upload a valid Excel file (.xlsx or .xls).');
      return;
    }

    try {
      const result = await parseExcelFile(file);
      setParsedResult(result);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to process Excel file.');
      setParsedResult(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleConfirm = async () => {
    if (!parsedResult || parsedResult.players.length < 2) {
      setErrorMsg('A tournament requires at least 2 players.');
      return;
    }
    if (!tournamentName.trim()) {
      setErrorMsg('Please enter a tournament name.');
      return;
    }
    await onConfirmPlayers(tournamentName.trim(), parsedResult.players);
  };

  const handleReset = () => {
    setParsedResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Tournament Settings Card */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Tournament Name
        </label>
        <input
          type="text"
          value={tournamentName}
          onChange={(e) => setTournamentName(e.target.value)}
          placeholder="e.g. Monsoon Sports Chess 2026"
          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-slate-100 font-semibold text-base focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
        />
      </div>

      {/* Upload Zone */}
      {!parsedResult ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
            dragActive
              ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
            <FileSpreadsheet className="h-8 w-8" />
          </div>

          <h3 className="text-lg font-bold text-slate-100 mb-1">
            Upload Player List Excel File
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Drag and drop your <code className="text-amber-400 font-mono">.xlsx</code> or <code className="text-amber-400 font-mono">.xls</code> file here, or click to browse
          </p>

          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200">
            <Upload className="w-4 h-4" /> Choose Excel File
          </div>

          <p className="mt-4 text-[11px] text-slate-500">
            Column A should contain player names. Headers and empty rows are handled automatically.
          </p>
        </div>
      ) : (
        /* Parsed Result Preview Card */
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-slate-100">
                  Player List Extracted
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Total Players: <strong className="text-amber-400 font-bold">{parsedResult.totalCount}</strong>
              </p>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Change File
            </button>
          </div>

          {/* Warnings */}
          {parsedResult.warnings.length > 0 && (
            <div className="rounded-xl bg-amber-950/50 border border-amber-800/60 p-4 space-y-1 text-xs text-amber-300">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" /> Duplicate Warnings:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/80">
                {parsedResult.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Player Grid / List */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Extracted Players ({parsedResult.totalCount})
            </h4>
            <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-2 divide-y divide-slate-900">
              {parsedResult.players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-slate-500 font-mono text-[11px]">
                      {(index + 1).toString().padStart(2, '0')}.
                    </span>
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      {player.name}
                    </span>
                  </div>
                  {player.isDuplicate && (
                    <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-medium">
                      Duplicate Name
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleConfirm}
              isLoading={isLoading}
              variant="primary"
              size="lg"
              fullWidth
            >
              Confirm Player List & Start Tournament
            </Button>
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {errorMsg && (
        <div className="rounded-xl bg-rose-950/60 border border-rose-800/60 p-4 text-xs font-medium text-rose-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}
    </div>
  );
};
