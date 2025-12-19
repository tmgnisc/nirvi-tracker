// Utility helpers for date calculations and renewal statistics.
// Data (projects, domains, etc.) now comes from the API, not from JSON files.

export const getDaysUntil = (dateString: string): number => {
  // Handle special cases in the new data
  if (dateString === "Not purchased yet" || dateString === "No Renewal (Handover Complete)" || dateString === "Expired") {
    return -1; // Special case for non-renewable items
  }
  
  const targetDate = new Date(dateString);
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};


export const getRenewalCount = (): number => {
  const renewalItems = new Set<string>();
  return renewalItems.size;
};

export const getExpiredItems = (): Array<{name: string, type: string, renewalDate: string}> => {
  const expiredItems: Array<{name: string, type: string, renewalDate: string}> = [];
  return expiredItems;
};

