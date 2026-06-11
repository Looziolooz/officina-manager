import Link from "next/link";
import ConfirmSubmitButton from "@/components/ui/ConfirmSubmitButton";
import { getUsers } from "@/app/actions/users";
import { toggleUserStatus, deleteUser } from "@/app/actions/users";
import { Role } from "@prisma/client";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await getUsers();

  async function handleToggleStatus(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const isActive = formData.get("isActive") === "true";
    await toggleUserStatus(id, !isActive);
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteUser(id);
  }

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Amministratore",
    MANAGER: "Manager",
    MECHANIC: "Meccanico",
    RECEPTIONIST: "Recezionista",
    VIEWER: "Visualizzatore",
  };

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: "bg-red-100 text-red-800",
    ADMIN: "bg-purple-100 text-purple-800",
    MANAGER: "bg-blue-100 text-blue-800",
    MECHANIC: "bg-green-100 text-green-800",
    RECEPTIONIST: "bg-yellow-100 text-yellow-800",
    VIEWER: "bg-gray-100 text-gray-800",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestione Utenti</h1>
        <Link
          href="/admin/users/new"
          className="bg-blue-600 text-foreground px-4 py-2 rounded hover:bg-blue-700"
        >
          Nuovo Utente
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Ruolo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Stato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Ultimo Accesso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                2FA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  {user.isLocked && (
                    <div className="text-xs text-red-600">Bloccato</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${roleColors[user.role || "VIEWER"]}`}>
                    {roleLabels[user.role || "VIEWER"]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <form action={handleToggleStatus} className="inline">
                    <input type="hidden" name="id" value={user.id} />
                    <input type="hidden" name="isActive" value={user.isActive?.toString()} />
                    <button
                      type="submit"
                      className={`px-2 py-1 text-xs rounded ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Attivo" : "Disattivo"}
                    </button>
                  </form>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {user.lastLoginSuccess
                    ? format(new Date(user.lastLoginSuccess), "dd/MM/yyyy", { locale: it })
                    : "Mai"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {user.twoFactorEnabled ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Modifica
                  </Link>
                  <form action={handleDelete} className="inline">
                    <input type="hidden" name="id" value={user.id} />
                    <ConfirmSubmitButton
                      className="text-red-600 hover:text-red-900"
                      message="Sei sicuro di voler eliminare questo utente?"
                    >
                      Elimina
                    </ConfirmSubmitButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nessun utente trovato
          </div>
        )}
      </div>
    </div>
  );
}
