import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/api/endpoints";
import { qk } from "@/api/queries";
import type { Cart, EditionKind } from "@/api/types";
import { useSession } from "./session";

export function useCart() {
  const { user, status } = useSession();
  const owner = user?.id ?? "guest";
  return useQuery({ queryKey: qk.cart(owner), queryFn: api.cart, enabled: status === "ready", staleTime: 10_000 });
}

export function useCartMutations() {
  const qc = useQueryClient();
  const { user } = useSession();
  const key = qk.cart(user?.id ?? "guest");
  const onSuccess = (c: Cart) => {
    qc.setQueryData(key, c);
    qc.invalidateQueries({ queryKey: ["quote"] });
  };
  const onError = (e: Error) => toast.error(e.message);
  return {
    add: useMutation({ mutationFn: api.addToCart, onSuccess: (c) => (onSuccess(c), toast.success("Adicionado ao carrinho")), onError }),
    update: useMutation({ mutationFn: (b: { nftId: string; edition: EditionKind; quantity: number }) => api.updateCartItem(b), onSuccess, onError }),
    remove: useMutation({ mutationFn: api.removeCartItem, onSuccess: (c) => (onSuccess(c), toast.success("Item removido")), onError }),
  };
}
