/**
 * 10 college/university HTML page templates.
 * Each covers a typical college website page with a distinct layout.
 *
 * Placeholder convention:
 *   [SITE_NAME]     → college / institution name
 *   [PAGE_TITLE]    → <title> tag text
 *   [NAV_LINKS]     → <a href="/slug">Name</a> list
 *   [YEAR]          → current year
 *   All other [XXX] → content the AI fills in from the prompt
 */

export type TemplateType =
  | "college-home" // Home: hero + quick stats + programs + news + events
  | "college-admissions" // Admissions: apply steps + requirements + deadline
  | "college-programs" // Programs: department cards + course list grid
  | "college-faculty" // Faculty: profile cards + department tabs + bio
  | "college-about" // About: history + vision/mission + accreditation + rankings
  | "college-campus" // Campus Life: facilities + clubs + gallery
  | "college-events" // Events & News: event cards + latest news
  | "college-contact" // Contact: enquiry form + departments + map
  | "college-placements" // Placements: stats + top recruiters + alumni
  | "college-gallery"; // Gallery: photo grid of campus & events

export const TEMPLATE_DESCRIPTIONS: Record<TemplateType, string> = {
  "college-home":
    "Homepage with hero, stats, programs overview, news, and events",
  "college-admissions":
    "Admissions page with apply steps, requirements, and deadline",
  "college-programs":
    "Programs/courses listing with department cards and details",
  "college-faculty":
    "Faculty directory with profile cards, bios, and departments",
  "college-about":
    "About page with history, vision, mission, and accreditation",
  "college-campus": "Campus life with facilities, clubs, and gallery",
  "college-events": "Events and news listing with dates and categories",
  "college-contact": "Contact page with enquiry form, departments, and map",
  "college-placements":
    "Placements page with stats, top recruiters, and alumni stories",
  "college-gallery": "Photo gallery of campus, events, and achievements",
};

export function suggestTemplate(name: string, purpose: string): TemplateType {
  const t = (name + " " + purpose).toLowerCase();
  if (/home|landing|main|index|welcome/.test(t)) return "college-home";
  if (/admiss|apply|enroll|join|application|registr/.test(t))
    return "college-admissions";
  if (/program|course|department|curriculum|degree|stream|branch/.test(t))
    return "college-programs";
  if (/faculty|professor|staff|teacher|lecturer|academic/.test(t))
    return "college-faculty";
  if (/about|history|mission|vision|accred|overview|background/.test(t))
    return "college-about";
  if (/campus|life|facilit|club|hostel|sport|amenity/.test(t))
    return "college-campus";
  if (/event|news|notice|announc|calendar|happenings/.test(t))
    return "college-events";
  if (/contact|reach|locat|address|enquir|support/.test(t))
    return "college-contact";
  if (/placement|career|recruit|compan|alumni|job|internship/.test(t))
    return "college-placements";
  if (/gallery|photo|image|picture|media/.test(t)) return "college-gallery";
  return "college-home";
}

export function getTemplate(type: string): string {
  return TEMPLATES[type as TemplateType] ?? TEMPLATES["college-home"];
}

// ─────────────────────────────────────────────────────────────────────────────

const HEAD = (title: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap" rel="stylesheet" />
  <script>tailwind.config={theme:{extend:{fontFamily:{sans:['Inter','sans-serif']}}}}</script>
</head>`;

/**
 * Single shared navbar injected into every page template.
 * All pages share the same dark-blue nav so navigation feels consistent.
 * [LOGO_ABBR], [SITE_NAME], [NAV_LINKS] are filled server-side / by AI.
 */
const SHARED_NAV = `
  <!-- NAVBAR: same on every page for consistent branding -->
  <nav class="bg-blue-900 text-white sticky top-0 z-50 shadow-md">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3 shrink-0">
        <div class="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-black text-sm">[LOGO_ABBR]</div>
        <span class="font-black text-lg leading-tight">[SITE_NAME]</span>
      </div>
      <div class="hidden md:flex items-center gap-6 text-sm font-semibold text-blue-100">[NAV_LINKS]</div>
    </div>
  </nav>`;

export const TEMPLATES: Record<TemplateType, string> = {
  // ─── 1. COLLEGE HOME ────────────────────────────────────────────────────
  "college-home":
    HEAD("[PAGE_TITLE]") +
    `
<body class="bg-white text-gray-900 font-sans m-0">

  <!-- TOP BAR: notice / contact strip -->
  <div class="bg-blue-800 text-white text-xs py-2">
    <div class="max-w-7xl mx-auto px-6 flex items-center justify-between">
      <span>&#128222; [TOPBAR_PHONE] &nbsp;|&nbsp; &#128140; [TOPBAR_EMAIL]</span>
      <span>[TOPBAR_NOTICE]</span>
    </div>
  </div>

${SHARED_NAV}

  <!-- HERO: college banner -->
  <section class="relative bg-blue-900 text-white overflow-hidden">
    <img src="https://picsum.photos/seed/[HERO_IMG]/1400/600" class="absolute inset-0 w-full h-full object-cover opacity-25" onerror="this.src='https://picsum.photos/seed/university/1400/600'"/>
    <div class="relative z-10 max-w-7xl mx-auto px-6 py-28 text-center">
      <p class="text-blue-300 text-sm font-black uppercase tracking-[0.25em] mb-4">[ESTABLISHED]</p>
      <h1 class="text-5xl md:text-7xl font-black leading-tight mb-5">[HERO_H1]</h1>
      <p class="text-blue-100 text-xl max-w-2xl mx-auto mb-10">[HERO_SUBTITLE]</p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="[HERO_CTA1_LINK]" class="h-13 px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-black text-sm transition-all hover:scale-105 shadow-xl">[HERO_CTA1]</a>
        <a href="[HERO_CTA2_LINK]" class="h-13 px-8 py-3 rounded-xl border-2 border-white/30 hover:bg-white/10 text-white font-bold text-sm transition">[HERO_CTA2]</a>
      </div>
    </div>
  </section>

  <!-- QUICK STATS -->
  <section class="bg-blue-700 text-white py-10">
    <div class="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      <div><p class="text-4xl font-black text-amber-300">[STAT1_N]</p><p class="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">[STAT1_L]</p></div>
      <div><p class="text-4xl font-black text-amber-300">[STAT2_N]</p><p class="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">[STAT2_L]</p></div>
      <div><p class="text-4xl font-black text-amber-300">[STAT3_N]</p><p class="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">[STAT3_L]</p></div>
      <div><p class="text-4xl font-black text-amber-300">[STAT4_N]</p><p class="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">[STAT4_L]</p></div>
    </div>
  </section>

  <!-- PROGRAMS OVERVIEW -->
  <section class="py-20 max-w-7xl mx-auto px-6">
    <div class="text-center mb-12">
      <h2 class="text-4xl font-black text-blue-900 mb-3">[PROG_H2]</h2>
      <p class="text-gray-500 max-w-xl mx-auto">[PROG_SUBTITLE]</p>
    </div>
    <div class="grid md:grid-cols-4 gap-5">
      <a href="[PROG1_LINK]" class="group p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all text-center">
        <div class="text-3xl mb-3">[PROG1_ICON]</div>
        <h3 class="font-black text-base text-gray-900 mb-1">[PROG1_NAME]</h3>
        <p class="text-gray-400 text-xs">[PROG1_DETAIL]</p>
      </a>
      <a href="[PROG2_LINK]" class="group p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all text-center">
        <div class="text-3xl mb-3">[PROG2_ICON]</div>
        <h3 class="font-black text-base text-gray-900 mb-1">[PROG2_NAME]</h3>
        <p class="text-gray-400 text-xs">[PROG2_DETAIL]</p>
      </a>
      <a href="[PROG3_LINK]" class="group p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all text-center">
        <div class="text-3xl mb-3">[PROG3_ICON]</div>
        <h3 class="font-black text-base text-gray-900 mb-1">[PROG3_NAME]</h3>
        <p class="text-gray-400 text-xs">[PROG3_DETAIL]</p>
      </a>
      <a href="[PROG4_LINK]" class="group p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all text-center">
        <div class="text-3xl mb-3">[PROG4_ICON]</div>
        <h3 class="font-black text-base text-gray-900 mb-1">[PROG4_NAME]</h3>
        <p class="text-gray-400 text-xs">[PROG4_DETAIL]</p>
      </a>
    </div>
  </section>

  <!-- NEWS + EVENTS -->
  <section class="bg-gray-50 py-20">
    <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
      <!-- Latest News -->
      <div>
        <h2 class="text-2xl font-black text-blue-900 mb-6">[NEWS_H2]</h2>
        <div class="space-y-4">
          <div class="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition"><p class="text-xs text-blue-600 font-bold mb-1">[NEWS1_DATE]</p><h3 class="font-black text-sm mb-1">[NEWS1_TITLE]</h3><p class="text-gray-500 text-xs">[NEWS1_EXCERPT]</p></div>
          <div class="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition"><p class="text-xs text-blue-600 font-bold mb-1">[NEWS2_DATE]</p><h3 class="font-black text-sm mb-1">[NEWS2_TITLE]</h3><p class="text-gray-500 text-xs">[NEWS2_EXCERPT]</p></div>
          <div class="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition"><p class="text-xs text-blue-600 font-bold mb-1">[NEWS3_DATE]</p><h3 class="font-black text-sm mb-1">[NEWS3_TITLE]</h3><p class="text-gray-500 text-xs">[NEWS3_EXCERPT]</p></div>
        </div>
      </div>
      <!-- Upcoming Events -->
      <div>
        <h2 class="text-2xl font-black text-blue-900 mb-6">[EVT_H2]</h2>
        <div class="space-y-4">
          <div class="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 hover:shadow-md transition"><div class="w-14 h-14 rounded-xl bg-blue-700 text-white flex flex-col items-center justify-center shrink-0"><p class="text-lg font-black leading-none">[EVT1_DAY]</p><p class="text-[10px] font-bold uppercase">[EVT1_MON]</p></div><div><h3 class="font-black text-sm mb-1">[EVT1_TITLE]</h3><p class="text-gray-400 text-xs">[EVT1_DESC]</p></div></div>
          <div class="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 hover:shadow-md transition"><div class="w-14 h-14 rounded-xl bg-amber-500 text-white flex flex-col items-center justify-center shrink-0"><p class="text-lg font-black leading-none">[EVT2_DAY]</p><p class="text-[10px] font-bold uppercase">[EVT2_MON]</p></div><div><h3 class="font-black text-sm mb-1">[EVT2_TITLE]</h3><p class="text-gray-400 text-xs">[EVT2_DESC]</p></div></div>
          <div class="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 hover:shadow-md transition"><div class="w-14 h-14 rounded-xl bg-green-600 text-white flex flex-col items-center justify-center shrink-0"><p class="text-lg font-black leading-none">[EVT3_DAY]</p><p class="text-[10px] font-bold uppercase">[EVT3_MON]</p></div><div><h3 class="font-black text-sm mb-1">[EVT3_TITLE]</h3><p class="text-gray-400 text-xs">[EVT3_DESC]</p></div></div>
        </div>
      </div>
    </div>
  </section>

  <!-- APPLY CTA BANNER -->
  <section class="bg-blue-900 text-white py-16 text-center px-6">
    <h2 class="text-4xl font-black mb-3">[CTA_H2]</h2>
    <p class="text-blue-200 mb-8 max-w-lg mx-auto">[CTA_SUB]</p>
    <a href="[CTA_LINK]" class="inline-flex items-center h-13 px-10 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-black transition-all hover:scale-105">[CTA_BTN]</a>
  </section>

  <!-- FOOTER -->
  <footer class="bg-gray-900 text-white py-12">
    <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
      <div><p class="font-black text-lg mb-3">[SITE_NAME]</p><p class="text-gray-400 text-sm leading-relaxed">[FOOTER_ADDRESS]</p></div>
      <div><p class="font-black text-sm uppercase tracking-widest mb-4 text-gray-300">Quick Links</p><div class="space-y-2 text-sm text-gray-400">[NAV_LINKS]</div></div>
      <div><p class="font-black text-sm uppercase tracking-widest mb-4 text-gray-300">Contact</p><p class="text-gray-400 text-sm">[FOOTER_PHONE]</p><p class="text-gray-400 text-sm">[FOOTER_EMAIL]</p></div>
    </div>
    <div class="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-xs">© [YEAR] [SITE_NAME]. All rights reserved.</div>
  </footer>
</body></html>`,

  // ─── 2. COLLEGE ADMISSIONS ───────────────────────────────────────────────
  "college-admissions":
    HEAD("[PAGE_TITLE]") +
    `
<body class="bg-white text-gray-900 font-sans m-0">

${SHARED_NAV}

  <!-- HERO -->
  <section class="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-20 text-center px-6">
    <p class="text-amber-400 text-xs font-black uppercase tracking-[0.3em] mb-4">[ADMISSIONS_SESSION]</p>
    <h1 class="text-5xl font-black mb-4">[ADMISSIONS_H1]</h1>
    <p class="text-blue-100 text-xl max-w-2xl mx-auto mb-10">[ADMISSIONS_SUBTITLE]</p>
    <a href="[APPLY_NOW_LINK]" class="inline-flex items-center h-14 px-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-black text-sm transition-all hover:scale-105 shadow-2xl shadow-blue-900">[APPLY_NOW_BTN]</a>
  </section>

  <!-- DEADLINE BANNER -->
  <div class="bg-amber-50 border-y border-amber-200 py-4 text-center">
    <p class="text-amber-800 font-bold text-sm">&#128197; <strong>[DEADLINE_LABEL]:</strong> [DEADLINE_DATE] &nbsp;|&nbsp; &#128222; [HELPLINE_LABEL]: [HELPLINE_NUM]</p>
  </div>

  <!-- HOW TO APPLY: steps -->
  <section class="max-w-6xl mx-auto px-6 py-20">
    <h2 class="text-3xl font-black text-blue-900 text-center mb-12">[STEPS_H2]</h2>
    <div class="grid md:grid-cols-4 gap-6">
      <div class="text-center relative"><div class="w-14 h-14 rounded-full bg-blue-700 text-white font-black text-xl flex items-center justify-center mx-auto mb-4">1</div><h3 class="font-black text-base mb-2">[STEP1_TITLE]</h3><p class="text-gray-500 text-sm">[STEP1_DESC]</p></div>
      <div class="text-center"><div class="w-14 h-14 rounded-full bg-blue-700 text-white font-black text-xl flex items-center justify-center mx-auto mb-4">2</div><h3 class="font-black text-base mb-2">[STEP2_TITLE]</h3><p class="text-gray-500 text-sm">[STEP2_DESC]</p></div>
      <div class="text-center"><div class="w-14 h-14 rounded-full bg-blue-700 text-white font-black text-xl flex items-center justify-center mx-auto mb-4">3</div><h3 class="font-black text-base mb-2">[STEP3_TITLE]</h3><p class="text-gray-500 text-sm">[STEP3_DESC]</p></div>
      <div class="text-center"><div class="w-14 h-14 rounded-full bg-amber-500 text-white font-black text-xl flex items-center justify-center mx-auto mb-4">4</div><h3 class="font-black text-base mb-2">[STEP4_TITLE]</h3><p class="text-gray-500 text-sm">[STEP4_DESC]</p></div>
    </div>
  </section>

  <!-- ELIGIBILITY + DOCUMENTS -->
  <section class="bg-gray-50 py-20 px-6">
    <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
      <div class="bg-white rounded-3xl border border-gray-100 p-8">
        <h3 class="text-2xl font-black text-blue-900 mb-6">[ELIG_H3]</h3>
        <ul class="space-y-3">
          <li class="flex gap-3 text-sm"><span class="text-green-500 mt-0.5 shrink-0">✓</span><span>[ELIG1]</span></li>
          <li class="flex gap-3 text-sm"><span class="text-green-500 mt-0.5 shrink-0">✓</span><span>[ELIG2]</span></li>
          <li class="flex gap-3 text-sm"><span class="text-green-500 mt-0.5 shrink-0">✓</span><span>[ELIG3]</span></li>
          <li class="flex gap-3 text-sm"><span class="text-green-500 mt-0.5 shrink-0">✓</span><span>[ELIG4]</span></li>
          <li class="flex gap-3 text-sm"><span class="text-green-500 mt-0.5 shrink-0">✓</span><span>[ELIG5]</span></li>
        </ul>
      </div>
      <div class="bg-white rounded-3xl border border-gray-100 p-8">
        <h3 class="text-2xl font-black text-blue-900 mb-6">[DOCS_H3]</h3>
        <ul class="space-y-3">
          <li class="flex gap-3 text-sm"><span class="text-blue-500 mt-0.5 shrink-0">&#128196;</span><span>[DOC1]</span></li>
          <li class="flex gap-3 text-sm"><span class="text-blue-500 mt-0.5 shrink-0">&#128196;</span><span>[DOC2]</span></li>
          <li class="flex gap-3 text-sm"><span class="text-blue-500 mt-0.5 shrink-0">&#128196;</span><span>[DOC3]</span></li>
          <li class="flex gap-3 text-sm"><span class="text-blue-500 mt-0.5 shrink-0">&#128196;</span><span>[DOC4]</span></li>
          <li class="flex gap-3 text-sm"><span class="text-blue-500 mt-0.5 shrink-0">&#128196;</span><span>[DOC5]</span></li>
        </ul>
      </div>
    </div>
  </section>

  <!-- PROGRAMS OFFERED -->
  <section class="max-w-6xl mx-auto px-6 py-20">
    <h2 class="text-3xl font-black text-blue-900 text-center mb-10">[PGMS_H2]</h2>
    <div class="grid md:grid-cols-3 gap-5">
      <div class="rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition"><h3 class="font-black text-base mb-1">[PGM1_NAME]</h3><p class="text-gray-400 text-xs mb-3">[PGM1_DURATION] &nbsp;|&nbsp; [PGM1_SEATS] Seats</p><a href="[PGM1_LINK]" class="text-blue-600 text-xs font-bold hover:underline">Know More →</a></div>
      <div class="rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition"><h3 class="font-black text-base mb-1">[PGM2_NAME]</h3><p class="text-gray-400 text-xs mb-3">[PGM2_DURATION] &nbsp;|&nbsp; [PGM2_SEATS] Seats</p><a href="[PGM2_LINK]" class="text-blue-600 text-xs font-bold hover:underline">Know More →</a></div>
      <div class="rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition"><h3 class="font-black text-base mb-1">[PGM3_NAME]</h3><p class="text-gray-400 text-xs mb-3">[PGM3_DURATION] &nbsp;|&nbsp; [PGM3_SEATS] Seats</p><a href="[PGM3_LINK]" class="text-blue-600 text-xs font-bold hover:underline">Know More →</a></div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="bg-gray-50 py-16 px-6">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl font-black text-center text-blue-900 mb-8">[FAQ_H2]</h2>
      <div class="space-y-3">
        <details class="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer"><summary class="font-bold text-sm list-none">[FAQ1_Q]</summary><p class="text-gray-500 text-sm mt-3">[FAQ1_A]</p></details>
        <details class="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer"><summary class="font-bold text-sm list-none">[FAQ2_Q]</summary><p class="text-gray-500 text-sm mt-3">[FAQ2_A]</p></details>
        <details class="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer"><summary class="font-bold text-sm list-none">[FAQ3_Q]</summary><p class="text-gray-500 text-sm mt-3">[FAQ3_A]</p></details>
      </div>
    </div>
  </section>

  <footer class="bg-blue-900 text-white py-10 text-center">
    <p class="font-black text-lg mb-2">[SITE_NAME]</p>
    <div class="flex justify-center gap-6 text-blue-300 text-sm mb-4">[NAV_LINKS]</div>
    <p class="text-blue-400 text-xs">© [YEAR] [SITE_NAME]</p>
  </footer>
</body></html>`,

  // ─── 3. COLLEGE PROGRAMS ─────────────────────────────────────────────────
  "college-programs":
    HEAD("[PAGE_TITLE]") +
    `
<body class="bg-gray-50 text-gray-900 font-sans m-0">

${SHARED_NAV}

  <!-- HEADER -->
  <div class="bg-blue-800 text-white py-16 text-center px-6">
    <h1 class="text-5xl font-black mb-3">[PROGRAMS_H1]</h1>
    <p class="text-blue-200 max-w-2xl mx-auto">[PROGRAMS_SUBTITLE]</p>
  </div>

  <!-- FILTER TABS -->
  <div class="bg-white border-b border-gray-100 py-4 px-6">
    <div class="max-w-7xl mx-auto flex gap-3 overflow-x-auto">
      <button class="h-9 px-5 rounded-full bg-blue-700 text-white text-xs font-black whitespace-nowrap">[TAB1]</button>
      <button class="h-9 px-5 rounded-full border border-gray-200 text-gray-600 text-xs font-semibold whitespace-nowrap hover:bg-gray-50">[TAB2]</button>
      <button class="h-9 px-5 rounded-full border border-gray-200 text-gray-600 text-xs font-semibold whitespace-nowrap hover:bg-gray-50">[TAB3]</button>
      <button class="h-9 px-5 rounded-full border border-gray-200 text-gray-600 text-xs font-semibold whitespace-nowrap hover:bg-gray-50">[TAB4]</button>
    </div>
  </div>

  <!-- PROGRAMS GRID -->
  <section class="max-w-7xl mx-auto px-6 py-16">
    <div class="grid md:grid-cols-3 gap-6">
      <div class="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div class="h-2 bg-blue-700"></div>
        <div class="p-7"><div class="text-3xl mb-4">[C1_ICON]</div><p class="text-xs font-black uppercase tracking-widest text-blue-600 mb-2">[C1_TYPE]</p><h3 class="text-xl font-black mb-2">[C1_NAME]</h3><p class="text-gray-500 text-sm leading-relaxed mb-5">[C1_DESC]</p><div class="flex gap-4 text-xs font-semibold text-gray-400 mb-6"><span>&#128336; [C1_DUR]</span><span>&#127979; [C1_SEATS] Seats</span></div><a href="[C1_LINK]" class="block w-full h-10 rounded-xl bg-blue-50 hover:bg-blue-700 hover:text-white text-blue-700 font-bold text-xs text-center leading-10 transition">View Details</a></div>
      </div>
      <div class="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div class="h-2 bg-amber-500"></div>
        <div class="p-7"><div class="text-3xl mb-4">[C2_ICON]</div><p class="text-xs font-black uppercase tracking-widest text-amber-600 mb-2">[C2_TYPE]</p><h3 class="text-xl font-black mb-2">[C2_NAME]</h3><p class="text-gray-500 text-sm leading-relaxed mb-5">[C2_DESC]</p><div class="flex gap-4 text-xs font-semibold text-gray-400 mb-6"><span>&#128336; [C2_DUR]</span><span>&#127979; [C2_SEATS] Seats</span></div><a href="[C2_LINK]" class="block w-full h-10 rounded-xl bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-700 font-bold text-xs text-center leading-10 transition">View Details</a></div>
      </div>
      <div class="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div class="h-2 bg-green-600"></div>
        <div class="p-7"><div class="text-3xl mb-4">[C3_ICON]</div><p class="text-xs font-black uppercase tracking-widest text-green-600 mb-2">[C3_TYPE]</p><h3 class="text-xl font-black mb-2">[C3_NAME]</h3><p class="text-gray-500 text-sm leading-relaxed mb-5">[C3_DESC]</p><div class="flex gap-4 text-xs font-semibold text-gray-400 mb-6"><span>&#128336; [C3_DUR]</span><span>&#127979; [C3_SEATS] Seats</span></div><a href="[C3_LINK]" class="block w-full h-10 rounded-xl bg-green-50 hover:bg-green-600 hover:text-white text-green-700 font-bold text-xs text-center leading-10 transition">View Details</a></div>
      </div>
      <div class="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div class="h-2 bg-purple-600"></div>
        <div class="p-7"><div class="text-3xl mb-4">[C4_ICON]</div><p class="text-xs font-black uppercase tracking-widest text-purple-600 mb-2">[C4_TYPE]</p><h3 class="text-xl font-black mb-2">[C4_NAME]</h3><p class="text-gray-500 text-sm leading-relaxed mb-5">[C4_DESC]</p><div class="flex gap-4 text-xs font-semibold text-gray-400 mb-6"><span>&#128336; [C4_DUR]</span><span>&#127979; [C4_SEATS] Seats</span></div><a href="[C4_LINK]" class="block w-full h-10 rounded-xl bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 font-bold text-xs text-center leading-10 transition">View Details</a></div>
      </div>
      <div class="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div class="h-2 bg-red-600"></div>
        <div class="p-7"><div class="text-3xl mb-4">[C5_ICON]</div><p class="text-xs font-black uppercase tracking-widest text-red-600 mb-2">[C5_TYPE]</p><h3 class="text-xl font-black mb-2">[C5_NAME]</h3><p class="text-gray-500 text-sm leading-relaxed mb-5">[C5_DESC]</p><div class="flex gap-4 text-xs font-semibold text-gray-400 mb-6"><span>&#128336; [C5_DUR]</span><span>&#127979; [C5_SEATS] Seats</span></div><a href="[C5_LINK]" class="block w-full h-10 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-700 font-bold text-xs text-center leading-10 transition">View Details</a></div>
      </div>
      <div class="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div class="h-2 bg-teal-600"></div>
        <div class="p-7"><div class="text-3xl mb-4">[C6_ICON]</div><p class="text-xs font-black uppercase tracking-widest text-teal-600 mb-2">[C6_TYPE]</p><h3 class="text-xl font-black mb-2">[C6_NAME]</h3><p class="text-gray-500 text-sm leading-relaxed mb-5">[C6_DESC]</p><div class="flex gap-4 text-xs font-semibold text-gray-400 mb-6"><span>&#128336; [C6_DUR]</span><span>&#127979; [C6_SEATS] Seats</span></div><a href="[C6_LINK]" class="block w-full h-10 rounded-xl bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-700 font-bold text-xs text-center leading-10 transition">View Details</a></div>
      </div>
    </div>
  </section>

  <footer class="bg-gray-900 text-white py-10">
    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <span class="font-black text-lg">[SITE_NAME]</span>
      <div class="flex gap-6 text-white/50 text-sm">[NAV_LINKS]</div>
      <span class="text-white/30 text-xs">© [YEAR] [SITE_NAME]</span>
    </div>
  </footer>
</body></html>`,

  // ─── 4. COLLEGE FACULTY ──────────────────────────────────────────────────
  "college-faculty":
    HEAD("[PAGE_TITLE]") +
    `
<body class="bg-slate-50 text-gray-900 font-sans m-0">

${SHARED_NAV}

  <!-- HEADER -->
  <div class="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 text-center px-6">
    <h1 class="text-5xl font-black mb-3">[FACULTY_H1]</h1>
    <p class="text-blue-200 max-w-xl mx-auto">[FACULTY_SUBTITLE]</p>
  </div>

  <!-- DEPT FILTER -->
  <div class="bg-white border-b border-gray-100 py-4 px-6">
    <div class="max-w-7xl mx-auto flex flex-wrap gap-3">
      <button class="h-9 px-5 rounded-full bg-blue-700 text-white text-xs font-black">All Departments</button>
      <button class="h-9 px-5 rounded-full border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50">[DEPT1]</button>
      <button class="h-9 px-5 rounded-full border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50">[DEPT2]</button>
      <button class="h-9 px-5 rounded-full border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50">[DEPT3]</button>
      <button class="h-9 px-5 rounded-full border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50">[DEPT4]</button>
    </div>
  </div>

  <!-- FACULTY GRID -->
  <section class="max-w-7xl mx-auto px-6 py-16">
    <div class="grid md:grid-cols-4 gap-6">
      <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
        <div class="h-1 bg-blue-700"></div>
        <div class="p-6"><div class="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-blue-50"><img src="https://picsum.photos/seed/[F1_IMG]/96/96" class="w-full h-full object-cover" onerror="this.src='https://picsum.photos/seed/prof1/96/96'"/></div><h3 class="font-black text-base mb-0.5">[F1_NAME]</h3><p class="text-blue-600 text-xs font-bold mb-1">[F1_DESG]</p><p class="text-gray-400 text-xs mb-3">[F1_DEPT]</p><p class="text-gray-500 text-xs leading-relaxed">[F1_SPEC]</p></div>
      </div>
      <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
        <div class="h-1 bg-blue-700"></div>
        <div class="p-6"><div class="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-blue-50"><img src="https://picsum.photos/seed/[F2_IMG]/96/96" class="w-full h-full object-cover" onerror="this.src='https://picsum.photos/seed/prof2/96/96'"/></div><h3 class="font-black text-base mb-0.5">[F2_NAME]</h3><p class="text-blue-600 text-xs font-bold mb-1">[F2_DESG]</p><p class="text-gray-400 text-xs mb-3">[F2_DEPT]</p><p class="text-gray-500 text-xs leading-relaxed">[F2_SPEC]</p></div>
      </div>
      <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
        <div class="h-1 bg-amber-500"></div>
        <div class="p-6"><div class="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-amber-50"><img src="https://picsum.photos/seed/[F3_IMG]/96/96" class="w-full h-full object-cover" onerror="this.src='https://picsum.photos/seed/prof3/96/96'"/></div><h3 class="font-black text-base mb-0.5">[F3_NAME]</h3><p class="text-amber-600 text-xs font-bold mb-1">[F3_DESG]</p><p class="text-gray-400 text-xs mb-3">[F3_DEPT]</p><p class="text-gray-500 text-xs leading-relaxed">[F3_SPEC]</p></div>
      </div>
      <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
        <div class="h-1 bg-amber-500"></div>
        <div class="p-6"><div class="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-amber-50"><img src="https://picsum.photos/seed/[F4_IMG]/96/96" class="w-full h-full object-cover" onerror="this.src='https://picsum.photos/seed/prof4/96/96'"/></div><h3 class="font-black text-base mb-0.5">[F4_NAME]</h3><p class="text-amber-600 text-xs font-bold mb-1">[F4_DESG]</p><p class="text-gray-400 text-xs mb-3">[F4_DEPT]</p><p class="text-gray-500 text-xs leading-relaxed">[F4_SPEC]</p></div>
      </div>
      <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
        <div class="h-1 bg-green-600"></div>
        <div class="p-6"><div class="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-green-50"><img src="https://picsum.photos/seed/[F5_IMG]/96/96" class="w-full h-full object-cover" onerror="this.src='https://picsum.photos/seed/prof5/96/96'"/></div><h3 class="font-black text-base mb-0.5">[F5_NAME]</h3><p class="text-green-600 text-xs font-bold mb-1">[F5_DESG]</p><p class="text-gray-400 text-xs mb-3">[F5_DEPT]</p><p class="text-gray-500 text-xs leading-relaxed">[F5_SPEC]</p></div>
      </div>
      <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
        <div class="h-1 bg-green-600"></div>
        <div class="p-6"><div class="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-green-50"><img src="https://picsum.photos/seed/[F6_IMG]/96/96" class="w-full h-full object-cover" onerror="this.src='https://picsum.photos/seed/prof6/96/96'"/></div><h3 class="font-black text-base mb-0.5">[F6_NAME]</h3><p class="text-green-600 text-xs font-bold mb-1">[F6_DESG]</p><p class="text-gray-400 text-xs mb-3">[F6_DEPT]</p><p class="text-gray-500 text-xs leading-relaxed">[F6_SPEC]</p></div>
      </div>
      <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
        <div class="h-1 bg-purple-600"></div>
        <div class="p-6"><div class="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-purple-50"><img src="https://picsum.photos/seed/[F7_IMG]/96/96" class="w-full h-full object-cover" onerror="this.src='https://picsum.photos/seed/prof7/96/96'"/></div><h3 class="font-black text-base mb-0.5">[F7_NAME]</h3><p class="text-purple-600 text-xs font-bold mb-1">[F7_DESG]</p><p class="text-gray-400 text-xs mb-3">[F7_DEPT]</p><p class="text-gray-500 text-xs leading-relaxed">[F7_SPEC]</p></div>
      </div>
      <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center">
        <div class="h-1 bg-purple-600"></div>
        <div class="p-6"><div class="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-purple-50"><img src="https://picsum.photos/seed/[F8_IMG]/96/96" class="w-full h-full object-cover" onerror="this.src='https://picsum.photos/seed/prof8/96/96'"/></div><h3 class="font-black text-base mb-0.5">[F8_NAME]</h3><p class="text-purple-600 text-xs font-bold mb-1">[F8_DESG]</p><p class="text-gray-400 text-xs mb-3">[F8_DEPT]</p><p class="text-gray-500 text-xs leading-relaxed">[F8_SPEC]</p></div>
      </div>
    </div>
  </section>

  <footer class="bg-blue-900 text-white py-10">
    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <span class="font-black text-lg">[SITE_NAME]</span>
      <div class="flex flex-wrap gap-6 text-blue-300 text-sm justify-center">[NAV_LINKS]</div>
      <span class="text-blue-400 text-xs">© [YEAR] [SITE_NAME]</span>
    </div>
  </footer>
</body></html>`,

  // ─── 5. COLLEGE ABOUT ────────────────────────────────────────────────────
  "college-about":
    HEAD("[PAGE_TITLE]") +
    `
<body class="bg-stone-50 text-gray-900 font-sans m-0">

${SHARED_NAV}

  <!-- HERO: split -->
  <section class="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
    <div>
      <p class="text-amber-600 text-xs font-black uppercase tracking-[0.3em] mb-4">[ESTD_LABEL] [ESTD_YEAR]</p>
      <h1 class="text-5xl font-black text-blue-900 leading-tight mb-5">[ABOUT_H1]</h1>
      <p class="text-gray-600 leading-relaxed mb-6">[ABOUT_INTRO]</p>
      <a href="[CONTACT_LINK]" class="inline-flex items-center h-12 px-8 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm transition">[ABOUT_CTA]</a>
    </div>
    <div class="rounded-3xl overflow-hidden aspect-[4/3] bg-stone-200 shadow-xl">
      <img src="https://picsum.photos/seed/[CAMPUS_IMG]/800/600" class="w-full h-full object-cover" onerror="this.src='https://picsum.photos/seed/campus/800/600'"/>
    </div>
  </section>

  <!-- STATS STRIP -->
  <section class="bg-blue-800 text-white py-12">
    <div class="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      <div><p class="text-5xl font-black text-amber-400">[ST1_N]</p><p class="text-blue-200 text-xs font-bold uppercase tracking-widest mt-1">[ST1_L]</p></div>
      <div><p class="text-5xl font-black text-amber-400">[ST2_N]</p><p class="text-blue-200 text-xs font-bold uppercase tracking-widest mt-1">[ST2_L]</p></div>
      <div><p class="text-5xl font-black text-amber-400">[ST3_N]</p><p class="text-blue-200 text-xs font-bold uppercase tracking-widest mt-1">[ST3_L]</p></div>
      <div><p class="text-5xl font-black text-amber-400">[ST4_N]</p><p class="text-blue-200 text-xs font-bold uppercase tracking-widest mt-1">[ST4_L]</p></div>
    </div>
  </section>

  <!-- VISION + MISSION -->
  <section class="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-8">
    <div class="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm">
      <div class="text-4xl mb-5">&#127752;</div>
      <h2 class="text-2xl font-black text-blue-900 mb-4">[VISION_H2]</h2>
      <p class="text-gray-600 leading-relaxed">[VISION_TEXT]</p>
    </div>
    <div class="bg-blue-700 text-white rounded-3xl p-10 shadow-lg">
      <div class="text-4xl mb-5">&#127919;</div>
      <h2 class="text-2xl font-black mb-4">[MISSION_H2]</h2>
      <p class="text-blue-100 leading-relaxed">[MISSION_TEXT]</p>
    </div>
  </section>

  <!-- HISTORY TIMELINE -->
  <section class="bg-white py-20 px-6">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl font-black text-blue-900 text-center mb-12">[HIST_H2]</h2>
      <div class="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200 pl-16">
        <div class="relative"><div class="absolute -left-10 w-8 h-8 rounded-full bg-blue-700 text-white text-xs font-black flex items-center justify-center">[TL1_YEAR_ABBR]</div><h3 class="font-black text-base mb-1">[TL1_YEAR] — [TL1_TITLE]</h3><p class="text-gray-500 text-sm">[TL1_DESC]</p></div>
        <div class="relative"><div class="absolute -left-10 w-8 h-8 rounded-full bg-blue-700 text-white text-xs font-black flex items-center justify-center">[TL2_YEAR_ABBR]</div><h3 class="font-black text-base mb-1">[TL2_YEAR] — [TL2_TITLE]</h3><p class="text-gray-500 text-sm">[TL2_DESC]</p></div>
        <div class="relative"><div class="absolute -left-10 w-8 h-8 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center">[TL3_YEAR_ABBR]</div><h3 class="font-black text-base mb-1">[TL3_YEAR] — [TL3_TITLE]</h3><p class="text-gray-500 text-sm">[TL3_DESC]</p></div>
        <div class="relative"><div class="absolute -left-10 w-8 h-8 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center">[TL4_YEAR_ABBR]</div><h3 class="font-black text-base mb-1">[TL4_YEAR] — [TL4_TITLE]</h3><p class="text-gray-500 text-sm">[TL4_DESC]</p></div>
      </div>
    </div>
  </section>

  <!-- ACCREDITATIONS -->
  <section class="py-16 bg-gray-50 text-center px-6">
    <h2 class="text-2xl font-black text-blue-900 mb-8">[ACCRED_H2]</h2>
    <div class="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
      <div class="bg-white rounded-2xl border border-gray-100 px-8 py-5 font-black text-sm text-blue-900 shadow-sm">[ACC1]</div>
      <div class="bg-white rounded-2xl border border-gray-100 px-8 py-5 font-black text-sm text-blue-900 shadow-sm">[ACC2]</div>
      <div class="bg-white rounded-2xl border border-gray-100 px-8 py-5 font-black text-sm text-blue-900 shadow-sm">[ACC3]</div>
      <div class="bg-white rounded-2xl border border-gray-100 px-8 py-5 font-black text-sm text-blue-900 shadow-sm">[ACC4]</div>
    </div>
  </section>

  <footer class="bg-gray-900 text-white py-10">
    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <span class="font-black text-lg">[SITE_NAME]</span>
      <div class="flex gap-6 text-white/50 text-sm">[NAV_LINKS]</div>
      <span class="text-white/30 text-xs">© [YEAR] [SITE_NAME]</span>
    </div>
  </footer>
</body></html>`,

  // ─── 6. CAMPUS LIFE ───────────────────────────────────────────────────────
  "college-campus":
    HEAD("[PAGE_TITLE]") +
    `
<body class="bg-white text-gray-900 font-sans m-0">

${SHARED_NAV}

  <!-- HERO IMAGE -->
  <section class="relative h-96 bg-blue-900 overflow-hidden">
    <img src="https://picsum.photos/seed/[CAMPUS_HERO_IMG]/1400/600" class="absolute inset-0 w-full h-full object-cover opacity-50" onerror="this.src='https://picsum.photos/seed/campus/1400/600'"/>
    <div class="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-6">
      <h1 class="text-5xl font-black mb-3">[CAMPUS_H1]</h1>
      <p class="text-blue-100 text-xl max-w-xl">[CAMPUS_SUBTITLE]</p>
    </div>
  </section>

  <!-- FACILITIES GRID -->
  <section class="max-w-7xl mx-auto px-6 py-20">
    <h2 class="text-3xl font-black text-blue-900 text-center mb-12">[FACILITIES_H2]</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all group">
        <div class="aspect-video overflow-hidden"><img src="https://picsum.photos/seed/[FAC1_IMG]/600/350" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='https://picsum.photos/seed/library/600/350'"/></div>
        <div class="p-5"><h3 class="font-black text-base mb-1">[FAC1_NAME]</h3><p class="text-gray-500 text-sm">[FAC1_DESC]</p></div>
      </div>
      <div class="rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all group">
        <div class="aspect-video overflow-hidden"><img src="https://picsum.photos/seed/[FAC2_IMG]/600/350" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='https://picsum.photos/seed/lab/600/350'"/></div>
        <div class="p-5"><h3 class="font-black text-base mb-1">[FAC2_NAME]</h3><p class="text-gray-500 text-sm">[FAC2_DESC]</p></div>
      </div>
      <div class="rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all group">
        <div class="aspect-video overflow-hidden"><img src="https://picsum.photos/seed/[FAC3_IMG]/600/350" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='https://picsum.photos/seed/sports/600/350'"/></div>
        <div class="p-5"><h3 class="font-black text-base mb-1">[FAC3_NAME]</h3><p class="text-gray-500 text-sm">[FAC3_DESC]</p></div>
      </div>
    </div>
  </section>

  <!-- CLUBS & ACTIVITIES -->
  <section class="bg-blue-900 text-white py-20 px-6">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-3xl font-black text-center mb-12">[CLUBS_H2]</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div class="bg-white/8 rounded-2xl p-6 text-center hover:bg-white/15 transition"><div class="text-3xl mb-3">[CLUB1_ICON]</div><p class="font-black text-sm">[CLUB1_NAME]</p><p class="text-blue-300 text-xs mt-1">[CLUB1_MEMBERS] Members</p></div>
        <div class="bg-white/8 rounded-2xl p-6 text-center hover:bg-white/15 transition"><div class="text-3xl mb-3">[CLUB2_ICON]</div><p class="font-black text-sm">[CLUB2_NAME]</p><p class="text-blue-300 text-xs mt-1">[CLUB2_MEMBERS] Members</p></div>
        <div class="bg-white/8 rounded-2xl p-6 text-center hover:bg-white/15 transition"><div class="text-3xl mb-3">[CLUB3_ICON]</div><p class="font-black text-sm">[CLUB3_NAME]</p><p class="text-blue-300 text-xs mt-1">[CLUB3_MEMBERS] Members</p></div>
        <div class="bg-white/8 rounded-2xl p-6 text-center hover:bg-white/15 transition"><div class="text-3xl mb-3">[CLUB4_ICON]</div><p class="font-black text-sm">[CLUB4_NAME]</p><p class="text-blue-300 text-xs mt-1">[CLUB4_MEMBERS] Members</p></div>
      </div>
    </div>
  </section>

  <!-- PHOTO GALLERY STRIP -->
  <section class="py-16 max-w-7xl mx-auto px-6">
    <h2 class="text-3xl font-black text-blue-900 mb-8">[GALLERY_H2]</h2>
    <div class="grid grid-cols-3 md:grid-cols-5 gap-3">
      <div class="rounded-2xl overflow-hidden aspect-square"><img src="https://picsum.photos/seed/[G1]/300/300" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onerror="this.src='https://picsum.photos/seed/campus1/300/300'"/></div>
      <div class="rounded-2xl overflow-hidden aspect-square"><img src="https://picsum.photos/seed/[G2]/300/300" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onerror="this.src='https://picsum.photos/seed/campus2/300/300'"/></div>
      <div class="rounded-2xl overflow-hidden aspect-square"><img src="https://picsum.photos/seed/[G3]/300/300" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onerror="this.src='https://picsum.photos/seed/campus3/300/300'"/></div>
      <div class="rounded-2xl overflow-hidden aspect-square"><img src="https://picsum.photos/seed/[G4]/300/300" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onerror="this.src='https://picsum.photos/seed/campus4/300/300'"/></div>
      <div class="rounded-2xl overflow-hidden aspect-square"><img src="https://picsum.photos/seed/[G5]/300/300" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onerror="this.src='https://picsum.photos/seed/campus5/300/300'"/></div>
    </div>
  </section>

  <footer class="bg-gray-900 text-white py-10">
    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <span class="font-black text-lg">[SITE_NAME]</span>
      <div class="flex gap-6 text-white/50 text-sm">[NAV_LINKS]</div>
      <span class="text-white/30 text-xs">© [YEAR] [SITE_NAME]</span>
    </div>
  </footer>
</body></html>`,

  // ─── 7. EVENTS & NEWS ────────────────────────────────────────────────────
  "college-events":
    HEAD("[PAGE_TITLE]") +
    `
<body class="bg-gray-50 text-gray-900 font-sans m-0">

${SHARED_NAV}

  <div class="bg-blue-800 text-white py-14 text-center px-6">
    <h1 class="text-5xl font-black mb-3">[EVENTS_H1]</h1>
    <p class="text-blue-200 max-w-xl mx-auto">[EVENTS_SUBTITLE]</p>
  </div>

  <!-- TABS -->
  <div class="bg-white border-b border-gray-100 py-4 px-6 sticky top-16 z-40">
    <div class="max-w-7xl mx-auto flex gap-4">
      <button class="h-9 px-5 rounded-full bg-blue-700 text-white text-xs font-black">All</button>
      <button class="h-9 px-5 rounded-full border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50">Upcoming</button>
      <button class="h-9 px-5 rounded-full border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50">Academic</button>
      <button class="h-9 px-5 rounded-full border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50">Cultural</button>
      <button class="h-9 px-5 rounded-full border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50">Sports</button>
    </div>
  </div>

  <section class="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">
    <!-- FEATURED EVENT: large -->
    <div class="md:col-span-2 bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition">
      <div class="aspect-video bg-gray-100"><img src="https://picsum.photos/seed/[EV_FEAT_IMG]/800/450" class="w-full h-full object-cover" onerror="this.src='https://picsum.photos/seed/event/800/450'"/></div>
      <div class="p-8">
        <div class="flex items-center gap-3 mb-4">
          <span class="bg-amber-100 text-amber-700 text-xs font-black px-3 py-1 rounded-full">[EV_FEAT_CAT]</span>
          <span class="text-gray-400 text-xs">[EV_FEAT_DATE] at [EV_FEAT_TIME]</span>
        </div>
        <h2 class="text-2xl font-black mb-3">[EV_FEAT_TITLE]</h2>
        <p class="text-gray-600 text-sm leading-relaxed mb-5">[EV_FEAT_DESC]</p>
        <div class="flex items-center gap-4 text-xs text-gray-400"><span>&#128205; [EV_FEAT_VENUE]</span><span>&#127881; [EV_FEAT_REG_INFO]</span></div>
      </div>
    </div>

    <!-- SIDEBAR UPCOMING -->
    <div class="space-y-4">
      <h3 class="font-black text-base text-blue-900">Upcoming Events</h3>
      <div class="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 hover:shadow-md transition"><div class="w-12 h-12 rounded-xl bg-blue-700 text-white flex flex-col items-center justify-center shrink-0"><p class="text-lg font-black leading-none">[SE1_DAY]</p><p class="text-[9px] font-bold uppercase">[SE1_MON]</p></div><div><h3 class="font-black text-xs mb-0.5">[SE1_TITLE]</h3><p class="text-gray-400 text-xs">[SE1_DESC]</p></div></div>
      <div class="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 hover:shadow-md transition"><div class="w-12 h-12 rounded-xl bg-amber-500 text-white flex flex-col items-center justify-center shrink-0"><p class="text-lg font-black leading-none">[SE2_DAY]</p><p class="text-[9px] font-bold uppercase">[SE2_MON]</p></div><div><h3 class="font-black text-xs mb-0.5">[SE2_TITLE]</h3><p class="text-gray-400 text-xs">[SE2_DESC]</p></div></div>
      <div class="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 hover:shadow-md transition"><div class="w-12 h-12 rounded-xl bg-green-600 text-white flex flex-col items-center justify-center shrink-0"><p class="text-lg font-black leading-none">[SE3_DAY]</p><p class="text-[9px] font-bold uppercase">[SE3_MON]</p></div><div><h3 class="font-black text-xs mb-0.5">[SE3_TITLE]</h3><p class="text-gray-400 text-xs">[SE3_DESC]</p></div></div>
      <div class="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 hover:shadow-md transition"><div class="w-12 h-12 rounded-xl bg-purple-600 text-white flex flex-col items-center justify-center shrink-0"><p class="text-lg font-black leading-none">[SE4_DAY]</p><p class="text-[9px] font-bold uppercase">[SE4_MON]</p></div><div><h3 class="font-black text-xs mb-0.5">[SE4_TITLE]</h3><p class="text-gray-400 text-xs">[SE4_DESC]</p></div></div>
    </div>
  </section>

  <!-- NEWS GRID -->
  <section class="max-w-7xl mx-auto px-6 pb-20">
    <h2 class="text-2xl font-black text-blue-900 mb-8">[NEWS_H2]</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-lg transition"><p class="text-blue-600 text-xs font-bold mb-2">[N1_DATE] · [N1_CAT]</p><h3 class="font-black text-base mb-2">[N1_TITLE]</h3><p class="text-gray-500 text-sm leading-relaxed">[N1_EXCERPT]</p></div>
      <div class="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-lg transition"><p class="text-blue-600 text-xs font-bold mb-2">[N2_DATE] · [N2_CAT]</p><h3 class="font-black text-base mb-2">[N2_TITLE]</h3><p class="text-gray-500 text-sm leading-relaxed">[N2_EXCERPT]</p></div>
      <div class="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-lg transition"><p class="text-blue-600 text-xs font-bold mb-2">[N3_DATE] · [N3_CAT]</p><h3 class="font-black text-base mb-2">[N3_TITLE]</h3><p class="text-gray-500 text-sm leading-relaxed">[N3_EXCERPT]</p></div>
    </div>
  </section>

  <footer class="bg-gray-900 text-white py-10">
    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <span class="font-black text-lg">[SITE_NAME]</span>
      <div class="flex gap-6 text-white/50 text-sm">[NAV_LINKS]</div>
      <span class="text-white/30 text-xs">© [YEAR] [SITE_NAME]</span>
    </div>
  </footer>
</body></html>`,

  // ─── 8. CONTACT ──────────────────────────────────────────────────────────
  "college-contact":
    HEAD("[PAGE_TITLE]") +
    `
<body class="bg-white text-gray-900 font-sans m-0">

${SHARED_NAV}

  <div class="bg-blue-800 text-white py-14 text-center px-6">
    <h1 class="text-5xl font-black mb-3">[CONTACT_H1]</h1>
    <p class="text-blue-200 max-w-xl mx-auto">[CONTACT_SUBTITLE]</p>
  </div>

  <section class="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
    <!-- INFO CARDS -->
    <div class="space-y-5">
      <div class="bg-blue-50 rounded-2xl p-6"><div class="text-2xl mb-3">&#128205;</div><h3 class="font-black text-sm text-blue-900 mb-2">[ADDR_TITLE]</h3><p class="text-gray-600 text-sm leading-relaxed">[ADDR_TEXT]</p></div>
      <div class="bg-amber-50 rounded-2xl p-6"><div class="text-2xl mb-3">&#128222;</div><h3 class="font-black text-sm text-amber-800 mb-2">[PHONE_TITLE]</h3><p class="text-gray-600 text-sm">[PHONE_TEXT]</p></div>
      <div class="bg-green-50 rounded-2xl p-6"><div class="text-2xl mb-3">&#128140;</div><h3 class="font-black text-sm text-green-800 mb-2">[EMAIL_TITLE]</h3><p class="text-gray-600 text-sm">[EMAIL_TEXT]</p></div>
      <div class="bg-gray-50 rounded-2xl p-6"><div class="text-2xl mb-3">&#128336;</div><h3 class="font-black text-sm text-gray-800 mb-2">[HOURS_TITLE]</h3><p class="text-gray-600 text-sm">[HOURS_TEXT]</p></div>
    </div>

    <!-- ENQUIRY FORM -->
    <div class="md:col-span-2 bg-gray-50 rounded-3xl p-8 border border-gray-100">
      <h2 class="text-2xl font-black text-blue-900 mb-7">[FORM_H2]</h2>
      <form class="space-y-5">
        <div class="grid md:grid-cols-2 gap-4">
          <div><label class="block text-xs font-bold text-gray-500 mb-1.5">Full Name *</label><input type="text" placeholder="[FNAME_PH]" class="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"/></div>
          <div><label class="block text-xs font-bold text-gray-500 mb-1.5">Mobile Number *</label><input type="tel" placeholder="[MOBILE_PH]" class="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"/></div>
        </div>
        <div><label class="block text-xs font-bold text-gray-500 mb-1.5">Email Address *</label><input type="email" placeholder="[EMAIL_PH]" class="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"/></div>
        <div><label class="block text-xs font-bold text-gray-500 mb-1.5">Course / Program of Interest</label><select class="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white focus:border-blue-500 outline-none transition text-sm text-gray-600"><option value="">[COURSE_PH]</option><option>[COURSE_OPT1]</option><option>[COURSE_OPT2]</option><option>[COURSE_OPT3]</option></select></div>
        <div><label class="block text-xs font-bold text-gray-500 mb-1.5">Message</label><textarea rows="4" placeholder="[MSG_PH]" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm resize-none"></textarea></div>
        <button type="submit" class="w-full h-13 py-3 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-black transition">[SUBMIT_BTN]</button>
      </form>
    </div>
  </section>

  <!-- MAP PLACEHOLDER -->
  <div class="h-64 bg-gray-200 overflow-hidden">
    <img src="https://picsum.photos/seed/map/1400/300" class="w-full h-full object-cover" onerror="this.src='https://picsum.photos/seed/city/1400/300'"/>
  </div>

  <footer class="bg-blue-900 text-white py-10 text-center">
    <p class="font-black text-lg mb-2">[SITE_NAME]</p>
    <div class="flex justify-center gap-6 text-blue-300 text-sm mb-3">[NAV_LINKS]</div>
    <p class="text-blue-400 text-xs">© [YEAR] [SITE_NAME]</p>
  </footer>
</body></html>`,

  // ─── 9. PLACEMENTS ───────────────────────────────────────────────────────
  "college-placements":
    HEAD("[PAGE_TITLE]") +
    `
<body class="bg-white text-gray-900 font-sans m-0">

${SHARED_NAV}

  <!-- HERO -->
  <section class="bg-gradient-to-br from-green-800 to-blue-900 text-white py-20 text-center px-6">
    <h1 class="text-5xl font-black mb-4">[PLACE_H1]</h1>
    <p class="text-green-100 text-xl max-w-2xl mx-auto">[PLACE_SUBTITLE]</p>
  </section>

  <!-- PLACEMENT STATS -->
  <section class="bg-white border-b border-gray-100 py-12">
    <div class="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      <div><p class="text-5xl font-black text-green-600">[PS1_N]</p><p class="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">[PS1_L]</p></div>
      <div><p class="text-5xl font-black text-green-600">[PS2_N]</p><p class="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">[PS2_L]</p></div>
      <div><p class="text-5xl font-black text-green-600">[PS3_N]</p><p class="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">[PS3_L]</p></div>
      <div><p class="text-5xl font-black text-green-600">[PS4_N]</p><p class="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">[PS4_L]</p></div>
    </div>
  </section>

  <!-- TOP RECRUITERS -->
  <section class="py-20 bg-gray-50 px-6">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-3xl font-black text-center text-blue-900 mb-10">[RECRUIT_H2]</h2>
      <div class="grid grid-cols-3 md:grid-cols-6 gap-5">
        <div class="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-center h-20 shadow-sm hover:shadow-md transition"><p class="font-black text-sm text-gray-700 text-center">[CO1]</p></div>
        <div class="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-center h-20 shadow-sm hover:shadow-md transition"><p class="font-black text-sm text-gray-700 text-center">[CO2]</p></div>
        <div class="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-center h-20 shadow-sm hover:shadow-md transition"><p class="font-black text-sm text-gray-700 text-center">[CO3]</p></div>
        <div class="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-center h-20 shadow-sm hover:shadow-md transition"><p class="font-black text-sm text-gray-700 text-center">[CO4]</p></div>
        <div class="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-center h-20 shadow-sm hover:shadow-md transition"><p class="font-black text-sm text-gray-700 text-center">[CO5]</p></div>
        <div class="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-center h-20 shadow-sm hover:shadow-md transition"><p class="font-black text-sm text-gray-700 text-center">[CO6]</p></div>
      </div>
    </div>
  </section>

  <!-- ALUMNI SUCCESS STORIES -->
  <section class="max-w-7xl mx-auto px-6 py-20">
    <h2 class="text-3xl font-black text-blue-900 text-center mb-12">[ALUMNI_H2]</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="bg-gradient-to-br from-blue-50 to-white rounded-3xl border border-blue-100 p-8"><div class="flex items-center gap-4 mb-5"><img src="https://picsum.photos/seed/[AL1_IMG]/60/60" class="w-14 h-14 rounded-full object-cover border-2 border-blue-200" onerror="this.src='https://picsum.photos/seed/alumni1/60/60'"/><div><p class="font-black text-base">[AL1_NAME]</p><p class="text-blue-600 text-xs font-bold">[AL1_ROLE] at [AL1_CO]</p></div></div><p class="text-gray-600 text-sm leading-relaxed italic">"[AL1_QUOTE]"</p></div>
      <div class="bg-gradient-to-br from-green-50 to-white rounded-3xl border border-green-100 p-8"><div class="flex items-center gap-4 mb-5"><img src="https://picsum.photos/seed/[AL2_IMG]/60/60" class="w-14 h-14 rounded-full object-cover border-2 border-green-200" onerror="this.src='https://picsum.photos/seed/alumni2/60/60'"/><div><p class="font-black text-base">[AL2_NAME]</p><p class="text-green-600 text-xs font-bold">[AL2_ROLE] at [AL2_CO]</p></div></div><p class="text-gray-600 text-sm leading-relaxed italic">"[AL2_QUOTE]"</p></div>
      <div class="bg-gradient-to-br from-amber-50 to-white rounded-3xl border border-amber-100 p-8"><div class="flex items-center gap-4 mb-5"><img src="https://picsum.photos/seed/[AL3_IMG]/60/60" class="w-14 h-14 rounded-full object-cover border-2 border-amber-200" onerror="this.src='https://picsum.photos/seed/alumni3/60/60'"/><div><p class="font-black text-base">[AL3_NAME]</p><p class="text-amber-600 text-xs font-bold">[AL3_ROLE] at [AL3_CO]</p></div></div><p class="text-gray-600 text-sm leading-relaxed italic">"[AL3_QUOTE]"</p></div>
    </div>
  </section>

  <!-- CTA: register for placement -->
  <section class="bg-green-700 text-white py-16 text-center px-6">
    <h2 class="text-3xl font-black mb-3">[PCTA_H2]</h2>
    <p class="text-green-100 mb-8">[PCTA_SUB]</p>
    <a href="[PCTA_LINK]" class="inline-flex items-center h-13 px-10 py-3 rounded-xl bg-white text-green-800 font-black hover:bg-gray-100 transition-all hover:scale-105">[PCTA_BTN]</a>
  </section>

  <footer class="bg-gray-900 text-white py-10">
    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <span class="font-black text-lg">[SITE_NAME]</span>
      <div class="flex gap-6 text-white/50 text-sm">[NAV_LINKS]</div>
      <span class="text-white/30 text-xs">© [YEAR] [SITE_NAME]</span>
    </div>
  </footer>
</body></html>`,

  // ─── 10. GALLERY ─────────────────────────────────────────────────────────
  "college-gallery":
    HEAD("[PAGE_TITLE]") +
    `
<body class="bg-gray-950 text-white font-sans m-0">

${SHARED_NAV}

  <div class="py-20 text-center px-6">
    <h1 class="text-6xl font-black mb-3">[GAL_H1]</h1>
    <p class="text-gray-400 max-w-xl mx-auto">[GAL_SUBTITLE]</p>
  </div>

  <!-- FILTER -->
  <div class="max-w-7xl mx-auto px-6 pb-8 flex flex-wrap gap-3">
    <button class="h-9 px-5 rounded-full bg-blue-600 text-white text-xs font-black">All Photos</button>
    <button class="h-9 px-5 rounded-full border border-white/10 text-white/50 text-xs font-semibold hover:bg-white/5">[GCAT1]</button>
    <button class="h-9 px-5 rounded-full border border-white/10 text-white/50 text-xs font-semibold hover:bg-white/5">[GCAT2]</button>
    <button class="h-9 px-5 rounded-full border border-white/10 text-white/50 text-xs font-semibold hover:bg-white/5">[GCAT3]</button>
    <button class="h-9 px-5 rounded-full border border-white/10 text-white/50 text-xs font-semibold hover:bg-white/5">[GCAT4]</button>
  </div>

  <!-- MASONRY-STYLE GRID -->
  <section class="max-w-7xl mx-auto px-6 pb-20">
    <div class="columns-2 md:columns-3 gap-4 space-y-4">
      <div class="rounded-2xl overflow-hidden break-inside-avoid hover:opacity-90 transition"><img src="https://picsum.photos/seed/[IM1]/600/400" class="w-full object-cover" onerror="this.src='https://picsum.photos/seed/col1/600/400'"/></div>
      <div class="rounded-2xl overflow-hidden break-inside-avoid hover:opacity-90 transition"><img src="https://picsum.photos/seed/[IM2]/600/700" class="w-full object-cover" onerror="this.src='https://picsum.photos/seed/col2/600/700'"/></div>
      <div class="rounded-2xl overflow-hidden break-inside-avoid hover:opacity-90 transition"><img src="https://picsum.photos/seed/[IM3]/600/350" class="w-full object-cover" onerror="this.src='https://picsum.photos/seed/col3/600/350'"/></div>
      <div class="rounded-2xl overflow-hidden break-inside-avoid hover:opacity-90 transition"><img src="https://picsum.photos/seed/[IM4]/600/500" class="w-full object-cover" onerror="this.src='https://picsum.photos/seed/col4/600/500'"/></div>
      <div class="rounded-2xl overflow-hidden break-inside-avoid hover:opacity-90 transition"><img src="https://picsum.photos/seed/[IM5]/600/380" class="w-full object-cover" onerror="this.src='https://picsum.photos/seed/col5/600/380'"/></div>
      <div class="rounded-2xl overflow-hidden break-inside-avoid hover:opacity-90 transition"><img src="https://picsum.photos/seed/[IM6]/600/600" class="w-full object-cover" onerror="this.src='https://picsum.photos/seed/col6/600/600'"/></div>
      <div class="rounded-2xl overflow-hidden break-inside-avoid hover:opacity-90 transition"><img src="https://picsum.photos/seed/[IM7]/600/420" class="w-full object-cover" onerror="this.src='https://picsum.photos/seed/col7/600/420'"/></div>
      <div class="rounded-2xl overflow-hidden break-inside-avoid hover:opacity-90 transition"><img src="https://picsum.photos/seed/[IM8]/600/300" class="w-full object-cover" onerror="this.src='https://picsum.photos/seed/col8/600/300'"/></div>
      <div class="rounded-2xl overflow-hidden break-inside-avoid hover:opacity-90 transition"><img src="https://picsum.photos/seed/[IM9]/600/500" class="w-full object-cover" onerror="this.src='https://picsum.photos/seed/col9/600/500'"/></div>
    </div>
    <div class="mt-10 text-center">
      <button class="h-12 px-8 rounded-2xl border border-white/10 text-white/60 font-bold hover:bg-white/5 transition">Load More Photos</button>
    </div>
  </section>

  <footer class="border-t border-white/5 py-10">
    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <span class="font-black">[SITE_NAME]</span>
      <div class="flex gap-6 text-white/30 text-sm">[NAV_LINKS]</div>
      <span class="text-white/20 text-xs">© [YEAR] [SITE_NAME]</span>
    </div>
  </footer>
</body></html>`,
};
