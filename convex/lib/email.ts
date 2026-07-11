// Consumer/free email providers are not accepted for enterprise sign-up —
// keep this in sync with src/features/authentication/schemas/index.ts.
export const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "protonmail.com",
  "proton.me",
  "gmx.com",
  "gmx.net",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "qq.com",
  "163.com",
  "126.com",
  "rediffmail.com",
]);

export function isFreeEmailDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? FREE_EMAIL_DOMAINS.has(domain) : false;
}
