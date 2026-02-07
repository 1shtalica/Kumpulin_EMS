export function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = fullName.trim();

  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");

  return { firstName, lastName };
}

// export function joinFullName(firstName: string, lastName?: string): string {
//   const first = firstName?.trim() || "";
//   const last = lastName?.trim() || "";

//   if (!first && !last) return "";
//   if (!last) return first;
//   if (!first) return last;

//   return `${first} ${last}`;
// }

// export function getInitials(name: string, maxInitials: number = 2): string {
//   const trimmed = name?.trim();

//   if (!trimmed) return "";

//   const parts = trimmed.split(/\s+/);
//   const initials = parts
//     .map((part) => part[0]?.toUpperCase() || "")
//     .slice(0, maxInitials)
//     .join("");

//   return initials;
// }
