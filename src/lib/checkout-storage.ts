/** Browser storage keys for checkout continuity across refresh / re-login. */
export const COUPON_KEY = "kurio.coupon";
export const DRAFT_KEY = "kurio.checkoutDraft";
export const PENDING_ORDER_KEY = "kurio.pendingOrder";
export const idemKey = (quoteId: string) => `kurio.idem.${quoteId}`;
