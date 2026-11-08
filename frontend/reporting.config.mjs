// @ts-check
/**
 * Maintainer-provided public endpoint. Before publishing, verify inbox receipt
 * and enable/test provider-hosted CAPTCHA. A hidden field cannot enable it.
 * Empty keeps the working email fallback. This is never an account/API secret.
 * Setup and receipt checks: decisions/037-public-reports-use-explicit-form-delivery.md.
 */
export const reportEndpoint = "https://formspree.io/f/mkjjayyn";

if (reportEndpoint && !/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/u.test(reportEndpoint)) {
  throw new Error("reportEndpoint must be empty or an HTTPS Formspree /f/ endpoint");
}
