"use client"

import { useState } from "react"
import { Utensils, MapPin, Phone, Mail, Languages, Image as ImageIcon } from "lucide-react"

export default function MenuClientView({
  business,
  branding,
  menus = [],
}: {
  business: any
  branding: any
  menus: any[]
}) {
  const [lang, setLang] = useState<"en" | "am" | "oro">("en")

  // Fallback styling tokens from branding settings
  const primaryColor = branding?.primaryColor || "#0F172A"
  const secondaryColor = branding?.secondaryColor || "#F8FAFC"
  const accentColor = branding?.accentColor || "#E2E8F0"

  return (
    <div
      className="min-h-screen pb-16 transition-colors duration-300 relative font-sans text-slate-900"
      style={{ backgroundColor: secondaryColor }}
    >
      {/* Floating Trilingual Language Switcher Pill */}
      <div className="fixed top-3 right-3 z-40 sm:top-4 sm:right-4">
        <div className="bg-white/95 backdrop-blur-md border border-slate-300 rounded-full shadow-lg p-1 flex items-center gap-1">
          <Languages className="w-4 h-4 ml-2 text-slate-700" />
          <button
            onClick={() => setLang("en")}
            className={`px-2.5 py-1 rounded-full text-xs font-extrabold transition ${
              lang === "en" ? "bg-slate-900 text-white shadow-sm" : "text-slate-800 hover:text-slate-950"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("am")}
            className={`px-2.5 py-1 rounded-full text-xs font-extrabold transition ${
              lang === "am" ? "bg-slate-900 text-white shadow-sm" : "text-slate-800 hover:text-slate-950"
            }`}
          >
            አማ
          </button>
          <button
            onClick={() => setLang("oro")}
            className={`px-2.5 py-1 rounded-full text-xs font-extrabold transition ${
              lang === "oro" ? "bg-slate-900 text-white shadow-sm" : "text-slate-800 hover:text-slate-950"
            }`}
          >
            ORO
          </button>
        </div>
      </div>

      {/* Cover Banner & Logo Header */}
      <div
        className="relative h-60 sm:h-72 bg-slate-800 bg-cover bg-center flex items-end justify-center pb-8 shadow-md"
        style={{
          backgroundImage: branding?.coverImageUrl ? `url(${branding.coverImageUrl})` : undefined,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center text-center px-4 space-y-2">
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={business?.name || "Business Logo"}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white object-cover bg-white shadow-xl"
            />
          ) : (
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white text-white flex items-center justify-center font-black text-xl shadow-xl"
              style={{ backgroundColor: primaryColor }}
            >
              {business?.name ? business.name.slice(0, 2).toUpperCase() : "DM"}
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
            {business?.name || "Menu Preview"}
          </h1>
          {business?.type && (
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full border border-white/20">
              {business.type}
            </span>
          )}
        </div>
      </div>

      {/* Business Info Bar */}
      <div className="max-w-3xl mx-auto px-4 -mt-5 relative z-20">
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200 flex flex-wrap items-center justify-around gap-4 text-xs font-semibold text-slate-700">
          {business?.address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span>{business.address}</span>
            </div>
          )}
          {business?.phone && (
            <a href={`tel:${business.phone}`} className="flex items-center gap-1.5 hover:text-slate-900 transition">
              <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span>{business.phone}</span>
            </a>
          )}
          {business?.email && (
            <a href={`mailto:${business.email}`} className="flex items-center gap-1.5 hover:text-slate-900 transition">
              <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span>{business.email}</span>
            </a>
          )}
        </div>

        {business?.description && (
          <p className="text-center text-xs sm:text-sm text-slate-600 mt-4 px-4 leading-relaxed font-medium">
            {business.description}
          </p>
        )}
      </div>

      {/* Menus & Categories Feed */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-10">
        {!menus || menus.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center border border-slate-200 shadow-sm space-y-2">
            <Utensils className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">
              {lang === "am" ? "ሜኑው በአሁኑ ጊዜ የለም" : lang === "oro" ? "Menuun Amma Hin Argamu" : "Menu Currently Unavailable"}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === "am"
                ? "እባክዎ ቆይተው እንደገና ይሞክሩ።"
                : lang === "oro"
                ? "Mee xiqqoo turaatii irra deebi'aa yaala."
                : "Please check back soon or ask our staff for assistance."}
            </p>
          </div>
        ) : (
          menus.map((menu) => (
            <div key={menu.id || menu.name} className="space-y-6">
              {menus.length > 1 && (
                <div className="border-b-2 pb-2" style={{ borderColor: primaryColor }}>
                  <h2 className="text-xl font-extrabold uppercase tracking-wide" style={{ color: primaryColor }}>
                    {menu.name}
                  </h2>
                </div>
              )}

              {menu.categories?.map((category: any) => {
                const categoryItems = category.items || []

                return (
                  <div key={category.id || category.name} className="space-y-4">
                    <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: accentColor }}>
                      <h3
                        className="text-sm font-black uppercase tracking-wider px-1"
                        style={{ color: primaryColor }}
                      >
                        {category.name}
                      </h3>
                      <div className="h-[1px] flex-1 bg-slate-200"></div>
                    </div>

                    {categoryItems.length === 0 ? (
                      <p className="text-xs text-slate-400 italic px-1">No items in this category.</p>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                        {categoryItems.map((item: any) => {
                          // Resolve trilingual display name and description
                          let displayName = item.name
                          let displayDesc = item.description

                          if (lang === "am") {
                            displayName = item.nameAmharic || item.name
                            displayDesc = item.descAmharic || item.description
                          } else if (lang === "oro") {
                            displayName = item.nameOromo || item.name
                            displayDesc = item.descOromo || item.description
                          }

                          return (
                            <div
                              key={item.id}
                              className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col sm:flex-row sm:items-stretch transition hover:shadow-md"
                              style={{ borderColor: accentColor }}
                            >
                              <div className="order-2 sm:order-1 p-4 space-y-2 flex-1 min-w-0 flex flex-col">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                                  {displayName}
                                  </h4>
                                  <span className="shrink-0 text-sm font-black whitespace-nowrap" style={{ color: primaryColor }}>
                                    {Number(item.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px]">{item.currency || "ETB"}</span>
                                  </span>
                                </div>

                                {displayDesc && (
                                  <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                                    {displayDesc}
                                  </p>
                                )}

                                <span className="mt-auto pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{category.name}</span>
                              </div>

                              {/* Item Image with Fallback */}
                              <div className="order-1 sm:order-2 relative w-full h-44 sm:w-32 sm:h-auto sm:min-h-32 bg-slate-100 flex-shrink-0">
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400"><ImageIcon className="w-8 h-8" /></div>
                                {item.imageUrl && <img src={item.imageUrl} alt={displayName} className="relative w-full h-full min-h-36 sm:min-h-32 object-cover" onError={(event) => { event.currentTarget.style.display = "none" }} />}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>

      <footer className="mt-16 text-center space-y-1">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          Powered by Digital Menu Platform
        </p>
      </footer>
    </div>
  )
}
