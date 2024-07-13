export function formatDate(date: Date, locale: string = 'en-US') {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'long', }).format(date);
}