"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

const options: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
]

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system")

  useEffect(() => setTheme((localStorage.getItem("theme") as Theme) || "system"), [])

  function selectTheme(nextTheme: Theme) {
    setTheme(nextTheme)
    localStorage.setItem("theme", nextTheme)
    const dark = nextTheme === "dark" || (nextTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    document.documentElement.classList.toggle("dark", dark)
  }

  return <div className="flex items-center rounded-lg border border-slate-700 p-1" aria-label="Color theme">
    {options.map(({ value, label, Icon }) => <button key={value} type="button" onClick={() => selectTheme(value)} title={label} aria-label={`${label} theme`} className={`rounded-md p-1.5 transition ${theme === value ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}><Icon className="h-3.5 w-3.5" /></button>)}
  </div>
}
