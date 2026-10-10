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
        <div className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden flex flex-col p-2 shadow-xl backdrop-blur-sm">
          
          {query.isFetching ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full animate-spin border-4 border-solid border-yellow-400 border-t-transparent shadow-lg"></div>
              <div className="text-xl text-yellow-400 font-display animate-pulse tracking-widest">A SONDAR OS MARES...</div>
            </div>
          ) : query.isError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-red-500/50 rounded-xl bg-red-900/20 text-center m-4">
              <span className="text-5xl mb-4 drop-shadow-md">⚠️</span>
              <div className="text-2xl text-red-400 font-bold mb-6">A comunicação com a base falhou!</div>
              <button 
                onClick={() => query.refetch()} 
                className="px-6 py-3 bg-red-600/80 hover:bg-red-500 text-white rounded-lg font-bold transition-colors uppercase tracking-wider shadow-lg border border-red-400/50"
              >
                Tentar Novamente
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-2xl text-gray-400 font-sans italic">
              Nenhum registo encontrado nestas águas.
            </div>
          ) : (
            <div className="overflow-x-auto w-full h-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-300 text-sm uppercase tracking-widest font-display bg-slate-900/50 border-b border-slate-700">
                    <th className="p-4 w-24">Posição</th>
                    <th className="p-4">{tab === 'ranking' ? 'Capitão' : 'Data'}</th>
                    <th className="p-4 text-center">Pontuação</th>
                    <th className="p-4 text-center">Tempo (s)</th>
                    <th className="p-4 text-center">Desfecho</th>
                  </tr>
                </thead>
                <tbody className="font-sans">
                  {items.map((item: any, idx: number) => {
                    const rank = tab === 'ranking' ? (page - 1) * size + idx + 1 : '-';
                    const isTop3 = tab === 'ranking' && (rank as number) <= 3;
                    const isVictory = item.endReason === 'time_up';
                    const statusColor = isVictory ? 'text-emerald-400' : 'text-red-400';
                    const statusText = isVictory ? 'VITÓRIA' : 'DERROTA';
                    
                    return (
                      <tr key={item.matchId} className="border-b border-slate-700/50 even:bg-slate-800/30 hover:bg-slate-700/50 transition-colors text-lg text-gray-100 cursor-default">
                        <td className="p-4 flex items-center gap-2">
                          {isTop3 && <span className="text-yellow-400 text-xl" title="Top 3">★</span>}
                          <span className={isTop3 ? 'text-yellow-400 font-black' : 'text-gray-400 font-semibold'}>{rank !== '-' ? `#${rank}` : '-'}</span>
                        </td>
                        <td className="p-4 font-medium">{tab === 'ranking' ? item.nickname : new Date(item.playedAt).toLocaleString()}</td>
                        <td className="p-4 text-center text-yellow-400 font-bold font-mono tracking-wider">{item.score}</td>
                        <td className="p-4 text-center text-gray-300 font-mono">{item.durationMs ? Math.round(item.durationMs / 1000) : '-'}</td>
                        <td className={`p-4 text-center font-display tracking-widest text-sm ${statusColor}`}>{statusText}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-6 mt-6">
          <button 
            disabled={page <= 1 || query.isFetching} 
            onClick={() => setPage(p => p - 1)}
            className="px-6 py-2 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 active:scale-95 transition-all shadow-md text-white font-bold uppercase tracking-widest"
          >
            Anterior
          </button>
          
          <span className="font-display text-xl tracking-widest text-yellow-400 drop-shadow-md">
            PÁGINA {page} DE {totalPages}
          </span>
          
          <button 
            disabled={page >= totalPages || query.isFetching} 
            onClick={() => setPage(p => p + 1)}
            className="px-6 py-2 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 active:scale-95 transition-all shadow-md text-white font-bold uppercase tracking-widest"
          >
            Próxima
          </button>
        </div>

      </div>
    </WoodenModal>
  );
};
