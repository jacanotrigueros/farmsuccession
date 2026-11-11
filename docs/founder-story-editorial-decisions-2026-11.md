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
- **Permission granted specifically to FarmSuccession is not transferable** merely because FarmSuccession's own original content has a CC BY licence.
- A reuser wishing to reproduce protected third-party material must check the **original source's terms and, where required, contact the third-party organisation responsible for that information directly** to request authorisation. FarmSuccession cannot authorise reuse on its behalf.
- Do **not** imply that mentioning a source, factual statements, ordinary links or legally permitted quotation always require permission. Existing open licences and legal exceptions continue to apply.
- Users can freely mention/link to FarmSuccession; original CC BY material can be reused under its attribution terms. No extra restrictions may be imposed on CC BY licensed material.
- Check consistency among the About licence text, root LICENSE, footer, data pages and any public reuse notices. Consider legal review before merge.

## Status and acceptance criteria

- Draft PR #152 has implemented the narrative and licence changes, but **the Spanish and English founder narratives are more developed than the other locales**. Complete editorial parity for FR, DE, IT, PT and NL (the current repository includes NL) and check translations by a competent speaker.
- Review the story for continuity, first-person voice, accessible headings, mobile layout and a non-dominant homepage link.
- Run root and frontend checks, formatting and tests, review CI, and coordinate with ongoing UX PR #151. These validations have **not** been confirmed by this note.
- Do not merge, deploy, contact third parties or assert legal certainty without explicit approval.

Related documentation: private `jacanotrigueros/core-documentation` PR #30.
