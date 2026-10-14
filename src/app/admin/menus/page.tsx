"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  createMenu, updateMenu, toggleMenuStatus, deleteMenu,
  createCategory, deleteCategory, duplicateMenu, toggleCategory,
} from "@/app/actions/menus"
import {
  createMenuItem, updateMenuItem, toggleItemAvailability,
  deleteMenuItem, duplicateMenuItem,
} from "@/app/actions/items"
import {
  Plus, Pencil, Trash2, Copy, ChevronDown, ChevronRight,
  X, Search, Image as ImageIcon, Upload, Link as LinkIcon,
  BookOpen, Layers3, UtensilsCrossed, Eye, EyeOff,
  CheckCircle2, AlertCircle, Loader2,
} from "lucide-react"

type MenuStatus = "DRAFT" | "PUBLISHED"

type Notice = {
  type: "success" | "error"
  text: string
} | null

type Item = {
  id: string
  categoryId: string
  name: string
  nameAmharic?: string | null
  nameOromo?: string | null
  description?: string | null
  price: number | string
  currency: string
  imageUrl?: string | null
  isAvailable: boolean
}

type Category = {
  id: string
  name: string
  isActive: boolean
  _count?: { items?: number }
  items?: Item[]
  menu?: { name: string }
}

type Menu = {
  id: string
  name: string
  description?: string | null
  imageUrl?: string | null
  status: MenuStatus
  categories?: Category[]
}

type Modal =
  | { kind: "create-menu" }
  | { kind: "edit-menu"; menu: Menu }
  | { kind: "create-item"; category: Category }
  | { kind: "edit-item"; item: Item }
  | null

type ImageMode = "url" | "upload"

const field =
  "mt-1.5 w-full rounded-xl border border-[var(--border-color)] bg-[var(--main-bg)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--btn-primary)]"

const label =
  "block text-xs font-semibold text-[var(--text-secondary)]"

const iconButton =
  "rounded-lg border border-[var(--border-color)] p-2 text-[var(--text-secondary)] transition hover:bg-[var(--main-bg)] hover:text-[var(--text-primary)]"

function ImageInput({
  name,
  initial = "",
  onImage,
  resetKey,
}: {
  name: string
  initial?: string
  onImage: (value: string) => void
  resetKey: string
}) {
  const [mode, setMode] = useState<ImageMode>("url")
  const [value, setValue] = useState(initial)
  const [error, setError] = useState("")

  useEffect(() => {
    setMode("url")
    setValue(initial)
    onImage(initial)
    setError("")
  }, [resetKey])

  function upload(file?: File) {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.")
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("Choose an image smaller than 3 MB.")
      return
    }

    setError("")

    const reader = new FileReader()

    reader.onload = () => {
      const next = String(reader.result)
      setValue(next)
      onImage(next)
    }

    reader.onerror = () => {
      setError("Unable to read this image.")
    }

    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className={label}>Image (optional)</span>

        <div className="flex rounded-lg border border-[var(--border-color)] p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`flex items-center gap-1 rounded-md px-2 py-1 ${
              mode === "url"
                ? "bg-slate-800 text-white"
                : "text-[var(--text-secondary)]"
            }`}
          >
            <LinkIcon size={13} />
            URL
          </button>

          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex items-center gap-1 rounded-md px-2 py-1 ${
              mode === "upload"
                ? "bg-slate-800 text-white"
                : "text-[var(--text-secondary)]"
            }`}
          >
            <Upload size={13} />
            Upload
          </button>
        </div>
      </div>

      {mode === "url" ? (
        <input
  type="url"
  placeholder="https://example.com/photo.jpg"
  className={field}
  value={(value ?? "").startsWith("data:") ? "" : (value ?? "")}
  onChange={(e) => {
    setValue(e.target.value)
    onImage(e.target.value)
  }}
/>
      ) : (
        <input
          type="file"
          accept="image/*"
          className="block w-full text-xs text-[var(--text-secondary)]"
          onChange={(e) => upload(e.target.files?.[0])}
        />
      )}

      {value && (
        <div className="flex items-center gap-3">
          <img
            src={value}
            alt="Image preview"
            className="h-20 w-24 rounded-xl border border-[var(--border-color)] object-cover"
          />

          <button
            type="button"
            className="text-xs text-red-500 underline"
            onClick={() => {
              setValue("")
              onImage("")
            }}
          >
            Remove image
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <input type="hidden" name={name} value={value} />
    </div>
  )
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [itemCategories, setItemCategories] = useState<Category[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [expanded, setExpanded] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const [modal, setModal] = useState<Modal>(null)
  const [image, setImage] = useState("")
  const [search, setSearch] = useState("")
  const [addingCategory, setAddingCategory] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [menuResponse, itemResponse] = await Promise.all([
        fetch("/api/admin/menus", { cache: "no-store" }),
        fetch("/api/admin/items", { cache: "no-store" }),
      ])

      if (!menuResponse.ok || !itemResponse.ok) {
        throw new Error("Could not load menus and items.")
      }

      const [menuData, itemData]: [Menu[], Category[]] =
        await Promise.all([
          menuResponse.json(),
          itemResponse.json(),
        ])

      setMenus(menuData)
      setItemCategories(itemData)

      setSelectedId((previous) =>
        menuData.some((m) => m.id === previous)
          ? previous
          : menuData[0]?.id ?? ""
      )
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to load data.",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const selected = menus.find((m) => m.id === selectedId)
  const categories = selected?.categories ?? []

  const itemsFor = (categoryId: string) =>
    itemCategories.find((c) => c.id === categoryId)?.items ?? []

  const totalItems = useMemo(
    () =>
      categories.reduce(
        (sum, c) =>
          sum +
          (itemCategories.find((i) => i.id === c.id)?.items?.length ??
            c._count?.items ??
            0),
        0
      ),
    [categories, itemCategories]
  )

  function showResult(
    result: { error?: string; success?: string },
    fallback: string
  ) {
    if (result.error) {
      setNotice({
        type: "error",
        text: result.error,
      })
      return false
    }

    setNotice({
      type: "success",
      text: result.success || fallback,
    })

    return true
  }

  async function execute(
    task: () => Promise<{ error?: string; success?: string }>,
    fallback: string,
    onSuccess?: () => void
  ) {
    if (busy) return

    setBusy(true)
    setNotice(null)

    try {
      const ok = showResult(await task(), fallback)

      if (ok) {
        onSuccess?.()
        await loadData()
      }
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Action failed. Try again.",
      })
    } finally {
      setBusy(false)
    }
  }

  function closeModal() {
    setModal(null)
    setImage("")
  }

  function openModal(next: Modal) {
    setImage(
      next?.kind === "edit-menu"
        ? next.menu.imageUrl ?? ""
        : next?.kind === "edit-item"
          ? next.item.imageUrl ?? ""
          : ""
    )

    setModal(next)
  }

  async function submitMenu(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    if (modal?.kind === "edit-menu") {
      const menu = modal.menu

      await execute(
        () => updateMenu(menu.id, formData),
        "Menu updated.",
        closeModal
      )
    } else {
      await execute(
        () => createMenu(formData),
        "Menu created.",
        closeModal
      )
    }
  }

  async function submitCategory(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    const form = event.currentTarget

    await execute(
      () => createCategory(new FormData(form)),
      "Category created.",
      () => {
        form.reset()
        setAddingCategory(false)
      }
    )
  }

  async function submitItem(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    if (modal?.kind === "edit-item") {
      await execute(
        () => updateMenuItem(formData),
        "Item updated.",
        closeModal
      )
    } else {
      await execute(
        () => createMenuItem(formData),
        "Item added.",
        closeModal
      )
    }
  }

  async function removeMenu(menu: Menu) {
    if (
      !confirm(
        `Delete "${menu.name}" and all of its categories? This cannot be undone.`
      )
    ) {
      return
    }

    await execute(
      () => deleteMenu(menu.id),
      "Menu deleted."
    )
  }

  async function removeCategory(category: Category) {
    if (
      !confirm(
        `Delete category "${category.name}"? This may also remove its items.`
      )
    ) {
      return
    }

    await execute(
      () => deleteCategory(category.id),
      "Category deleted."
    )
  }

  async function removeItem(item: Item) {
    if (!confirm(`Delete "${item.name}"?`)) return

    await execute(
      () => deleteMenuItem(item.id),
      "Item deleted."
    )
  }

  function toggleExpanded(id: string) {
    setExpanded((old) =>
      old.includes(id)
        ? old.filter((x) => x !== id)
        : [...old, id]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-[var(--text-secondary)]">
        <Loader2 className="animate-spin" size={18} />
        Loading menu management...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-[var(--text-primary)]">

      {/* PAGE HEADER */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Menu Management
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Create menus, organize categories, and manage items
            in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openModal({ kind: "create-menu" })}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={17} />
          New Menu
        </button>
      </header>

      {/* NOTIFICATIONS */}
      {notice && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
            notice.type === "error"
              ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {notice.type === "error" ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}

          <span className="flex-1">{notice.text}</span>

          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {menus.length === 0 ? (
        /* EMPTY STATE */
        <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--card-bg)] px-6 py-16 text-center">
          <BookOpen
            className="mx-auto mb-4 text-[var(--text-secondary)]"
            size={40}
          />

          <h2 className="text-lg font-bold">
            Create your first menu
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-secondary)]">
            Start with a menu such as Breakfast, Main Menu,
            or Room Service. Then add categories and items.
          </p>

          <button
            type="button"
            onClick={() => openModal({ kind: "create-menu" })}
            className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Create Menu
          </button>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">

          {/* MENU SELECTOR */}
          <aside className="space-y-3 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">
                Your Menus
              </h2>

              <span className="text-xs text-[var(--text-secondary)]">
                {menus.length}
              </span>
            </div>

            <div className="space-y-2">
              {menus.map((menu) => (
                <button
                  key={menu.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(menu.id)
                    setSearch("")
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selectedId === menu.id
                      ? "border-slate-700 bg-slate-800 text-white"
                      : "border-[var(--border-color)] hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">
                      {menu.name}
                    </span>

                    <ChevronRight size={15} />
                  </div>

                  <span
                    className={`mt-1 inline-block text-xs ${
                      selectedId === menu.id
                        ? "text-slate-300"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {menu.status === "PUBLISHED"
                      ? "● Published"
                      : "○ Draft"}{" "}
                    · {menu.categories?.length ?? 0} categories
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* SELECTED MENU */}
          {selected && (
            <div className="min-w-0 space-y-5">

              {/* MENU DETAILS */}
              <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold">
                        {selected.name}
                      </h2>

                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          selected.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {selected.status === "PUBLISHED"
                          ? "Published"
                          : "Draft"}
                      </span>
                    </div>

                    {selected.description && (
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        {selected.description}
                      </p>
                    )}

                    <div className="mt-3 flex gap-4 text-xs text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1">
                        <Layers3 size={14} />
                        {categories.length} categories
                      </span>

                      <span className="flex items-center gap-1">
                        <UtensilsCrossed size={14} />
                        {totalItems} items
                      </span>
                    </div>
                  </div>

                  {/* MENU ACTIONS */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void execute(
                          () =>
                            toggleMenuStatus(
                              selected.id,
                              selected.status
                            ),
                          "Menu status updated."
                        )
                      }
                      className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                        selected.status === "DRAFT"
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "border border-amber-500/30 text-amber-600"
                      }`}
                    >
                      {selected.status === "DRAFT"
                        ? "Publish"
                        : "Unpublish"}
                    </button>

                    <button
                      type="button"
                      className={iconButton}
                      title="Edit menu"
                      onClick={() =>
                        openModal({
                          kind: "edit-menu",
                          menu: selected,
                        })
                      }
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      className={iconButton}
                      title="Duplicate menu"
                      onClick={() =>
                        void execute(
                          () => duplicateMenu(selected.id),
                          "Menu duplicated."
                        )
                      }
                    >
                      <Copy size={16} />
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      className={`${iconButton} text-red-500`}
                      title="Delete menu"
                      onClick={() => void removeMenu(selected)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </section>

              {/* CATEGORIES AND ITEMS */}
              <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold">
                      Categories & Items
                    </h3>

                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      Expand a category to manage its items.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setAddingCategory((v) => !v)
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] px-3 py-2 text-xs font-semibold hover:bg-[var(--main-bg)]"
                  >
                    <Plus size={15} />
                    Add Category
                  </button>
                </div>

                {/* CREATE CATEGORY */}
                {addingCategory && (
                  <form
                    onSubmit={submitCategory}
                    className="mt-4 flex flex-wrap gap-2 rounded-xl bg-[var(--main-bg)] p-3"
                  >
                    <input
                      type="hidden"
                      name="menuId"
                      value={selected.id}
                    />

                    <input
                      name="name"
                      required
                      placeholder="e.g. Hot Drinks"
                      className={`${field} mt-0 min-w-36 flex-1`}
                    />

                    <button
                      disabled={busy}
                      type="submit"
                      className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Save Category
                    </button>
                  </form>
                )}

                {/* SEARCH */}
                <div className="relative mt-4">
                  <Search
                    size={16}
                    className="absolute left-3 top-3 text-[var(--text-secondary)]"
                  />

                  <input
                    className={`${field} mt-0 pl-9`}
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search categories or items..."
                  />
                </div>

                {/* NO CATEGORIES */}
                {categories.length === 0 && (
                  <div className="mt-5 rounded-xl border border-dashed border-[var(--border-color)] p-8 text-center">
                    <Layers3 className="mx-auto text-[var(--text-secondary)]" />

                    <p className="mt-2 text-sm font-semibold">
                      No categories yet
                    </p>

                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      Add a category such as Breakfast,
                      Hot Drinks, or Desserts.
                    </p>
                  </div>
                )}

                {/* CATEGORY LIST */}
                <div className="mt-4 space-y-3">
                  {categories.map((category) => {
                    const items = itemsFor(category.id)

                    const filtered = items.filter((i) =>
                      `${i.name} ${i.description ?? ""}`
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    )

                    const matchesCategory = category.name
                      .toLowerCase()
                      .includes(search.toLowerCase())

                    if (
                      search &&
                      !matchesCategory &&
                      filtered.length === 0
                    ) {
                      return null
                    }

                    const visibleItems =
                      search && matchesCategory
                        ? items
                        : filtered

                    const isOpen =
                      expanded.includes(category.id) ||
                      Boolean(search)

                    return (
                      <div
                        key={category.id}
                        className="overflow-hidden rounded-xl border border-[var(--border-color)]"
                      >
                        {/* CATEGORY HEADER */}
                        <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4">
                          <button
                            type="button"
                            onClick={() =>
                              toggleExpanded(category.id)
                            }
                            className="flex min-w-0 flex-1 items-center gap-2 text-left"
                          >
                            <span className="text-[var(--text-secondary)]">
                              {isOpen ? (
                                <ChevronDown size={17} />
                              ) : (
                                <ChevronRight size={17} />
                              )}
                            </span>

                            <span className="truncate text-sm font-semibold">
                              {category.name}
                            </span>

                            <span className="shrink-0 text-xs text-[var(--text-secondary)]">
                              ({items.length})
                            </span>
                          </button>

                          {/* CATEGORY VISIBILITY */}
                          <button
                            type="button"
                            disabled={busy}
                            title={
                              category.isActive
                                ? "Hide category"
                                : "Show category"
                            }
                            onClick={() =>
                              void execute(
                                () =>
                                  toggleCategory(
                                    category.id,
                                    category.isActive
                                  ),
                                "Category visibility updated."
                              )
                            }
                            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs ${
                              category.isActive
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-slate-500/10 text-[var(--text-secondary)]"
                            }`}
                          >
                            {category.isActive ? (
                              <Eye size={13} />
                            ) : (
                              <EyeOff size={13} />
                            )}

                            {category.isActive
                              ? "Visible"
                              : "Hidden"}
                          </button>

                          {/* ADD ITEM */}
                          <button
                            type="button"
                            title="Add item"
                            className={iconButton}
                            onClick={() =>
                              openModal({
                                kind: "create-item",
                                category,
                              })
                            }
                          >
                            <Plus size={15} />
                          </button>

                          {/* DELETE CATEGORY */}
                          <button
                            type="button"
                            title="Delete category"
                            className={`${iconButton} text-red-500`}
                            disabled={busy}
                            onClick={() =>
                              void removeCategory(category)
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {/* CATEGORY ITEMS */}
                        {isOpen && (
                          <div className="space-y-2 border-t border-[var(--border-color)] p-3 sm:p-4">
                            {visibleItems.length === 0 ? (
                              <p className="py-3 text-center text-xs text-[var(--text-secondary)]">
                                {search
                                  ? "No matching items."
                                  : "No items yet. Add the first item."}
                              </p>
                            ) : (
                              visibleItems.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex flex-wrap items-center gap-3 rounded-xl bg-[var(--main-bg)] p-3"
                                >
                                  {/* ITEM IMAGE */}
                                  {item.imageUrl ? (
                                    <img
                                      src={item.imageUrl}
                                      alt={item.name}
                                      className="h-14 w-14 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[var(--border-color)]">
                                      <ImageIcon
                                        size={20}
                                        className="text-[var(--text-secondary)]"
                                      />
                                    </div>
                                  )}

                                  {/* ITEM INFORMATION */}
                                  <div className="min-w-32 flex-1">
                                    <p className="truncate text-sm font-semibold">
                                      {item.name}
                                    </p>

                                    <p className="text-xs text-[var(--text-secondary)]">
                                      {item.price} {item.currency}
                                    </p>

                                    <p
                                      className={`text-xs ${
                                        item.isAvailable
                                          ? "text-emerald-600"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {item.isAvailable
                                        ? "Available"
                                        : "Sold out"}
                                    </p>
                                  </div>

                                  {/* ITEM ACTIONS */}
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      disabled={busy}
                                      className={iconButton}
                                      title={
                                        item.isAvailable
                                          ? "Mark sold out"
                                          : "Mark available"
                                      }
                                      onClick={() =>
                                        void execute(
                                          () =>
                                            toggleItemAvailability(
                                              item.id,
                                              item.isAvailable
                                            ),
                                          "Availability updated."
                                        )
                                      }
                                    >
                                      {item.isAvailable ? (
                                        <Eye size={15} />
                                      ) : (
                                        <EyeOff size={15} />
                                      )}
                                    </button>

                                    <button
                                      type="button"
                                      className={iconButton}
                                      title="Edit item"
                                      onClick={() =>
                                        openModal({
                                          kind: "edit-item",
                                          item,
                                        })
                                      }
                                    >
                                      <Pencil size={15} />
                                    </button>

                                    <button
                                      type="button"
                                      disabled={busy}
                                      className={iconButton}
                                      title="Duplicate item"
                                      onClick={() =>
                                        void execute(
                                          () =>
                                            duplicateMenuItem(item.id),
                                          "Item duplicated."
                                        )
                                      }
                                    >
                                      <Copy size={15} />
                                    </button>

                                    <button
                                      type="button"
                                      disabled={busy}
                                      className={`${iconButton} text-red-500`}
                                      title="Delete item"
                                      onClick={() =>
                                        void removeItem(item)
                                      }
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}

                            {/* ADD ITEM TO CATEGORY */}
                            <button
                              type="button"
                              onClick={() =>
                                openModal({
                                  kind: "create-item",
                                  category,
                                })
                              }
                              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border-color)] py-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                              <Plus size={15} />
                              Add Item to {category.name}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !busy) {
              closeModal()
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={
              modal.kind.includes("menu")
                ? "Menu editor"
                : "Item editor"
            }
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-2xl sm:p-6"
          >
            {/* MODAL HEADER */}
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {modal.kind === "create-menu"
                  ? "Create Menu"
                  : modal.kind === "edit-menu"
                    ? "Edit Menu"
                    : modal.kind === "create-item"
                      ? "Add Menu Item"
                      : "Edit Menu Item"}
              </h2>

              <button
                type="button"
                disabled={busy}
                onClick={closeModal}
                aria-label="Close"
                className={iconButton}
              >
                <X size={18} />
              </button>
            </div>

            {modal.kind === "create-menu" ||
            modal.kind === "edit-menu" ? (

              /* MENU FORM */
              <form
                onSubmit={submitMenu}
                className="space-y-4"
              >
                <label className={label}>
                  Menu Name
                  <input
                    required
                    name="name"
                    defaultValue={
                      modal.kind === "edit-menu"
                        ? modal.menu.name
                        : ""
                    }
                    placeholder="e.g. Breakfast Menu"
                    className={field}
                  />
                </label>

                <label className={label}>
                  Description
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={
                      modal.kind === "edit-menu"
                        ? modal.menu.description ?? ""
                        : ""
                    }
                    placeholder="Optional menu description"
                    className={field}
                  />
                </label>

                {modal.kind === "edit-menu" && (
                  <ImageInput
                    name="imageUrl"
                    initial={modal.menu.imageUrl ?? ""}
                    onImage={setImage}
                    resetKey={`menu-${modal.menu.id}`}
                  />
                )}

                {modal.kind === "create-menu" && (
                  <p className="rounded-lg bg-[var(--main-bg)] p-3 text-xs text-[var(--text-secondary)]">
                    Next, add categories and items. A blank menu
                    is created first.
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={closeModal}
                    className={iconButton}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {busy
                      ? "Saving..."
                      : modal.kind === "create-menu"
                        ? "Create Menu"
                        : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (

              /* ITEM FORM */
              <form
                onSubmit={submitItem}
                className="space-y-4"
              >
                {modal.kind === "edit-item" && (
                  <input
                    type="hidden"
                    name="id"
                    value={modal.item.id}
                  />
                )}

                <label className={label}>
                  Category
                  <select
                    name="categoryId"
                    required
                    defaultValue={
                      modal.kind === "create-item"
                        ? modal.category.id
                        : modal.item.categoryId
                    }
                    className={field}
                  >
                    {menus.flatMap((m) =>
                      (m.categories ?? []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {m.name} → {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </label>

                <label className={label}>
                  Item Name
                  <input
                    required
                    name="name"
                    defaultValue={
                      modal.kind === "edit-item"
                        ? modal.item.name
                        : ""
                    }
                    placeholder="e.g. Cappuccino"
                    className={field}
                  />
                </label>

                <div className="grid grid-cols-3 gap-3">
                  <label className={`${label} col-span-2`}>
                    Price
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      name="price"
                      defaultValue={
                        modal.kind === "edit-item"
                          ? modal.item.price
                          : ""
                      }
                      placeholder="0.00"
                      className={field}
                    />
                  </label>

                  <label className={label}>
                    Currency
                    <input
                      name="currency"
                      required
                      defaultValue={
                        modal.kind === "edit-item"
                          ? modal.item.currency
                          : "ETB"
                      }
                      className={field}
                    />
                  </label>
                </div>

                <label className={label}>
                  Description
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={
                      modal.kind === "edit-item"
                        ? modal.item.description ?? ""
                        : ""
                    }
                    className={field}
                  />
                </label>

                <ImageInput
                  name="imageUrl"
                  initial={
                    modal.kind === "edit-item"
                      ? modal.item.imageUrl ?? ""
                      : ""
                  }
                  onImage={setImage}
                  resetKey={
                    modal.kind === "edit-item"
                      ? `item-${modal.item.id}`
                      : `new-${modal.category.id}`
                  }
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={closeModal}
                    className={iconButton}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {busy
                      ? "Saving..."
                      : modal.kind === "create-item"
                        ? "Add Item"
                        : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}