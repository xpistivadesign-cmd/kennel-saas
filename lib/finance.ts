export function getPaymentStatus(puppy: any) {
  if (puppy.buyer_id && puppy.deposit > 0 && puppy.sale_price > puppy.deposit) {
    return "PARTIAL";
  }

  if (puppy.buyer_id) {
    return "PAID";
  }

  return "AVAILABLE";
}