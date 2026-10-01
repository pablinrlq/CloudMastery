// Esqueleto exibido na hora durante a navegação entre páginas da área logada.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-5 sm:px-8 sm:py-8 xl:px-10 xl:py-10" aria-busy="true" aria-label="Carregando">
      <div className="ws-ink p-6 sm:p-8 xl:p-10">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_17rem] xl:items-center">
          <div>
            <div className="ws-skeleton ws-skeleton-ink h-3 w-40" />
            <div className="ws-skeleton ws-skeleton-ink mt-5 h-9 w-full max-w-xl" />
            <div className="ws-skeleton ws-skeleton-ink mt-3 h-9 w-2/3 max-w-md" />
            <div className="ws-skeleton ws-skeleton-ink mt-8 h-24 w-full rounded-[1.25rem]" />
          </div>
          <div className="ws-skeleton ws-skeleton-ink mx-auto hidden h-40 w-40 !rounded-full xl:block" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="ws-card p-5">
            <div className="ws-skeleton h-3 w-20" />
            <div className="ws-skeleton mt-4 h-8 w-16" />
            <div className="ws-skeleton mt-4 h-2 w-full" />
          </div>
        ))}
      </div>
      <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="ws-card p-6">
            <div className="flex items-center gap-3">
              <div className="ws-skeleton h-11 w-11" />
              <div className="flex-1">
                <div className="ws-skeleton h-3 w-24" />
                <div className="ws-skeleton mt-2 h-4 w-40" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-5">
              <div className="ws-skeleton h-24 w-24 !rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="ws-skeleton h-4 w-3/4" />
                <div className="ws-skeleton h-4 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
