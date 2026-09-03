"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  BookOpenText,
  ExternalLink,
  FilePlus2,
  FileText,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

type BylawDocument = {
  id: string;
  name: string;
  fileUrl: string;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  order: number;
  published: boolean;
};

type Bylaw = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  published: boolean;
  order: number;
  documents: BylawDocument[];
};

type BylawsResponse = {
  bylaws: Bylaw[];
};

function formatFileSize(size: number | null) {
  if (!size) return "";

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ManageBylawsPanel() {
  const [bylaws, setBylaws] = useState<Bylaw[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingBylawId, setDeletingBylawId] =
    useState<string | null>(null);
  const [deletingDocumentId, setDeletingDocumentId] =
    useState<string | null>(null);
  const [uploadingToBylawId, setUploadingToBylawId] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const createFileInputRef = useRef<HTMLInputElement>(null);

  const loadBylaws = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/admin/bylaws", {
        method: "GET",
        cache: "no-store",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error ?? "Unable to load bylaws."
        );
      }

      if (!Array.isArray(payload?.bylaws)) {
        throw new Error("Invalid bylaws response.");
      }

      setBylaws((payload as BylawsResponse).bylaws);
    } catch (error) {
      console.error("LOAD_ADMIN_BYLAWS_ERROR", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load bylaws."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBylaws();
  }, [loadBylaws]);

  function handleCreateFiles(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles = Array.from(
      event.target.files ?? []
    );

    if (selectedFiles.length === 0) return;

    setFiles((current) => [...current, ...selectedFiles]);

    event.target.value = "";
  }

  function removeCreateFile(index: number) {
    setFiles((current) =>
      current.filter((_, fileIndex) => fileIndex !== index)
    );
  }

  async function handleCreateBylaw(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setErrorMessage("Please enter a bylaw title.");
      return;
    }

    if (files.length === 0) {
      setErrorMessage(
        "Please upload at least one bylaw document."
      );
      return;
    }

    try {
      setIsCreating(true);
      setErrorMessage("");
      setSuccessMessage("");

      const formData = new FormData();

      formData.append("title", cleanTitle);
      formData.append("description", description.trim());

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/admin/bylaws", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error ?? "Unable to create bylaw."
        );
      }

      setTitle("");
      setDescription("");
      setFiles([]);

      setSuccessMessage("Bylaw created successfully.");

      await loadBylaws();
    } catch (error) {
      console.error("CREATE_BYLAW_ERROR", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create bylaw."
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteBylaw(bylawId: string) {
    const confirmed = window.confirm(
      "Delete this bylaw and all of its documents?"
    );

    if (!confirmed) return;

    try {
      setDeletingBylawId(bylawId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        `/api/admin/bylaws/${bylawId}`,
        {
          method: "DELETE",
        }
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error ?? "Unable to delete bylaw."
        );
      }

      setBylaws((current) =>
        current.filter((bylaw) => bylaw.id !== bylawId)
      );

      setSuccessMessage("Bylaw deleted successfully.");
    } catch (error) {
      console.error("DELETE_BYLAW_ERROR", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete bylaw."
      );
    } finally {
      setDeletingBylawId(null);
    }
  }

  async function handleDeleteDocument(
    bylawId: string,
    documentId: string
  ) {
    const confirmed = window.confirm(
      "Delete this document?"
    );

    if (!confirmed) return;

    try {
      setDeletingDocumentId(documentId);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(
        `/api/admin/bylaws/${bylawId}/documents/${documentId}`,
        {
          method: "DELETE",
        }
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error ?? "Unable to delete document."
        );
      }

      setBylaws((current) =>
        current.map((bylaw) => {
          if (bylaw.id !== bylawId) {
            return bylaw;
          }

          return {
            ...bylaw,
            documents: bylaw.documents.filter(
              (document) => document.id !== documentId
            ),
          };
        })
      );

      setSuccessMessage("Document deleted successfully.");
    } catch (error) {
      console.error("DELETE_BYLAW_DOCUMENT_ERROR", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete document."
      );
    } finally {
      setDeletingDocumentId(null);
    }
  }

  async function handleUploadAdditionalDocuments(
    bylawId: string,
    selectedFiles: File[]
  ) {
    if (selectedFiles.length === 0) return;

    try {
      setUploadingToBylawId(bylawId);
      setErrorMessage("");
      setSuccessMessage("");

      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(
        `/api/admin/bylaws/${bylawId}/documents`,
        {
          method: "POST",
          body: formData,
        }
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.error ?? "Unable to upload documents."
        );
      }

      setSuccessMessage("Documents uploaded successfully.");

      await loadBylaws();
    } catch (error) {
      console.error("UPLOAD_BYLAW_DOCUMENTS_ERROR", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload documents."
      );
    } finally {
      setUploadingToBylawId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-white/[0.12] bg-white/[0.07] p-5 shadow-[0_24px_48px_rgba(0,0,0,0.18)] backdrop-blur-2xl md:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#00c896]/15 text-[#00e0aa] ring-1 ring-[#00c896]/25">
            <Plus className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              Add Bylaw
            </h2>

            <p className="mt-1 text-sm leading-6 text-white/50">
              Create a bylaw and upload one or multiple
              documents under it.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCreateBylaw}
          className="mt-7 space-y-5"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="bylaw-title"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                Title
              </label>

              <input
                id="bylaw-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. لائحة اللاعبين والمدربين"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#00c896]/60 focus:ring-2 focus:ring-[#00c896]/10"
              />
            </div>

            <div>
              <label
                htmlFor="bylaw-description"
                className="mb-2 block text-sm font-semibold text-white/80"
              >
                Description
                <span className="ml-2 font-normal text-white/30">
                  Optional
                </span>
              </label>

              <input
                id="bylaw-description"
                type="text"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Optional description"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#00c896]/60 focus:ring-2 focus:ring-[#00c896]/10"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-semibold text-white/80">
                Documents
              </label>

              <span className="text-xs text-white/35">
                PDF or other document files
              </span>
            </div>

            <input
              ref={createFileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleCreateFiles}
            />

            <button
              type="button"
              onClick={() =>
                createFileInputRef.current?.click()
              }
              className="flex min-h-[120px] w-full flex-col items-center justify-center rounded-[20px] border border-dashed border-white/15 bg-black/10 px-5 py-6 text-center transition hover:border-[#00c896]/50 hover:bg-[#00c896]/[0.04]"
            >
              <UploadCloud className="mb-3 h-7 w-7 text-[#00e0aa]" />

              <span className="text-sm font-semibold text-white">
                Choose documents
              </span>

              <span className="mt-1 text-xs text-white/40">
                You can select multiple files
              </span>
            </button>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/15 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText className="h-4 w-4 shrink-0 text-[#00e0aa]" />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white/85">
                          {file.name}
                        </p>

                        <p className="mt-0.5 text-xs text-white/35">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeCreateFile(index)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white/40 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-2xl border border-[#00c896]/20 bg-[#00c896]/10 px-4 py-3 text-sm text-emerald-100">
              {successMessage}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#00c896] to-[#008f6a] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,200,150,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  Create Bylaw
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[24px] border border-white/[0.12] bg-white/[0.07] p-5 shadow-[0_24px_48px_rgba(0,0,0,0.18)] backdrop-blur-2xl md:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] text-[#00e0aa] ring-1 ring-white/[0.1]">
            <BookOpenText className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              Existing Bylaws
            </h2>

            <p className="mt-1 text-sm text-white/50">
              Manage bylaws and their documents.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#00e0aa]" />
          </div>
        ) : bylaws.length === 0 ? (
          <div className="mt-6 rounded-[20px] border border-dashed border-white/10 bg-black/10 px-5 py-12 text-center">
            <BookOpenText className="mx-auto h-8 w-8 text-white/20" />

            <p className="mt-3 text-sm font-semibold text-white/60">
              No bylaws have been added yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {bylaws.map((bylaw) => (
              <BylawAdminCard
                key={bylaw.id}
                bylaw={bylaw}
                deletingBylawId={deletingBylawId}
                deletingDocumentId={deletingDocumentId}
                uploadingToBylawId={uploadingToBylawId}
                onDeleteBylaw={handleDeleteBylaw}
                onDeleteDocument={handleDeleteDocument}
                onUploadDocuments={
                  handleUploadAdditionalDocuments
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

type BylawAdminCardProps = {
  bylaw: Bylaw;
  deletingBylawId: string | null;
  deletingDocumentId: string | null;
  uploadingToBylawId: string | null;
  onDeleteBylaw: (bylawId: string) => Promise<void>;
  onDeleteDocument: (
    bylawId: string,
    documentId: string
  ) => Promise<void>;
  onUploadDocuments: (
    bylawId: string,
    files: File[]
  ) => Promise<void>;
};

function BylawAdminCard({
  bylaw,
  deletingBylawId,
  deletingDocumentId,
  uploadingToBylawId,
  onDeleteBylaw,
  onDeleteDocument,
  onUploadDocuments,
}: BylawAdminCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDeleting =
    deletingBylawId === bylaw.id;

  const isUploading =
    uploadingToBylawId === bylaw.id;

  return (
    <article className="overflow-hidden rounded-[20px] border border-white/10 bg-black/15">
      <div className="flex flex-col gap-4 border-b border-white/[0.08] p-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h3
            dir="auto"
            className="text-base font-bold text-white"
          >
            {bylaw.title}
          </h3>

          {bylaw.description && (
            <p
              dir="auto"
              className="mt-1 text-sm text-white/45"
            >
              {bylaw.description}
            </p>
          )}

          <p className="mt-2 text-xs text-white/30">
            {bylaw.documents.length} document
            {bylaw.documents.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              const selectedFiles = Array.from(
                event.target.files ?? []
              );

              if (selectedFiles.length > 0) {
                void onUploadDocuments(
                  bylaw.id,
                  selectedFiles
                );
              }

              event.target.value = "";
            }}
          />

          <button
            type="button"
            disabled={isUploading}
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/[0.1] hover:text-white disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FilePlus2 className="h-3.5 w-3.5" />
            )}

            Add Documents
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={() =>
              void onDeleteBylaw(bylaw.id)
            }
            className="inline-flex items-center gap-2 rounded-xl border border-red-400/10 bg-red-500/[0.08] px-3 py-2 text-xs font-semibold text-red-200/80 transition hover:bg-red-500/15 hover:text-red-100 disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}

            Delete
          </button>
        </div>
      </div>

      {bylaw.documents.length === 0 ? (
        <div className="p-4 text-sm text-white/35">
          No documents uploaded.
        </div>
      ) : (
        <div className="divide-y divide-white/[0.06]">
          {bylaw.documents.map((document) => {
            const isDeletingDocument =
              deletingDocumentId === document.id;

            return (
              <div
                key={document.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00c896]/10 text-[#00e0aa]">
                    <FileText className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p
                      dir="auto"
                      className="truncate text-sm font-medium text-white/80"
                    >
                      {document.name}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-white/30">
                      {document.fileName && (
                        <span>{document.fileName}</span>
                      )}

                      {document.fileSize && (
                        <span>
                          {formatFileSize(
                            document.fileSize
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={document.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/[0.06] hover:text-white"
                    title="Open document"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <button
                    type="button"
                    disabled={isDeletingDocument}
                    onClick={() =>
                      void onDeleteDocument(
                        bylaw.id,
                        document.id
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-red-300/50 transition hover:bg-red-500/10 hover:text-red-200 disabled:opacity-50"
                    title="Delete document"
                  >
                    {isDeletingDocument ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}