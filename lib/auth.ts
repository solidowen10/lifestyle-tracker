import { NextRequest } from "next/server";

export type LifestyleUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export async function getCurrentUser(req: NextRequest): Promise<LifestyleUser | null> {
  const cookie = req.headers.get("cookie") || "";
  const host = req.headers.get("host") || "tool.selinnaowen.com";
  const proto = req.headers.get("x-forwarded-proto") || "https";

  const res = await fetch(`${proto}://${host}/spending-tracker/api/whoami`, {
    headers: { cookie },
    cache: "no-store",
  }).catch(() => null);

  if (!res || !res.ok) return null;

  const data = await res.json().catch(() => null);
  const user = data?.user || data;

  const id = user?.id || user?.userId || user?.lineId || user?.sub || user?.email;
  if (!id) return null;

  return {
    id: String(id),
    name: user?.name || user?.displayName || null,
    email: user?.email || null,
    image: user?.image || user?.picture || null,
  };
}

export function loginUrl() {
  return "/spending-tracker/login?next=/lifestyle-tracker";
}
