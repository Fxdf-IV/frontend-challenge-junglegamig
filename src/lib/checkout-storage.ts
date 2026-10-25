// Chaves de armazenamento no navegador (localStorage/sessionStorage) para continuidade do checkout.
// Permite manter rascunho, cupom aplicado e pedidos pendentes entre navegações e login.

/** Chave de storage para o cupom aplicado na sessão do carrinho. */
export const COUPON_KEY = "kurio.coupon";

/** Chave de storage para o rascunho de endereço e opções do checkout. */
export const DRAFT_KEY = "kurio.checkoutDraft";

/** Chave de storage para o pedido em estado pendente aguardando processamento. */
export const PENDING_ORDER_KEY = "kurio.pendingOrder";

/** Gera a chave de idempotência do pedido a partir do identificador da cotação. */
export const idemKey = (quoteId: string) => `kurio.idem.${quoteId}`;
