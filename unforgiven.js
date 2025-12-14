import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Shield, Heart, Zap, RotateCcw, Save, Edit2, X, FileText, Skull } from 'lucide-react';

// Ícone personalizado de Distintivo para substituir o que falhou
const SheriffStarIcon = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export default function RPGTracker() {
  // Estado inicial carregado do localStorage se existir
  const [characters, setCharacters] = useState(() => {
    const saved = localStorage.getItem('rpg-tracker-data');
    return saved ? JSON.parse(saved) : [];
  });

  const [newChar, setNewChar] = useState({
    name: '',
    initiative: '',
    hpCurrent: '',
    hpTotal: '',
    garraCurrent: '',
    garraTotal: ''
  });

  const [turnIndex, setTurnIndex] = useState(0);
  const [notification, setNotification] = useState('');

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('rpg-tracker-data', JSON.stringify(characters));
  }, [characters]);

  // Função para adicionar personagem
  const addCharacter = (e) => {
    e.preventDefault();
    if (!newChar.name) return;

    const character = {
      id: Date.now(),
      name: newChar.name,
      initiative: Number(newChar.initiative) || 0,
      hpCurrent: Number(newChar.hpCurrent) || 10,
      hpTotal: Number(newChar.hpTotal) || 10,
      garraCurrent: Number(newChar.garraCurrent) || 0,
      garraTotal: Number(newChar.garraTotal) || 0,
    };

    // Adiciona e já ordena
    const updatedList = [...characters, character].sort((a, b) => b.initiative - a.initiative);
    setCharacters(updatedList);
    
    // Limpa o form
    setNewChar({ name: '', initiative: '', hpCurrent: '', hpTotal: '', garraCurrent: '', garraTotal: '' });
  };

  // Atualizar um personagem específico
  const updateCharacter = (id, field, value) => {
    const updatedList = characters.map(char => {
      if (char.id === id) {
        return { ...char, [field]: Number(value) };
      }
      return char;
    });
    
    // Se mudou iniciativa, reordena
    if (field === 'initiative') {
      updatedList.sort((a, b) => b.initiative - a.initiative);
    }
    
    setCharacters(updatedList);
  };

  // Remover personagem
  const removeCharacter = (id) => {
    setCharacters(characters.filter(c => c.id !== id));
  };

  // Texto gerado automaticamente
  const exportText = characters.map((char, index) => 
    `${index + 1}- ${char.name} HP [${char.hpCurrent}/${char.hpTotal}] Garra (${char.garraCurrent}/${char.garraTotal})`
  ).join('\n');

  // Copiar o texto
  const copyToClipboard = () => {
    if (!exportText) return;
    navigator.clipboard.writeText(exportText);
    showNotification('Resumo copiado para o telégrafo!');
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Avançar turno
  const nextTurn = () => {
    setTurnIndex((prev) => (prev + 1) % characters.length);
  };

  // Renderizar a barra de progresso (HP ou Garra)
  const ProgressBar = ({ current, total, colorClass, bgClass }) => {
    const percentage = Math.min(100, Math.max(0, (current / total) * 100));
    return (
      <div className={`w-full h-3 ${bgClass} rounded-sm mt-1 border border-stone-700/50 shadow-inner`}>
        <div 
          className={`h-full ${colorClass} rounded-sm transition-all duration-300 relative`} 
          style={{ width: `${percentage}%` }}
        >
          {/* Brilho sutil na barra */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1c1917] text-[#e7e5e4] p-4 font-sans selection:bg-orange-900 selection:text-orange-100">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 border-b-2 border-[#44403c] pb-6 border-dashed">
          <div>
            <h1 className="text-4xl font-serif font-bold text-amber-600 tracking-wider drop-shadow-md flex items-center gap-3">
              <span className="text-3xl">🌵</span> WANTED: INICIATIVA
            </h1>
            <p className="text-[#a8a29e] text-sm font-serif italic mt-1">O gatilho mais rápido do oeste</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setTurnIndex(0)}
              className="px-4 py-2 bg-[#44403c] hover:bg-[#57534e] text-amber-100 rounded-sm border border-[#78716c] flex items-center gap-2 transition-colors text-sm font-serif uppercase tracking-wide shadow-md"
            >
              <RotateCcw size={16} className="text-amber-500" /> Novo Duelo
            </button>
          </div>
        </header>

        {/* Notificação Toast */}
        {notification && (
          <div className="fixed top-4 right-4 bg-amber-700 text-amber-50 border-2 border-amber-900 px-6 py-3 rounded-sm shadow-2xl animate-bounce z-50 font-serif flex items-center gap-2">
            <SheriffStarIcon size={20} /> {notification}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna Esquerda: Formulário e Preview de Texto */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Form de Criação */}
            <div className="bg-[#292524] p-6 rounded-sm border-2 border-[#44403c] shadow-xl relative overflow-hidden">
              {/* Efeito de "Papel" no fundo */}
              <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                 <Skull size={100} />
              </div>

              <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2 text-amber-500 border-b border-[#44403c] pb-2">
                <Plus size={20} /> NOVO FORASTEIRO
              </h2>
              <form onSubmit={addCharacter} className="space-y-4 relative z-10">
                <div>
                  <label className="block text-xs text-[#a8a29e] uppercase tracking-widest mb-1 font-bold">Nome</label>
                  <input 
                    type="text" 
                    value={newChar.name}
                    onChange={e => setNewChar({...newChar, name: e.target.value})}
                    className="w-full bg-[#1c1917] border border-[#57534e] rounded-sm p-2 focus:ring-1 focus:ring-amber-600 focus:border-amber-600 outline-none text-amber-50 placeholder-[#44403c] font-serif"
                    placeholder="Ex: Billy the Kid"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#a8a29e] uppercase tracking-widest mb-1 font-bold">Iniciativa</label>
                    <input 
                      type="number" 
                      value={newChar.initiative}
                      onChange={e => setNewChar({...newChar, initiative: e.target.value})}
                      className="w-full bg-[#1c1917] border border-[#57534e] rounded-sm p-2 focus:ring-1 focus:ring-amber-600 outline-none text-amber-400 font-mono text-lg"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-red-900/70 uppercase tracking-widest mb-1 font-bold bg-red-900/20 w-fit px-1 rounded">HP Total</label>
                    <input 
                      type="number" 
                      value={newChar.hpTotal}
                      onChange={e => setNewChar({...newChar, hpTotal: e.target.value, hpCurrent: e.target.value})}
                      className="w-full bg-[#1c1917] border border-[#57534e] rounded-sm p-2 focus:ring-1 focus:ring-red-900 outline-none text-red-200 font-mono"
                      placeholder="Max"
                    />
                  </div>
                   <div>
                    <label className="block text-xs text-amber-700/70 uppercase tracking-widest mb-1 font-bold bg-amber-900/20 w-fit px-1 rounded">Garra Total</label>
                    <input 
                      type="number" 
                      value={newChar.garraTotal}
                      onChange={e => setNewChar({...newChar, garraTotal: e.target.value, garraCurrent: e.target.value})}
                      className="w-full bg-[#1c1917] border border-[#57534e] rounded-sm p-2 focus:ring-1 focus:ring-amber-600 outline-none text-amber-200 font-mono"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-amber-700 hover:bg-amber-600 text-amber-50 font-bold py-3 rounded-sm transition-all shadow-lg mt-2 border-b-4 border-amber-900 active:border-b-0 active:translate-y-1 font-serif tracking-wide uppercase"
                >
                  Adicionar ao Bando
                </button>
              </form>
            </div>

            {/* PREVIEW DE TEXTO */}
            <div className="bg-[#292524] p-4 rounded-sm border-2 border-[#44403c] shadow-xl relative">
              <div className="absolute -top-3 -right-3 bg-[#1c1917] p-2 rounded-full border border-[#44403c]">
                 <FileText size={20} className="text-amber-600"/>
              </div>
              <div className="flex justify-between items-center mb-3 border-b border-[#44403c] pb-2">
                <h3 className="text-sm font-bold text-[#a8a29e] flex items-center gap-2 font-serif tracking-widest uppercase">
                  Relatório do Xerife
                </h3>
                <button 
                  onClick={copyToClipboard}
                  className="text-xs bg-[#44403c] hover:bg-[#57534e] px-3 py-1 rounded-sm text-amber-100 flex items-center gap-1 transition-colors border border-[#57534e] uppercase font-bold"
                >
                  <Copy size={12}/> Copiar
                </button>
              </div>
              <textarea 
                readOnly
                value={exportText}
                className="w-full h-32 bg-[#1c1917] border border-[#44403c] rounded-sm p-3 text-xs font-mono text-[#d6d3d1] resize-none focus:outline-none focus:border-amber-700/50"
                placeholder="O salão está vazio..."
              />
            </div>

          </div>

          {/* Coluna Direita: Lista */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-2 px-1">
              <h2 className="text-xl font-serif font-bold text-[#d6d3d1] tracking-wide">Ordem de Saque</h2>
              <span className="text-xs bg-[#292524] px-3 py-1 rounded-sm text-[#a8a29e] border border-[#44403c] font-mono">
                {characters.length} pistoleiros
              </span>
            </div>

            {characters.length === 0 ? (
              <div className="text-center py-16 bg-[#292524]/50 rounded-sm border-2 border-dashed border-[#44403c] flex flex-col items-center gap-4">
                <div className="opacity-20 text-amber-700">
                    <Skull size={64} strokeWidth={1} />
                </div>
                <div>
                    <p className="text-[#78716c] font-serif text-lg">A poeira baixa...</p>
                    <p className="text-[#57534e] text-sm">Adicione forasteiros para começar o tiroteio.</p>
                </div>
              </div>
            ) : (
              characters.map((char, index) => (
                <div 
                  key={char.id} 
                  className={`relative group bg-[#292524] rounded-sm p-4 border-2 transition-all duration-300 ${
                    index === turnIndex 
                      ? 'border-amber-600 shadow-[0_0_20px_rgba(217,119,6,0.15)] scale-[1.01]' 
                      : 'border-[#44403c] hover:border-[#57534e]'
                  }`}
                >
                  {index === turnIndex && (
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 md:-left-4 md:top-1/2 flex items-center justify-center">
                       <div className="hidden md:block text-amber-600 drop-shadow-lg">
                           <span className="text-3xl">👉</span>
                       </div>
                    </div>
                  )}

                  {/* Efeito de "Wanted" badge se for o turno */}
                   {index === turnIndex && (
                    <div className="absolute top-0 right-0 bg-amber-600 text-[#292524] text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest rounded-bl-sm">
                        Turno Atual
                    </div>
                   )}

                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    
                    {/* Iniciativa e Nome */}
                    <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                      <div className="flex flex-col items-center justify-center w-14 h-14 bg-[#1c1917] rounded-sm border border-[#44403c] shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 to-transparent"></div>
                        <span className="text-[10px] text-[#78716c] uppercase font-bold z-10">Inic</span>
                        <input 
                          type="number"
                          value={char.initiative}
                          onChange={(e) => updateCharacter(char.id, 'initiative', e.target.value)}
                          className="w-full text-center bg-transparent text-amber-500 font-serif font-bold text-2xl outline-none z-10"
                        />
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center gap-3">
                           <span className="text-[#57534e] font-serif font-bold text-lg opacity-50">#{index + 1}</span>
                           <h3 className={`font-serif font-bold text-xl tracking-wide ${index === turnIndex ? 'text-amber-500' : 'text-[#e7e5e4]'}`}>
                             {char.name}
                           </h3>
                         </div>
                      </div>
                    </div>

                    {/* Status Stats */}
                    <div className="flex gap-4 w-full md:w-auto flex-col md:flex-row border-t md:border-t-0 border-[#44403c] pt-3 md:pt-0 mt-2 md:mt-0">
                      
                      {/* HP */}
                      <div className="flex-1 min-w-[150px]">
                        <div className="flex justify-between text-xs mb-1 font-bold">
                          <span className="text-red-400/80 flex items-center gap-1 uppercase tracking-wider"><Heart size={10} fill="currentColor"/> Vigor</span>
                          <span className="text-[#78716c] font-mono">{char.hpCurrent}/{char.hpTotal}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-[#1c1917] rounded-sm px-1 py-1 border border-[#44403c]">
                          <button 
                             onClick={() => updateCharacter(char.id, 'hpCurrent', Math.max(0, char.hpCurrent - 1))}
                             className="text-red-500 hover:bg-red-900/20 w-6 h-6 flex items-center justify-center rounded-sm transition-colors font-bold"
                          >-</button>
                          <input 
                            type="number"
                            value={char.hpCurrent}
                            onChange={(e) => updateCharacter(char.id, 'hpCurrent', e.target.value)}
                            className="w-full text-center bg-transparent text-[#e7e5e4] font-mono text-sm outline-none"
                          />
                          <button 
                             onClick={() => updateCharacter(char.id, 'hpCurrent', Math.min(char.hpTotal, char.hpCurrent + 1))}
                             className="text-green-600 hover:bg-green-900/20 w-6 h-6 flex items-center justify-center rounded-sm transition-colors font-bold"
                          >+</button>
                        </div>
                        <ProgressBar current={char.hpCurrent} total={char.hpTotal} colorClass="bg-red-700" bgClass="bg-red-950/40" />
                      </div>

                      {/* Garra */}
                      <div className="flex-1 min-w-[150px]">
                        <div className="flex justify-between text-xs mb-1 font-bold">
                          <span className="text-amber-500/80 flex items-center gap-1 uppercase tracking-wider"><Zap size={10} fill="currentColor"/> Garra</span>
                          <span className="text-[#78716c] font-mono">{char.garraCurrent}/{char.garraTotal}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-[#1c1917] rounded-sm px-1 py-1 border border-[#44403c]">
                          <button 
                             onClick={() => updateCharacter(char.id, 'garraCurrent', Math.max(0, char.garraCurrent - 1))}
                             className="text-amber-600 hover:bg-amber-900/20 w-6 h-6 flex items-center justify-center rounded-sm transition-colors font-bold"
                          >-</button>
                          <input 
                            type="number"
                            value={char.garraCurrent}
                            onChange={(e) => updateCharacter(char.id, 'garraCurrent', e.target.value)}
                            className="w-full text-center bg-transparent text-[#e7e5e4] font-mono text-sm outline-none"
                          />
                          <button 
                             onClick={() => updateCharacter(char.id, 'garraCurrent', Math.min(char.garraTotal, char.garraCurrent + 1))}
                             className="text-amber-600 hover:bg-amber-900/20 w-6 h-6 flex items-center justify-center rounded-sm transition-colors font-bold"
                          >+</button>
                        </div>
                        <ProgressBar current={char.garraCurrent} total={char.garraTotal} colorClass="bg-amber-600" bgClass="bg-amber-950/40" />
                      </div>

                    </div>

                    {/* Ações */}
                    <div className="flex items-center justify-end md:ml-2">
                      <button 
                        onClick={() => removeCharacter(char.id)}
                        className="text-[#57534e] hover:text-red-400 hover:bg-[#1c1917] p-2 rounded-sm transition-all md:opacity-0 md:group-hover:opacity-100"
                        title="Mandar pro caixão"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                  </div>
                </div>
              ))
            )}

            {/* Botão de Próximo Turno Flutuante Mobile */}
            {characters.length > 0 && (
              <button 
                onClick={nextTurn}
                className="w-full py-4 mt-4 bg-amber-700 hover:bg-amber-600 text-amber-50 font-serif font-bold tracking-widest uppercase rounded-sm transition-all flex items-center justify-center gap-3 border-b-4 border-amber-900 active:border-b-0 active:translate-y-1 shadow-xl"
              >
                Próximo Turno <span className="text-xs font-mono opacity-70 normal-case bg-amber-900/30 px-2 py-0.5 rounded">Enter</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}