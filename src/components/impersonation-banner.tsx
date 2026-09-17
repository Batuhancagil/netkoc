export function ImpersonationBanner({
  adminName,
  targetName,
}: {
  adminName: string;
  targetName: string;
}) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950">
      <span>
        <strong>{adminName}</strong> olarak <strong>{targetName}</strong> hesabina
        girdin. Tum aksiyonlar loglanacak.
      </span>
      <form action="/api/admin/impersonate/stop" method="post">
        <button className="rounded-md bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-50 hover:bg-amber-900">
          Cik
        </button>
      </form>
    </div>
  );
}
