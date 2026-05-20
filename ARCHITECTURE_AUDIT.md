# PER Reading Architecture Audit (Workspace Baseline)

## 1) Overall architecture
- Repository currently combines a Shopify theme scaffold with a standalone static prototype (`index.html` + `app.js`) and a large research bundle in `per.zip`.
- The Shopify section (`sections/per-reading-top-lp.liquid`) already embeds an end-to-end diagnosis UX (question flow, compatibility score, 60-cycle chart, radar chart) entirely in inline JavaScript and canvas rendering.
- `per.zip` is a source-of-truth data/design pack containing multiple independent diagnosis apps: PER_TEST, deep compatibility app, phase/type rule viewer, 60-kanshi circle renderer, universe chart variant, and day-branch compatibility workbook HTML.

## 2) Important files
- `index.html`: standalone Japanese LP + simplified diagnosis controls and score gauge UI.
- `app.js`: CSV-driven 60-kanshi selector, cyclic difference scoring, relation type classification, score animation, reveal effects.
- `sections/per-reading-top-lp.liquid`: production-facing Shopify section with diagnosis flow, compatibility logic, PER type mapping, 60-circle canvas, universe radar canvas, and configurable merchandising blocks.
- `per.zip`: archive with 109 entries including 8 major HTML diagnosis/visual tools, 1 CSV master, multiple silhouette/relationship assets (`sil`), and chart images (`per_app/images`, `assets/stems`, `assets/branches`).

## 3) Diagnosis flow (current implementations)
- Static prototype flow (`index.html`/`app.js`): load `master_60.csv` -> select two kanshi numbers -> compute shortest cyclic diff in 60-cycle -> classify relation type -> compute score -> render textual reading + animated gauge.
- Shopify section flow: collect two DOBs + 5 A/B answers -> convert DOB to 1..60 cycle number (`kanshiNum`) -> derive branch pair and PER type -> resolve pair text from lookup table fallback -> score + report + chart/radar visualization.
- Deep app flow in `per.zip` (`en_shinsou_store_spreadsheet_linked_urlset (3).html`): user profile input + stored-person recall + external spreadsheet-linked data behaviors (implied by filename) + layered result cards.

## 4) Reusable systems identified
- Shared 60-kanshi master data (`master_60.csv`) and cyclic math pattern (`Math.min(diff, 60 - diff)` style logic).
- A/B questionnaire engine and PER type dictionary (`types` map) in Shopify section.
- Compatibility pattern lookup dictionary (`PAIR_TEXTS`) with graceful default path.
- Canvas components: ring marker renderer (`drawCircle`) and six-axis radar renderer (`drawRadar`).
- Asset families reusable for premium UX: silhouette sets (`sil/*.png`), deep-app symbolic images (`per_app/images/*.png`), stems/branches image atlases (`assets/stems`, `assets/branches`).

## 5) What should be migrated into Shopify
- Data layer: unpack and normalize all lookup tables from zipped HTML/CSV/XLSX-derived resources into Shopify-consumable JSON/Liquid objects.
- Core engines: kanshi calculation, compatibility rule engine, PER type inference, and chart renderers should be extracted from inline scripts into maintainable assets JS modules.
- Content system: diagnosis copy, type descriptions, compatibility texts, and CTA menu entries should move from hardcoded JS/HTML into section blocks/metafields/translations.
- Visual system: migrate `sil` and chart imagery into Shopify assets/files with deterministic key naming for rule-based image selection.

## 6) Recommended Shopify Liquid + JavaScript architecture
- Liquid responsibilities: schema-driven layout, localized content injection, initial config JSON blob, secure routes/CTA wiring.
- JavaScript responsibilities: deterministic diagnosis engine, state machine for multistep UX, rendering adapters (DOM + canvas), analytics events.
- Data strategy: precompiled JSON artifacts versioned in repo (generated from master CSV/XLSX sources), loaded once and cached client-side.
- Module boundaries: `engine/kanshi`, `engine/compatibility`, `engine/personality`, `ui/questionnaire`, `ui/charts`, `ui/result-cards`, `infra/storage`.
- Quality gates: golden test vectors for kanshi mapping + compatibility outcomes, snapshot tests for chart primitives, and locale regression tests.

## Inventory from `per.zip` (quick facts)
- HTML files: 10
- JavaScript files: 1
- CSV files: 1
- Total relevant files (.html/.js/.csv/.png/.xlsx): 84