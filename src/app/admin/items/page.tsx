import { redirect } from "next/navigation"

// Items are now managed inside Menus & Categories.
export default function ItemsPage() {
  redirect("/admin/menus")
}