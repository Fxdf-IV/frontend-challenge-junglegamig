import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/api/endpoints";
import { qk } from "@/api/queries";
import { useSession } from "./session";

export function useFavorites() {
  const { user } = useSession();
  return useQuery({
    queryKey: qk.favorites(user?.id ?? "-"),
    queryFn: api.favorites,
    enabled: !!user,
    select: (d) => d.ids,
  });
}

/** Optimistic toggle with rollback on failure. */
export function useToggleFavorite() {
  const qc = useQueryClient();
  const { user } = useSession();
  const key = qk.favorites(user?.id ?? "-");
  return useMutation({
    mutationFn: ({ id, on }: { id: string; on: boolean }) =>
      on ? api.addFavorite(id) : api.removeFavorite(id),
    onMutate: async ({ id, on }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<{ ids: string[] }>(key);
      qc.setQueryData<{ ids: string[] }>(key, (o) => ({
        ids: on ? [...(o?.ids ?? []), id] : (o?.ids ?? []).filter((x) => x !== id),
      }));
      return { prev };
    },
    onError: (e, _v, ctx) => {
      qc.setQueryData(key, ctx?.prev);
      toast.error(`${e.message}. O favorito foi restaurado.`);
    },
    onSuccess: (_d, v) =>
      toast.success(v.on ? "Adicionado aos favoritos" : "Removido dos favoritos"),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}
