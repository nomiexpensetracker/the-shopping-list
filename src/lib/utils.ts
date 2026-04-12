import { Participant } from "@/types/dao";

// function to generate a random hex color 
export function getRandomHexColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// function to format number to rupiah currency format
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

// function to get user color based on current user id and participants data
export function getUserColor(userId: string, data: Participant[]): string {
  const participant = data.find(p => p.id === userId);
  return participant ? participant.color : "#8df7c7";
}

// function to format date to locale date, default ID-id
export function formatLocaleData(date: string, locale = "id-ID"): string {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/** Format a currency amount using the given locale and currency code. */
export function formatCurrency(amount: number, locale = "id-ID", currency = "IDR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}