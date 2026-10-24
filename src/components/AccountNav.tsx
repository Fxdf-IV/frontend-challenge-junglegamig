import { Link } from "@tanstack/react-router";
import { User, Wallet } from "lucide-react";

export function AccountNav() {
  const cls = "flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-panel";
  return (
    <nav aria-label="Conta" className="h-fit rounded-lg bg-card p-3">
      <p className="mb-2 px-3 text-sm font-bold">Meu perfil</p>
      <ul>
        <li><Link to="/perfil" className={cls} activeProps={{ className: "text-primary" }}><User className="h-4 w-4" aria-hidden /> Dados do perfil</Link></li>
        <li><Link to="/carteiras" className={cls} activeProps={{ className: "text-primary" }}><Wallet className="h-4 w-4" aria-hidden /> Carteiras</Link></li>
      </ul>
    </nav>
  );
}
