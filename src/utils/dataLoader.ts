import data from '../data/data.json';

// All data exports from data.json
export const projects = data.projects;
export const servers = data.servers;
export const domains = data.domains;
export const team = data.team;
export const activities = (data as any).activities || [];

// Note: upcomingProjects now uses the API service instead of static data
// Import the service where needed: import { upcomingProjectService } from '../services/upcomingProjectService';

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

  // Check projects for renewal dates - only count expired items and truly urgent renewals
  projects.forEach((project) => {
    if (project.renewalDate === "Expired") {
      // Count expired items
      renewalItems.add(`project:${project.name}`);
    } else if (project.renewalDate && project.renewalDate !== "Not purchased yet" && project.renewalDate !== "No Renewal (Handover Complete)") {
      const daysUntil = getDaysUntil(project.renewalDate);
      // Only count items expiring within 7 days (more urgent)
      if (daysUntil <= 7 && daysUntil >= 0) {
        renewalItems.add(`project:${project.name}`);
      }
    }
  });

  // Check domains for renewal dates - only count expired items and truly urgent renewals
  domains.forEach((domain) => {
    if (domain.renewalDate === "Expired") {
      // Count expired items
      renewalItems.add(`domain:${domain.name}`);
    } else if (domain.renewalDate) {
      const daysUntil = getDaysUntil(domain.renewalDate);
      // Only count items expiring within 7 days (more urgent)
      if (daysUntil <= 7 && daysUntil >= 0) {
        renewalItems.add(`domain:${domain.name}`);
      }
    }
  });

  return renewalItems.size;
};

export const getExpiredItems = (): Array<{name: string, type: string, renewalDate: string}> => {
  const expiredItems: Array<{name: string, type: string, renewalDate: string}> = [];

  // Check projects for expired items
  projects.forEach((project) => {
    if (project.renewalDate === "Expired") {
      expiredItems.push({
        name: project.name,
        type: 'Project',
        renewalDate: project.renewalDate
      });
    }
  });

  // Check domains for expired items
  domains.forEach((domain) => {
    if (domain.renewalDate === "Expired") {
      expiredItems.push({
        name: domain.name,
        type: 'Domain',
        renewalDate: domain.renewalDate
      });
    }
  });

  return expiredItems;
};

