"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";

type CommitteeMember = {
  id: string;
  name: string;
  title: string;
  image: string;
  published: boolean;
  order: number;
};

type Committee = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  published: boolean;
  order: number;
  members: CommitteeMember[];
};

type CommitteesResponse = {
  success: boolean;
  committees?: Committee[];
  error?: string;
};

type MemberFormState = {
  name: string;
  title: string;
  order: string;
  published: boolean;
};

const EMPTY_FORM: MemberFormState = {
  name: "",
  title: "",
  order: "0",
  published: true,
};

export default function ManageCommitteesPanel() {
  const [committees, setCommittees] =
    useState<Committee[]>([]);

  const [
    selectedCommitteeId,
    setSelectedCommitteeId,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [
    savingDescription,
    setSavingDescription,
  ] = useState(false);

  const [
    committeeDescription,
    setCommitteeDescription,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] =
    useState<MemberFormState>(
      EMPTY_FORM
    );

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const loadCommittees =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/admin/committees",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const contentType =
          response.headers.get(
            "content-type"
          );

        if (
          !contentType?.includes(
            "application/json"
          )
        ) {
          throw new Error(
            "The committees API returned an invalid response."
          );
        }

        const data: CommitteesResponse =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load committees."
          );
        }

        const loadedCommittees =
          Array.isArray(
            data.committees
          )
            ? data.committees
            : [];

        setCommittees(
          loadedCommittees
        );

        setSelectedCommitteeId(
          (current) => {
            if (
              current &&
              loadedCommittees.some(
                (committee) =>
                  committee.id ===
                  current
              )
            ) {
              return current;
            }

            return (
              loadedCommittees[0]
                ?.id ?? ""
            );
          }
        );
      } catch (error) {
        console.error(
          "LOAD_ADMIN_COMMITTEES_ERROR",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load committees."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadCommittees();
  }, [loadCommittees]);

  const selectedCommittee =
    useMemo(() => {
      return (
        committees.find(
          (committee) =>
            committee.id ===
            selectedCommitteeId
        ) ?? null
      );
    }, [
      committees,
      selectedCommitteeId,
    ]);

  /*
   * Whenever the committee changes,
   * populate the editable description
   * with that committee's current value.
   */
  useEffect(() => {
    setCommitteeDescription(
      selectedCommittee?.description ??
        ""
    );
  }, [selectedCommittee]);

  function updateForm<
    K extends keyof MemberFormState,
  >(
    key: K,
    value: MemberFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSaveDescription() {
    if (!selectedCommitteeId) {
      setError(
        "Select a committee first."
      );
      return;
    }

    try {
      setSavingDescription(true);
      setError("");
      setSuccess("");

      const formData =
        new FormData();

      formData.set(
        "committeeId",
        selectedCommitteeId
      );

      formData.set(
        "description",
        committeeDescription
      );

      const response = await fetch(
        "/api/admin/committees",
        {
          method: "PATCH",
          body: formData,
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        !contentType?.includes(
          "application/json"
        )
      ) {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update committee description."
        );
      }

      const updatedDescription =
        data.committee
          ?.description ?? null;

      /*
       * Update local state immediately.
       */
      setCommittees(
        (current) =>
          current.map(
            (committee) =>
              committee.id ===
              selectedCommitteeId
                ? {
                    ...committee,
                    description:
                      updatedDescription,
                  }
                : committee
          )
      );

      setCommitteeDescription(
        updatedDescription ?? ""
      );

      setSuccess(
        "Committee description updated successfully."
      );
    } catch (error) {
      console.error(
        "UPDATE_COMMITTEE_DESCRIPTION_ERROR",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update committee description."
      );
    } finally {
      setSavingDescription(false);
    }
  }

  async function handleCreateMember(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedCommitteeId) {
      setError(
        "Select a committee first."
      );
      return;
    }

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const formData =
        new FormData();

      formData.set(
        "committeeId",
        selectedCommitteeId
      );

      formData.set(
        "name",
        form.name
      );

      formData.set(
        "title",
        form.title
      );

      formData.set(
        "order",
        form.order
      );

      formData.set(
        "published",
        String(form.published)
      );

      if (imageFile) {
        formData.set(
          "image",
          imageFile
        );
      }

      const response = await fetch(
        "/api/admin/committees",
        {
          method: "POST",
          body: formData,
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        !contentType?.includes(
          "application/json"
        )
      ) {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to create committee member."
        );
      }

      setForm(EMPTY_FORM);
      setImageFile(null);

      setSuccess(
        "Committee member added successfully."
      );

      await loadCommittees();
    } catch (error) {
      console.error(
        "CREATE_COMMITTEE_MEMBER_ERROR",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create committee member."
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Committee selector + description editor */}
      <section className="rounded-[24px] border border-white/[0.12] bg-black/20 p-5 backdrop-blur-xl md:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Left */}
          <div>
            <h2 className="text-lg font-bold text-white">
              Committee Members
            </h2>

            <p className="mt-1 text-sm text-white/45">
              Select a committee to manage
              its members and description.
            </p>
          </div>

          {/* Right */}
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Committee
              </label>

              <select
                value={
                  selectedCommitteeId
                }
                onChange={(event) => {
                  setSelectedCommitteeId(
                    event.target.value
                  );

                  setError("");
                  setSuccess("");
                }}
                className="w-full rounded-xl border border-white/10 bg-[#082f29] px-4 py-3 text-sm text-white outline-none transition focus:border-[#00c896]"
              >
                {committees.map(
                  (committee) => (
                    <option
                      key={
                        committee.id
                      }
                      value={
                        committee.id
                      }
                    >
                      {
                        committee.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Description
              </label>

              <textarea
                value={
                  committeeDescription
                }
                onChange={(event) =>
                  setCommitteeDescription(
                    event.target.value
                  )
                }
                disabled={
                  !selectedCommittee
                }
                rows={4}
                placeholder="Enter committee description..."
                className="w-full resize-y rounded-xl border border-white/10 bg-[#082f29] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-[#00c896] disabled:cursor-not-allowed disabled:opacity-50"
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  disabled={
                    !selectedCommittee ||
                    savingDescription
                  }
                  onClick={() =>
                    void handleSaveDescription()
                  }
                  className="flex items-center gap-2 rounded-xl bg-[#00a97e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00bd8d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingDescription ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  Save Description
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {success}
        </div>
      )}

      {/* Add member */}
      <section className="rounded-[24px] border border-white/[0.12] bg-black/20 p-5 backdrop-blur-xl md:p-6">
        <div className="mb-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Plus className="h-5 w-5 text-[#00dba3]" />

            Add Member
          </h2>

          <p className="mt-1 text-sm text-white/45">
            {selectedCommittee
              ? `Add a member to ${selectedCommittee.name}.`
              : "Select a committee first."}
          </p>
        </div>

        <form
          onSubmit={
            handleCreateMember
          }
          className="grid gap-4 md:grid-cols-2"
        >
          <AdminInput
            label="Name"
            value={form.name}
            onChange={(value) =>
              updateForm(
                "name",
                value
              )
            }
            required
          />

          <AdminInput
            label="Title"
            value={form.title}
            onChange={(value) =>
              updateForm(
                "title",
                value
              )
            }
            placeholder="President, Member, Vice President..."
            required
          />

          <AdminInput
            label="Order"
            type="number"
            value={form.order}
            onChange={(value) =>
              updateForm(
                "order",
                value
              )
            }
          />

          <label className="flex min-h-[74px] cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.04] px-4 text-sm text-white/60 transition hover:border-[#00c896]/50 hover:text-white">
            <ImagePlus className="h-5 w-5 shrink-0" />

            <span className="truncate">
              {imageFile
                ? imageFile.name
                : "Choose image (optional)"}
            </span>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) =>
                setImageFile(
                  event.target
                    .files?.[0] ??
                    null
                )
              }
            />
          </label>

          <div className="md:col-span-2">
            <p className="text-xs text-white/35">
              If no image is selected,
              /images/defaultPerson.png
              will be used automatically.
            </p>
          </div>

          <label className="flex items-center gap-3 text-sm text-white/70">
            <input
              type="checkbox"
              checked={
                form.published
              }
              onChange={(event) =>
                updateForm(
                  "published",
                  event.target.checked
                )
              }
              className="h-4 w-4 accent-[#00c896]"
            />

            Published
          </label>

          <div className="flex justify-end md:col-span-2">
            <button
              type="submit"
              disabled={
                creating ||
                !selectedCommitteeId
              }
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00c896] to-[#008f6a] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}

              Add Member
            </button>
          </div>
        </form>
      </section>

      {/* Existing members */}
      <section className="rounded-[24px] border border-white/[0.12] bg-black/20 p-5 backdrop-blur-xl md:p-6">
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#00dba3]" />
          </div>
        ) : selectedCommittee &&
          selectedCommittee.members
            .length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {selectedCommittee.members.map(
              (member) => (
                <CommitteeMemberEditor
                  key={member.id}
                  member={member}
                  onChanged={async (
                    message
                  ) => {
                    setSuccess(
                      message
                    );

                    setError("");

                    await loadCommittees();
                  }}
                  onError={(
                    message
                  ) => {
                    setError(
                      message
                    );

                    setSuccess("");
                  }}
                />
              )
            )}
          </div>
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
            <Users className="h-9 w-9 text-white/20" />

            <h3 className="mt-3 font-semibold text-white">
              No committee members
            </h3>

            <p className="mt-1 text-sm text-white/40">
              Add the first member
              using the form above.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function CommitteeMemberEditor({
  member,
  onChanged,
  onError,
}: {
  member: CommitteeMember;

  onChanged: (
    message: string
  ) => Promise<void>;

  onError: (
    message: string
  ) => void;
}) {
  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [name, setName] =
    useState(member.name);

  const [title, setTitle] =
    useState(member.title);

  const [order, setOrder] =
    useState(
      String(member.order)
    );

  const [
    published,
    setPublished,
  ] = useState(
    member.published
  );

  const [image, setImage] =
    useState<File | null>(null);

  function cancelEditing() {
    setName(member.name);
    setTitle(member.title);
    setOrder(
      String(member.order)
    );
    setPublished(
      member.published
    );
    setImage(null);
    setEditing(false);
  }

  async function handleSave() {
    try {
      setSaving(true);

      const formData =
        new FormData();

      formData.set(
        "name",
        name
      );

      formData.set(
        "title",
        title
      );

      formData.set(
        "order",
        order
      );

      formData.set(
        "published",
        String(published)
      );

      if (image) {
        formData.set(
          "image",
          image
        );
      }

      const response =
        await fetch(
          `/api/admin/committees/members/${member.id}`,
          {
            method: "PATCH",
            body: formData,
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        !contentType?.includes(
          "application/json"
        )
      ) {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update member."
        );
      }

      setEditing(false);
      setImage(null);

      await onChanged(
        "Committee member updated successfully."
      );
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Failed to update member."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed =
      window.confirm(
        `Delete ${member.name}? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const response =
        await fetch(
          `/api/admin/committees/members/${member.id}`,
          {
            method: "DELETE",
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        !contentType?.includes(
          "application/json"
        )
      ) {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete member."
        );
      }

      await onChanged(
        "Committee member deleted successfully."
      );
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Failed to delete member."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article className="rounded-2xl border border-white/[0.10] bg-white/[0.05] p-4">
      <div className="flex gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <Image
            src={
              member.image ||
              "/images/defaultPerson.png"
            }
            alt={member.name}
            fill
            sizes="96px"
            className="object-contain"
          />
        </div>

        <div className="min-w-0 flex-1">
          {!editing ? (
            <>
              <h3 className="truncate text-base font-bold text-white">
                {member.name}
              </h3>

              <p className="mt-1 text-sm text-[#00dba3]">
                {member.title}
              </p>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/40">
                <span>
                  Order:{" "}
                  {member.order}
                </span>

                <span>•</span>

                <span>
                  {member.published
                    ? "Published"
                    : "Hidden"}
                </span>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <AdminInput
                label="Name"
                value={name}
                onChange={
                  setName
                }
                required
              />

              <AdminInput
                label="Title"
                value={title}
                onChange={
                  setTitle
                }
                required
              />

              <AdminInput
                label="Order"
                type="number"
                value={order}
                onChange={
                  setOrder
                }
              />

              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/15 px-3 py-2 text-xs text-white/60">
                <ImagePlus className="h-4 w-4 shrink-0" />

                <span className="truncate">
                  {image
                    ? image.name
                    : "Replace image (optional)"}
                </span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) =>
                    setImage(
                      event.target
                        .files?.[0] ??
                        null
                    )
                  }
                />
              </label>

              <label className="flex items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={
                    published
                  }
                  onChange={(event) =>
                    setPublished(
                      event.target
                        .checked
                    )
                  }
                  className="accent-[#00c896]"
                />

                Published
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        {!editing ? (
          <>
            <button
              type="button"
              onClick={() =>
                setEditing(true)
              }
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.07] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.12]"
            >
              <Pencil className="h-4 w-4" />

              Edit
            </button>

            <button
              type="button"
              disabled={
                deleting
              }
              onClick={
                handleDelete
              }
              className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}

              Delete
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={
                cancelEditing
              }
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/70"
            >
              <X className="h-4 w-4" />

              Cancel
            </button>

            <button
              type="button"
              disabled={
                saving
              }
              onClick={
                handleSave
              }
              className="flex items-center gap-2 rounded-lg bg-[#00a97e] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              Save
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function AdminInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;

  onChange: (
    value: string
  ) => void;

  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
        {label}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={
          placeholder
        }
        min={
          type === "number"
            ? 0
            : undefined
        }
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#00c896]"
      />
    </label>
  );
}