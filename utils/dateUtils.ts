
/**
 * Parses a YYYY-MM-DD string into a Date object at local midnight.
 * This avoids timezone shifts that happen with new Date("YYYY-MM-DD").
 */
export const parseLocalDate = (dateStr: string | undefined): Date | null => {
  if (!dateStr || dateStr === "A definir") return null;
  
  // If it's already an ISO string with T, it might be from an old save or different format
  if (dateStr.includes('T')) {
    return new Date(dateStr);
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  
  return new Date(year, month - 1, day);
};

/**
 * Formats a YYYY-MM-DD string to pt-BR locale without timezone shifts.
 */
export const formatLocalDate = (dateStr: string | undefined, options?: Intl.DateTimeFormatOptions): string => {
  const date = parseLocalDate(dateStr);
  if (!date) return "A definir";
  return new Intl.DateTimeFormat('pt-BR', options).format(date);
};
