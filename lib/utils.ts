import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWhatsAppNumber(phone: string): string {
  // Remove any non-numeric characters (spaces, dashes, plus signs)
  let cleaned = phone.replace(/\D/g, "")

  // If it starts with '0' (like 08012345678), replace it with '234'
  if (cleaned.startsWith("0")) {
    cleaned = "234" + cleaned.slice(1)
  }
  
  // If they somehow entered just '8012345678' without 0 or 234
  else if (cleaned.length === 10 && cleaned.startsWith("8")) {
    cleaned = "234" + cleaned
  }

  return cleaned
}
