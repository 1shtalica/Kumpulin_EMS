export const normalizePhoneNumber = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const phone = value.trim();
  if (/^\+628[0-9]{8,12}$/.test(phone)) return phone;
  if (/^628[0-9]{8,12}$/.test(phone)) return `+${phone}`;
  if (/^08[0-9]{8,12}$/.test(phone)) return `+62${phone.slice(1)}`;
  return undefined;
};
