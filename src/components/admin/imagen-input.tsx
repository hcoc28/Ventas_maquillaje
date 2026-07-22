"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { Loader2, Upload } from "lucide-react";

interface ImagenInputProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
}

/** Campo de imagen que acepta tanto una URL pegada a mano como subir un archivo (vía Cloudinary). */
export function ImagenInput({ value, onChange, placeholder, className }: ImagenInputProps) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function subirArchivo(file: File) {
    setSubiendo(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axios.post<{ url: string }>("/api/admin/upload", formData);
      onChange(data.url);
    } catch (err) {
      const mensaje = axios.isAxiosError(err) ? err.response?.data?.mensaje : null;
      setError(mensaje ?? "No se pudo subir la imagen.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className={className}>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "https://... o sube un archivo"}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent-strong"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-border px-3 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-surface-muted disabled:opacity-60"
        >
          {subiendo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {subiendo ? "Subiendo..." : "Subir"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) subirArchivo(file);
            e.target.value = "";
          }}
        />
      </div>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </div>
  );
}
