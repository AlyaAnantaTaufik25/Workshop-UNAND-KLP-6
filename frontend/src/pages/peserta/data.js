// Helper tampilan portal peserta

export function getWorkshopLocation(workshop, format = 'default') {
  if (workshop.mode === 'online') return 'Online';
  if (format === 'short') return workshop.shortPlace || workshop.place;
  if (format === 'full') return workshop.fullPlace || workshop.place;
  return workshop.place;
}

export function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
}
