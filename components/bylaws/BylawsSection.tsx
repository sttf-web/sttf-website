"use client";

import { useEffect, useState } from "react";
import {
  Download,
  FileText,
  Loader2,
} from "lucide-react";

type BylawDocument = {
  id: string;
  name: string;
  fileUrl: string;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  order: number;
};

type Bylaw = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  order: number;
  documents: BylawDocument[];
};

type BylawsResponse = {
  bylaws: Bylaw[];
};

type FetchStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

export function BylawsSection() {
  const [bylaws, setBylaws] = useState<Bylaw[]>([]);
  const [status, setStatus] =
    useState<FetchStatus>("idle");

  useEffect(() => {
    let cancelled = false;

    async function loadBylaws() {
      try {
        setStatus("loading");

        const response = await fetch("/api/bylaws", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `Failed to load bylaws: ${response.status}`
          );
        }

        const payload =
          (await response.json()) as BylawsResponse;

        if (!Array.isArray(payload.bylaws)) {
          throw new Error("Invalid bylaws response");
        }

        if (cancelled) return;

        setBylaws(payload.bylaws);
        setStatus("success");
      } catch (error) {
        console.error("LOAD_BYLAWS_ERROR", error);

        if (cancelled) return;

        setStatus("error");
      }
    }

    void loadBylaws();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main
      dir="rtl"
      className="relative min-h-screen mt-20 overflow-hidden bg-black text-white"
    >
      {/* Background image */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('/homPage/star.png')] bg-cover bg-center bg-no-repeat opacity-40"
      />

      {/* Dark overlay for readability */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black/55"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
        {/* Title */}
        <div className="mb-12 flex justify-end">
          <div className="w-full text-right">
            <div className="flex items-center justify-end gap-3">
              <div className="h-[2px] w-7 bg-emerald-400" />

              <h1 className="text-right text-2xl font-bold text-white sm:text-3xl">
                اللوائح
              </h1>
            </div>

            <div className="mt-2 flex justify-end gap-1">
              {Array.from({ length: 10 }).map((_, index) => (
                <span
                  key={index}
                  className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                />
              ))}
            </div>
          </div>
        </div>

        {status === "loading" && (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          </div>
        )}

        {status === "error" && (
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="w-full text-right text-sm text-white/60">
              حدث خطأ أثناء تحميل اللوائح
            </p>
          </div>
        )}

        {status === "success" && bylaws.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="w-full text-right text-sm text-white/60">
              لا توجد لوائح متاحة حالياً
            </p>
          </div>
        )}

        {status === "success" && bylaws.length > 0 && (
          <div className="mx-auto flex w-full max-w-[660px] flex-col gap-10">
            {bylaws.map((bylaw) => (
              <BylawCard
                key={bylaw.id}
                bylaw={bylaw}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function BylawCard({
  bylaw,
}: {
  bylaw: Bylaw;
}) {
  const documents = bylaw.documents;

  /*
   * If there is only one document,
   * clicking the whole card downloads it directly.
   */
  if (documents.length === 1) {
    const document = documents[0];

    return (
      <a
        href={document.fileUrl}
        download={document.fileName ?? document.name}
        className="group relative block min-h-[112px] overflow-hidden rounded-md border border-emerald-400/70 bg-[#003d2b]/95 transition duration-300 hover:border-emerald-300 hover:bg-[#064934]"
      >
        <BylawCardDecoration />

        <div className="relative z-10 flex min-h-[112px] items-center justify-end px-8 sm:px-10">
          <div className="flex w-full min-w-[68%] items-center justify-between gap-4 bg-white/20 px-4 py-2 transition group-hover:bg-white/25">
            <Download className="h-4 w-4 shrink-0 text-white/60 transition group-hover:text-white" />

            <span className="flex-1 text-right text-base font-bold sm:text-lg">
              {bylaw.title}
            </span>
          </div>
        </div>
      </a>
    );
  }

  /*
   * Multiple documents:
   * title stays on the card and every document downloads directly.
   */
  return (
    <div className="group relative overflow-hidden rounded-md border border-emerald-400/70 bg-[#003d2b]/95 transition duration-300 hover:border-emerald-300">
      <BylawCardDecoration />

      <div className="relative z-10 px-8 py-5 text-right sm:px-10">
        <div className="flex justify-end">
          <div className="w-full min-w-[68%] bg-white/20 px-4 py-2">
            <h2 className="text-right text-base font-bold sm:text-lg">
              {bylaw.title}
            </h2>
          </div>
        </div>

        {bylaw.description && (
          <p className="mt-4 text-right text-sm leading-7 text-white/65">
            {bylaw.description}
          </p>
        )}

        {documents.length > 0 ? (
          <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
            {documents.map((document) => (
              <a
                key={document.id}
                href={document.fileUrl}
                download={document.fileName ?? document.name}
                className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-black/15 px-4 py-3 text-right transition hover:border-emerald-400/40 hover:bg-white/[0.06]"
              >
                <Download className="h-4 w-4 shrink-0 text-white/40" />

                <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
                  <span className="truncate text-right text-sm font-medium text-white/90">
                    {document.name}
                  </span>

                  <FileText className="h-4 w-4 shrink-0 text-emerald-400" />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-right text-xs text-white/40">
            لا توجد ملفات متاحة لهذه اللائحة
          </p>
        )}
      </div>
    </div>
  );
}

function BylawCardDecoration() {
  return (
    <>
      <div className="pointer-events-none absolute -left-16 top-1/2 h-28 w-52 -translate-y-1/2 rotate-45 border border-emerald-400/[0.07]" />

      <div className="pointer-events-none absolute -right-20 top-1/2 h-32 w-56 -translate-y-1/2 -rotate-12 border border-emerald-400/[0.06]" />
    </>
  );
}