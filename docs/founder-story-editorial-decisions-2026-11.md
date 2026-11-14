# Founder narrative and licensing — editorial handoff (November 2026)

This note records the founder's decisions behind the draft PR #152. It is an editorial checklist, **not** evidence that all changes are complete or validated. Keep the site's search and documentary usefulness foremost. Do not merge without review.

## Narrative and information architecture

- Keep the public page named **About the project / Sobre el proyecto**, rather than replacing its purpose with a manifesto or an isolated “Why FarmSuccession?” page.
- Tell a **coherent first-person story**, not disconnected blocks: introduce the person behind the project and his connection to agriculture, explain why succession matters, recount the original business idea and its research, explain the documentary pivot and the limits of the resulting directory.
- The founder is a **software developer**, currently working at a company that brings farmers' products to consumers. This is **not** a company project or endorsement. Do not name the employer.
- Personally tends fruit trees on a small plot, supports biodiversity (including insect shelters), and is **not** a professional farmer. Do not equate a hobby plot with farming professionally.
- Concern: succeeding generations need viable opportunities to produce food and continue farms and their knowledge; technology cannot remove that need. Make farming accessible, attractive and viable, with training, advice, environmental care and improved practices, without ideological positioning or “production at any cost.”
- Be candid: the idea began as research into a **commercial platform/land bank** to connect outgoing farmers with successors. Existing intermediaries and the complexity of transfers made that approach unattractive. Research nevertheless revealed fragmented information about land access, aid, training and advice. The project became a free independent directory linking to the original providers.
- FarmSuccession **does not broker farm transfers, process applications, replace professional advice, or claim to solve structural succession problems**.
- Keep homepage search primary; link discreetly to the full story. Preserve separate Method, historical project, Contact, Privacy and Licence sections.

## Why it is free; professional value

- The founder's profession is computing/software development. A **real, maintained, public personal project** is a portfolio that demonstrates skills, initiative, learning and continuous improvement.
- Founder reports from his own interviews and workplaces that employers valued initiative and willingness to learn. Present this as **personal experience**, not an unsupported universal labour-market statistic.
- The founder gets personal and professional value from building the directory; it is not accurate to portray it as purely altruistic or without benefit.
- Free/low-cost infrastructure and paid professional tools (including AI) help optimise limited free time. Some subscriptions are optional, temporary or shared with other personal projects; the live static site need not depend on maintaining them.
- **Do not claim the project costs €30/year or €240/year in total.** €20/month Claude Personal was reported at one point, but the subscription may be cancelled; AWS and other services are used, and costs are not yet attributed to this project. Distinguish public hosting, optional development/research tools, and significant unpaid personal hours. No published monetary total without verified breakdown.
- Keep public prose **vendor-neutral**: describe AI and professional tools rather than making enduring claims tied to Claude, ChatGPT or AWS.
- Explain AI **after** introducing the founder's software background; it assists research/maintenance and does not replace source verification, professional judgement or original providers.

## Licence, rights and third-party permission

- FarmSuccession's CC BY 4.0 grant covers **only original material over which its maintainer can license rights**, including original descriptions and protectable selection/arrangement; it does **not** license third-party text, quotations, photos, logos, documents, databases or linked pages.
- The founder has contacted organisations to request **specific permission** to refer to services or reproduce excerpts where applicable. Do not imply every source granted permission, or that permissions are unlimited.
- **Permission granted specifically to FarmSuccession does not automatically extend to reusers** merely because FarmSuccession's own original content has a CC BY licence.
- A reuser wishing to reproduce protected third-party material must check the **original source's terms and, where required, contact the third-party organisation responsible for that information directly** to request authorisation. FarmSuccession cannot authorise reuse on its behalf.
- Do **not** imply that mentioning a source, factual statements, ordinary links or legally permitted quotation always require permission. Existing open licences and legal exceptions continue to apply.
- Users can freely mention/link to FarmSuccession; original CC BY material can be reused under its attribution terms. No extra restrictions may be imposed on CC BY licensed material.
- Check consistency among the About licence text, root LICENSE, footer, data pages and any public reuse notices. Consider legal review before merge.

## Initial status and acceptance criteria (11 November; superseded below)

- Draft PR #152 has implemented the narrative and licence changes, but **the Spanish and English founder narratives are more developed than the other locales**. Complete editorial parity for FR, DE, IT, PT and NL (the current repository includes NL) and check translations by a competent speaker.
- Review the story for continuity, first-person voice, accessible headings, mobile layout and a non-dominant homepage link.
- Run root and frontend checks, formatting and tests, review CI, and coordinate with ongoing UX PR #151. These validations have **not** been confirmed by this note.
- Do not merge, deploy, contact third parties or assert legal certainty without explicit approval.

Related documentation: private `jacanotrigueros/core-documentation` PR #30.

## Revision of 12 November 2026

### Findings and implemented decisions

- Reviewed the current remote PR #152 head (`48c901d`), its 15-commit history,
  complete final diff and discussion (no comments returned). The initial root
  check failed on formatting in three files; the initial frontend check built
  successfully but failed French nonbreaking punctuation in `licenceLead`.
- Keep the first-person account, original commercial land-bank research,
  documentary pivot, hobby/profession distinction, employer independence and
  personal/professional return. Replace the grander social-failure framing and
  unsupported historical generalisations with a personal concern and concrete
  land/finance/training/advice needs. Do not introduce an institutional claim.
- Align EN/ES/FR/DE/IT/PT/NL on the full account, including portfolio, paid and
  optional/shared tools, unpaid hours, infrastructure and present free access.
  Remove the blanket external-funding assertion, whose exact basis is unverified.
  No euro total, provider names, perpetual gratuity or maintenance guarantee.
  AI helps research; it is not evidence or human review.
- Keep one About page and its practical overview first. Give the free-access
  explanation an anchor inside the founder narrative; align the section-menu
  label with the heading. Use the existing content column without the redundant
  inner width cap. Homepage and national entry links remain secondary and have
  a minimum 44px target. No regional biography links or new FAQ route.
- All seven language tables are supported in code. The actual catalogue publishes
  six document languages and seven jurisdictional About paths (Austria reuses
  German). Dutch copy is aligned and type-checked but has no published `/nl/`
  route; no country or route was invented to demonstrate translation parity.
  Linguistic review by native speakers has not been obtained.
- Split the licence explanation into the original-material grant, third-party
  rights/permissions, and lawful uses. Add a concise scoped notice and a local
  licence-section link to every footer, and an adjacent third-party notice to
  evidence blocks. Replace the homepage's universal open-data label with a claim
  about original content only. README, CITATION and `data/README.md` agree.
- Keep the existing CC BY 4.0 grant for original code. Distinguish original
  descriptions, licensable selection/arrangement and any database rights held
  by the maintainer from source quotations, source databases, the historical
  toolkit and dependencies. Package licence metadata remains CC-BY-4.0 for
  first-party work. No JSON evidence, schema, source quote or permission state
  was changed. URLs and reading dates do not establish authorisation.
- Include the shipped Inter/Source Serif OFL, Lucide ISC/Feather MIT and Pagefind
  MIT notices in `frontend/public/licenses/`. Fonts and Pagefind notices are
  copied from installed packages; Lucide's combined notice comes from its
  [official licence](https://github.com/lucide-icons/lucide/blob/main/LICENSE).
  These are accessible local assets, not remote page-loading dependencies.

### Licence reasoning and alternatives

Primary references read on 12 November 2026:

- [CC BY 4.0 legal code](https://creativecommons.org/licenses/by/4.0/legalcode.en),
  especially sections 2–4: only rights the licensor can grant, exceptions,
  attribution, no additional restrictions and database rights.
- [Creative Commons FAQ](https://creativecommons.org/faq/#can-i-apply-a-creative-commons-license-to-software):
  CC recommends a software-specific licence for code, because source-code and
  patent provisions and software-licence compatibility differ.

The implementation is a scope clarification, not a substitute licence or legal
opinion. A possible future software-specific grant (for example MIT for owned
code while retaining CC BY for original editorial material) needs a separate
maintainer decision and ownership/dependency review. Do not silently replace the
existing grant or imply that previously granted CC rights can be withdrawn.
Reject noncommercial-only conditions, mandatory permission for all mentions or
links, universal attribution for unprotected facts, and restrictions on lawful
uses. Specific third-party permissions do not automatically become open licences.

### Private coordination and public boundary

Reviewed the private project instructions, project orientation, backlog, risks,
KPI definitions, accepted founder/permission decisions and relevant permission
records alongside PR #30. Public copy follows the founder's own account and
public evidence; no private correspondence, permissions table, operational
metrics or internal strategy is copied here. The public editorial record remains
the implementation reference rather than duplicating it in another document.
No private permission is expanded or marked granted by this review. No message
was sent to an organisation. No private decision is superseded by public copy.

### Checks and remaining review

- Node 24; dependencies installed with `npm ci` in root and frontend; hooks active.
- After corrections: root `npm run check` passed (TypeScript, lint, formatting,
  generated types, 251 tests, 111 edition files and 111 research briefs, report
  freshness). Existing data findings: zero errors, one warning and one review
  item; neither is introduced by this editorial change.
- Frontend `npm run check` passed before the two additional integration tests:
  TypeScript, Astro diagnostics, build of 509 pages, six search bundles and
  160 tests. The two added tests subsequently passed with all 162 frontend tests,
  checking published-language anchors, entry links, full reuse explanations,
  footer notices and adjacent evidence notices. A final full run follows below.
- Existing built-site suites also check internal destinations, heading hierarchy,
  labelled controls, language alternates, source quotes, scripts and local assets.
  These are static checks, not proof of browser layout or keyboard behaviour.
- Browser rendering and screenshots are **BLOCKED**: Chromium aborts at startup
  with `socket() failed: Operation not permitted` in its process-singleton setup,
  including a second attempt without multiprocess rendering. Playwright/axe were
  installed outside the repository; no runtime dependency was added. No screenshot,
  axe scan, 320/768/1440px visual inspection or keyboard session is claimed.
- Initial GitHub Actions run #242 for `48c901d` failed. Check the new commit's
  run after pushing; do not infer CI success from a local run.

Before merge, the maintainer still needs rendered mobile/desktop acceptance and
final editorial review. Legal review should address the legal basis and exact
surface/scope of any reused third-party material (including JSON publication,
source-database rights and the preserved toolkit). This general notice cannot
prove that each individual existing use is authorised. A different code licence
is an optional separate decision, not an implemented change. No monetary total
should be published without an attributable cost breakdown.

### Final local validation and PR #151 integration exercise

- Final full root check: **251/251 tests passed**, zero validation errors; the
  existing warning/review item remain. Final full frontend check: **162/162
  tests passed**, TypeScript and Astro passed, 509 pages and six search bundles
  built. Astro reports one existing unused-variable hint in
  `test/territory-presentation.test.ts`; zero errors or warnings.
- A three-way merge against PR #151 at `5792f75` automatically combines the
  source files, including About width, entry links and the shared footer.
  `frontend/test/built-site.test.ts` has a textual conflict: the older footer
  policy test is replaced by #151, and both branches append tests at EOF.
- Resolution tested in a temporary detached worktree: retain #151’s complete
  test file (including its new shared-footer policy), then append #152’s
  `every page links its scoped licence notice...` test. Retain the separate
  About/reuse integration test added in `document-languages.test.ts`.
  Do not revert #151’s footer policy or drop either branch’s added checks.
- This exercise does **not** merge #151 into #152, change #151 or approve its
  visual design. It keeps the founder/licensing diff independently reviewable.

- Combined temporary worktree: full root `npm run check` passed, and full
  frontend `npm run check` passed with **166/166 tests**, 509 built pages and
  six search bundles. This is a local integration result after the resolution
  above, not evidence of a GitHub merge or rendered browser acceptance.
