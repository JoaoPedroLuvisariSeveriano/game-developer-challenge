import React, { useState } from 'react';
import { WoodenModal } from '../ui/WoodenModal';
import { useRankingQuery, useHistoryQuery } from '../../api/hooks';
import { snapshotOptions } from '../../state/optionsStore';
import { usePlayerStore } from '../../state/playerStore';

interface Props {
  defaultTab?: 'ranking' | 'history';
}

export const CaptainsLog: React.FC<Props> = ({ defaultTab = 'ranking' }) => {
  const [tab, setTab] = useState<'ranking' | 'history'>(defaultTab);
  const [page, setPage] = useState(1);
  const size = 5;
  
  const { playerId } = usePlayerStore();

  const ranking = useRankingQuery({ page, pageSize: size, config: snapshotOptions() });
  const history = useHistoryQuery({ page, pageSize: size, playerId });

  const query = tab === 'ranking' ? ranking : history;
  const items = query.data?.items || [];
  const totalPages = query.data?.totalPages || 1;

  const handleTab = (t: 'ranking' | 'history') => {
    setTab(t);
    setPage(1);
  };

  return (
    <WoodenModal title="CAPTAIN'S LOG">
      <div className="flex flex-col h-full w-full max-w-4xl mx-auto flex-1">
        
        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-6">
          <button 
            onClick={() => handleTab('ranking')}
            className={`px-6 py-2 text-2xl font-display uppercase tracking-widest border-b-4 transition-colors ${tab === 'ranking' ? 'text-doubloon border-doubloon drop-shadow-md' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            Ranking
          </button>
          <button 
            onClick={() => handleTab('history')}
            className={`px-6 py-2 text-2xl font-display uppercase tracking-widest border-b-4 transition-colors ${tab === 'history' ? 'text-doubloon border-doubloon drop-shadow-md' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            Match History
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#2d1b15]/80 border-4 border-[#1a0f0c] rounded-lg overflow-hidden flex flex-col shadow-inner">
          
          {query.isLoading ? (
            <div className="flex-1 flex items-center justify-center text-3xl text-lagoon-400 font-display animate-pulse">LOADING...</div>
          ) : query.isError ? (
            <div className="flex-1 flex items-center justify-center text-2xl text-red-400 font-bold">Failed to load data.</div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-2xl text-gray-400 font-sans italic">No records found.</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/80 text-doubloon text-lg uppercase tracking-wider font-display">
                    <th className="p-4 w-24">Rank</th>
                    <th className="p-4">{tab === 'ranking' ? 'Captain' : 'Date'}</th>
                    <th className="p-4">Points</th>
                    <th className="p-4">Played</th>
                  </tr>
                </thead>
                <tbody className="font-sans">
                  {items.map((item: any, idx: number) => {
                    const rank = tab === 'ranking' ? (page - 1) * size + idx + 1 : '-';
                    const isTop3 = tab === 'ranking' && (rank as number) <= 3;
                    return (
                      <tr key={item.matchId} className="border-b border-black/30 even:bg-black/50 odd:bg-black/20 hover:bg-white/5 transition-colors text-xl font-semibold">
                        <td className="p-4 flex items-center gap-2">
                          {isTop3 && <span className="text-doubloon text-2xl" title="Top 3">★</span>}
                          <span className={isTop3 ? 'text-doubloon font-black' : 'text-gray-300'}>#{rank}</span>
                        </td>
                        <td className="p-4 text-foam">{tab === 'ranking' ? item.playerName : new Date(item.playedAt).toLocaleDateString()}</td>
                        <td className="p-4 text-lagoon-400 font-display tracking-wider">{item.score}</td>
                        <td className="p-4 text-gray-400">{item.durationMs ? Math.round(item.durationMs / 1000) : '-'}s</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-8 mt-6">
          <button 
            disabled={page <= 1} 
            onClick={() => setPage(p => p - 1)}
            className="w-14 h-14 bg-gray-800 border-4 border-gray-600 rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-gray-700 active:translate-y-1 transition-all shadow-lg text-white font-black"
          >
            ◀
          </button>
          
          <span className="font-display text-2xl tracking-widest text-doubloon drop-shadow-md">
            PAGE {page} OF {totalPages}
          </span>
          
          <button 
            disabled={page >= totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="w-14 h-14 bg-gray-800 border-4 border-gray-600 rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-gray-700 active:translate-y-1 transition-all shadow-lg text-white font-black"
          >
            ▶
          </button>
        </div>

      </div>
    </WoodenModal>
  );
};
