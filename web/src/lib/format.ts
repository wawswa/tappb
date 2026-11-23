const mediumDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' });
const mediumDateTime = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
});
const numberFormat = new Intl.NumberFormat('id-ID');

export function formatDate(value: string) {
  return mediumDate.format(new Date(value));
}

export function formatDateTime(value: string) {
  return mediumDateTime.format(new Date(value));
}

export function formatNumber(value: number) {
  return numberFormat.format(value);
}

export function formatCoordinate(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}
