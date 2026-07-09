"use client"

import { MessageCircleMoreIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatWhatsAppNumber } from "@/lib/utils"

interface WhatsAppButtonProps {
  sellerPhone: string
  sellerName: string
  listingTitle: string
  listingPrice: number
  isLoggedIn: boolean
}

export function WhatsAppButton({ 
  sellerPhone, 
  sellerName, 
  listingTitle, 
  listingPrice,
  isLoggedIn 
}: WhatsAppButtonProps) {
  const handleWhatsAppClick = () => {
    if (!isLoggedIn) {
      // If the user wants to enforce login to message, we could redirect to login here.
      // But the spec says "sellers whatsApp plan number is invisible to public, the button does the redirection to whats"
      // We will allow the redirection even if not logged in.
    }

    const formattedPhone = formatWhatsAppNumber(sellerPhone)
    const formattedPrice = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(listingPrice)

    const message = `Hi ${sellerName.split(" ")[0]}, I saw your listing for "${listingTitle}" on Unimart for ${formattedPrice}. Is it still available?`
    
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
    
    window.open(whatsappUrl, "_blank")
  }

  return (
    <Button 
      onClick={handleWhatsAppClick}
      className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-medium text-base h-12 shadow-md border-0 group"
    >
      <MessageCircleMoreIcon className="size-5 mr-2 text-white group-hover:scale-110 transition-transform" />
      Contact Seller on WhatsApp
    </Button>
  )
}
