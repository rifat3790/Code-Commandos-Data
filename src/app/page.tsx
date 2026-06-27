import MainDashboard from '@/components/MainDashboard';

export default async function Home() {
  // Fetching both the metadata sheet (F_META) and the Issue sheet
  const [resOrders, resIssues] = await Promise.all([
    fetch('https://docs.google.com/spreadsheets/d/1IRIDbowvg0qM9wqNMxegwqz4jNGl6bj9UThL0NjYScQ/export?format=csv&gid=453782671', { next: { revalidate: 60 } }),
    fetch('https://docs.google.com/spreadsheets/d/1ic9UMVX0FFsAyz0TZ-_lGKj_D9NornoGhq38KTRtM54/export?format=csv&gid=1412843338', { next: { revalidate: 60 } })
  ]);
  
  if (!resOrders.ok || !resIssues.ok) {
    return <div className="p-8 text-white">Failed to fetch data from the spreadsheets. Check if the links are public.</div>;
  }
  
  const csvDataOrders = await resOrders.text();
  const csvDataIssues = await resIssues.text();

  return (
    <main className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text pb-2">
              Code Commandos
            </h1>
            <p className="text-slate-400 mt-1 text-lg">Central Dashboard</p>
          </div>
          <div className="hidden md:flex h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center shadow-lg shadow-indigo-500/20 rotate-3 hover:rotate-6 transition-transform">
            <span className="font-bold text-2xl text-white">CC</span>
          </div>
        </header>

        <MainDashboard csvDataOrders={csvDataOrders} csvDataIssues={csvDataIssues} />
      </div>
    </main>
  );
}
