import { useMemo, useState, useRef, useEffect } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Eye, Flame, Moon, Play, RotateCcw, Shield, Skull, Sparkles, Swords, Volume2, VolumeX, Wand2, Users, Check, Droplet, Heart, EyeOff, Crown, AlertTriangle, Music, Ghost, Eye as EyeIcon } from 'lucide-react';

type Phase = 'home' | 'setup' | 'reveal' | 'night' | 'vote' | 'result' | 'log' | 'gameover';
type RoleKey = 'wolf' | 'villager' | 'seer' | 'witch' | 'guardian' | 'spirit' | 'alpha' | 'thief' | 'leader';
type LogEntry = { title: string; text: string; tone: 'dark' | 'gold' | 'green' | 'red' };
type SoundType = 'wolf' | 'witch' | 'night' | 'success';
type MusicTrack = 'dark' | 'forest' | 'tense' | 'victory';

import wolfImg from '@/assets/images/roles/wolf.jpg';
import villagerImg from '@/assets/images/roles/villager.jpg';
import seerImg from '@/assets/images/roles/seer.jpg';
import witchImg from '@/assets/images/roles/witch.jpg';
import guardianImg from '@/assets/images/roles/guardian.jpg';
import spiritImg from '@/assets/images/roles/spirit.jpg';
import alphaImg from '@/assets/images/roles/alpha.jpg';
import thiefImg from '@/assets/images/roles/thief.jpg';
import leaderImg from '@/assets/images/roles/leader.jpg';
import wolvesWinImg from '@/assets/images/memes/wolves-win.jpg';
import villageWinImg from '@/assets/images/memes/village-win.jpg';
import wolfHowlAudio from '@/assets/audio/wolf-howl.mp3';
import witchLaughAudio from '@/assets/audio/witch-laugh.mp3';
import musicDark from '@/assets/audio/music-dark.mp3';
import musicForest from '@/assets/audio/music-forest.mp3';
import musicTense from '@/assets/audio/music-tense.mp3';
import musicVictory from '@/assets/audio/music-victory.mp3';

const roleImages: Record<RoleKey, string> = {
  wolf: wolfImg, villager: villagerImg, seer: seerImg, witch: witchImg,
  guardian: guardianImg, spirit: spiritImg, alpha: alphaImg, thief: thiefImg, leader: leaderImg,
};

const memeImages = { wolvesWin: wolvesWinImg, villageWin: villageWinImg };

const musicTracks: Record<MusicTrack, string> = {
  dark: musicDark, forest: musicForest, tense: musicTense, victory: musicVictory,
};

const roleInfo: Record<RoleKey, { name: string; icon: string; color: string; description: string; isSecret: boolean }> = {
  wolf: { name: 'ذئب', icon: '☾', color: 'red', description: 'يستيقظ مع الذئاب ويختار ضحية كل ليلة.', isSecret: false },
  villager: { name: 'قروي', icon: '✦', color: 'blue', description: 'يراقب، يناقش، ويصوت لكشف الذئاب.', isSecret: false },
  seer: { name: 'العراف', icon: '◉', color: 'gold', description: 'يفحص لاعباً واحداً ويعرف حقيقته.', isSecret: false },
  witch: { name: 'الساحرة', icon: '✧', color: 'purple', description: 'تملك جرعة حماية وجرعة قتل، مرة لكل واحدة.', isSecret: false },
  guardian: { name: 'الحارس', icon: '⬡', color: 'green', description: 'يحمي لاعباً يختاره يدوياً. يمكنه حماية نفسه لكن لا يحمي نفس الشخص مرتين.', isSecret: false },
  spirit: { name: 'روح القرية', icon: '👻', color: 'teal', description: 'يمكنه التصويت حتى بعد قتله أو إقصائه. روحه لا تموت.', isSecret: true },
  alpha: { name: 'قائد الذئاب', icon: '♜', color: 'red', description: 'قائد الذئاب. يمكنه إرجاع ذئب مقصي.', isSecret: true },
  thief: { name: 'السارق', icon: '⌁', color: 'orange', description: 'يسرق دور لاعب عند بداية اللعبة.', isSecret: true },
  leader: { name: 'قائد القرية', icon: '♔', color: 'gold', description: 'لا يظهر في البطاقات. صوته في التصويت يعتبر 2 بدلاً من 1.', isSecret: true },
};

const defaultPlayers = ['يونس', 'سلمى', 'حمزة', 'ليان', 'آدم', 'نور', 'رؤى', 'إياد'];

const funnyProtection = [
  'خرج الحارس يركض بجانبيته في وجه الذئاب، ونجا الجميل بأعجوبة.',
  'الحارس وقف أمام باب الضحية يغني أغنية شعبية... الذئاب هربت من الصداع.',
  'حرس الحارس بيده اليسرى فقط، واليمنى كانت تمسك فنجان قهوة. عبقري.',
];
const funnyKill = [
  'وجد أهل القرية آثار أقدام حوله... يا ليل يا عين.',
  'اختفى بهدوء، وكأن أحداً لم يكن هنا. فقط رائحة غريبة في الهواء.',
  'الذئاب لم تترك سوى حذائه... وماشياً به في الصباح.',
];
const funnySeerResults: Record<string, string> = {
  wolf: 'العراف رأى أنيابه في الظلام... ذئب بلا شك.',
  alpha: 'رأى العراف ذئباً يرتدي تاجاً... إنه القائد.',
  witch: 'رأى العراف قارورة في جيبها... ساحرة خطيرة.',
  seer: 'رأى العراف نفسه في المرآة... هذا محرج.',
  guardian: 'رأى العراف درعاً صدئاً... إنه الحارس.',
  spirit: 'رأى العراف شبحاً يبتسم... روح القرية.',
  thief: 'رأى العراف يداً تسرق النجوم... سارق أدوار.',
  leader: 'رأى العراف رجلاً يحمل تاجاً... قائد القرية.',
  villager: 'رأى العراف رجلاً عادياً يأكل الفول... قروي بريء.',
};

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function App() {
  const [phase, setPhase] = useState<Phase>('home');
  const [prevPhase, setPrevPhase] = useState<Phase>('result');
  const [playersText, setPlayersText] = useState(defaultPlayers.join('، '));
  const [enabled, setEnabled] = useState<Record<RoleKey, boolean>>({ wolf: true, villager: true, seer: true, witch: true, guardian: true, spirit: false, alpha: false, thief: false, leader: false });
  const [wolfCount, setWolfCount] = useState(2);
  const [round, setRound] = useState(1);
  const [alivePlayers, setAlivePlayers] = useState<number[]>([]);
  const [roles, setRoles] = useState<RoleKey[]>([]);
  const [logs, setLogs] = useState<LogEntry[][]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const [musicTrack, setMusicTrack] = useState<MusicTrack>('dark');
  const [volume, setVolume] = useState(0.3);
  const [message, setMessage] = useState('');
  const [nightCount, setNightCount] = useState(0);
  const [witchPotionsLeft, setWitchPotionsLeft] = useState({ kill: true, protect: true });
  const [guardianLastTarget, setGuardianLastTarget] = useState<number | null>(null);
  const [showAllCards, setShowAllCards] = useState(false);

  const wolfHowlRef = useRef<HTMLAudioElement | null>(null);
  const witchLaughRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  const players = useMemo(() => playersText.split(/[،,\n]/).map((name) => name.trim()).filter(Boolean), [playersText]);

  useEffect(() => {
    wolfHowlRef.current = new Audio(wolfHowlAudio);
    wolfHowlRef.current.volume = 0.7;
    witchLaughRef.current = new Audio(witchLaughAudio);
    witchLaughRef.current.volume = 0.6;
  }, []);

  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = musicOn ? volume : 0;
      if (musicOn) {
        musicRef.current.play().catch(() => {});
      } else {
        musicRef.current.pause();
      }
    }
  }, [musicOn, volume]);

  function playSound(type: SoundType) {
    if (!soundOn) return;
    if (type === 'wolf' && wolfHowlRef.current) {
      wolfHowlRef.current.currentTime = 0;
      wolfHowlRef.current.volume = volume * 2;
      wolfHowlRef.current.play().catch(() => {});
    } else if (type === 'witch' && witchLaughRef.current) {
      witchLaughRef.current.currentTime = 0;
      witchLaughRef.current.volume = volume * 1.8;
      witchLaughRef.current.play().catch(() => {});
    }
  }

  function changeMusic(track: MusicTrack) {
    setMusicTrack(track);
    if (musicRef.current) {
      musicRef.current.src = musicTracks[track];
      musicRef.current.loop = true;
      musicRef.current.volume = musicOn ? volume : 0;
      if (musicOn) musicRef.current.play().catch(() => {});
    }
  }

  function goToLog() { setPrevPhase(phase); setPhase('log'); }
  function backFromLog() { setPhase(prevPhase); }

  const validation = useMemo(() => {
    const warnings: string[] = [];
    const optionalRoles = (Object.keys(enabled) as RoleKey[]).filter((r) => enabled[r] && r !== 'wolf' && r !== 'villager');
    const totalSpecial = wolfCount + optionalRoles.length;
    const villagerCount = Math.max(0, players.length - totalSpecial);
    if (players.length < 4) warnings.push('تحتاج 4 لاعبين على الأقل');
    if (villagerCount < 1) warnings.push('القرويون قليلون جداً — زد عدد اللاعبين أو قلل الأدوار');
    if (wolfCount < 1) warnings.push('لا يمكن لعب بدون ذئاب');
    if (wolfCount >= players.length / 2) warnings.push('الذئاب كثيرون جداً — يجب أن يكونوا أقل من النصف');
    return { warnings, villagerCount, totalSpecial };
  }, [enabled, players.length, wolfCount]);

  function beginGame() {
    if (players.length < 4) { setMessage('أضف أربعة لاعبين على الأقل لتبدأ الحكاية.'); return; }
    const roleList: RoleKey[] = [];
    for (let i = 0; i < wolfCount; i += 1) roleList.push('wolf');
    (Object.keys(enabled) as RoleKey[]).forEach((role) => {
      if (enabled[role] && role !== 'wolf' && role !== 'villager') roleList.push(role);
    });
    while (roleList.length < players.length) roleList.push('villager');
    const shuffled = shuffle(roleList).slice(0, players.length);
    setRoles(shuffled);
    setAlivePlayers(players.map((_, i) => i));
    setRound(1); setLogs([]); setNightCount(0); setMessage('');
    setWitchPotionsLeft({ kill: true, protect: true });
    setGuardianLastTarget(null);
    setPhase('reveal');
  }

  function startNight() { setNightCount((n) => n + 1); setPhase('night'); }

  function finishNight(nightResults: LogEntry[]) {
    setLogs((current) => [...current, nightResults]);
    setPhase('result');
  }

  function submitVote(targetIndex: number) {
    if (targetIndex >= 0) {
      const target = players[targetIndex];
      const isWolf = roles[targetIndex] === 'wolf' || roles[targetIndex] === 'alpha';
      setAlivePlayers((current) => current.filter((i) => i !== targetIndex));
      setLogs((current) => [...current, [{ title: 'نتيجة التصويت', text: `أجمع المجلس على ${target}. ${isWolf ? 'اتضح أنه ذئب، والقرية تصفق لنفسها.' : 'كان بريئاً... صفقوا لأنفسكم أقل من ذلك.'}`, tone: isWolf ? 'green' : 'red' }]]);
      const newAlive = alivePlayers.filter((i) => i !== targetIndex);
      const wolvesRemaining = newAlive.filter((i) => roles[i] === 'wolf' || roles[i] === 'alpha').length;
      const villagersRemaining = newAlive.filter((i) => roles[i] !== 'wolf' && roles[i] !== 'alpha').length;
      if (wolvesRemaining === 0 || wolvesRemaining >= villagersRemaining) { setPhase('gameover'); return; }
    }
    setPhase('result');
  }

  function eliminatePlayer(index: number) {
    setAlivePlayers((current) => current.filter((i) => i !== index));
    const newAlive = alivePlayers.filter((i) => i !== index);
    const wolvesRemaining = newAlive.filter((i) => roles[i] === 'wolf' || roles[i] === 'alpha').length;
    const villagersRemaining = newAlive.filter((i) => roles[i] !== 'wolf' && roles[i] !== 'alpha').length;
    if (wolvesRemaining === 0 || wolvesRemaining >= villagersRemaining) {
      setPhase('gameover');
      return true;
    }
    return false;
  }

  function newRound() { setRound((c) => c + 1); setPhase('reveal'); }

  function restartGame() {
    setPhase('setup'); setAlivePlayers([]); setRoles([]); setLogs([]);
    setRound(1); setNightCount(0);
    setWitchPotionsLeft({ kill: true, protect: true });
    setGuardianLastTarget(null);
  }

  if (phase === 'home') return <main className="app-shell"><div className="grain" /><section className="hero"><div className="brand-mark"><Moon size={19} /> ليلة الذئاب</div><div className="hero-copy"><div className="eyebrow">لعبة اجتماعية · 04 — 16 لاعباً</div><h1>لا تثق بأحد<br /><em>خصوصاً أقرب أصدقائك.</em></h1><p>مدينة صغيرة، ليلة طويلة، وذئاب تتظاهر بأنها ناس محترمة.</p><button className="primary-button large" onClick={() => setPhase('setup')}><Play size={18} /> بداية اللعبة <ChevronLeft size={18} /></button></div><div className="hero-art"><div className="moon-disc" /><div className="wolf-silhouette">♞</div><div className="forest">♠　♠　♠　♠　♠</div><span className="art-caption">في كل قرية<br />سرّ لا يُحكى</span></div></section><footer className="signature">صمّمها بعبقرية لا تُغتفر <strong>يونس الشكور</strong><span>© 2026</span></footer><audio ref={musicRef} loop src={musicTracks[musicTrack]} /></main>;

  return <main className="app-shell dashboard"><header className="topbar"><button className="brand-mark compact" onClick={() => setPhase('home')}><Moon size={18} /> ليلة الذئاب</button><div className="top-actions"><button className="icon-button" onClick={goToLog} title="السجل"><BookOpen size={18} /></button><button className={`sound-toggle ${soundOn ? 'active' : ''}`} onClick={() => setSoundOn((c) => !c)}>{soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />} {soundOn ? 'الأصوات' : 'كتم'}</button><button className={`sound-toggle ${musicOn ? 'active' : ''}`} onClick={() => setMusicOn((c) => !c)}><Music size={16} /> {musicOn ? 'موسيقى' : 'إيقاف'}</button><span className="round-pill">الجولة {round}</span></div></header>
    <div className="music-bar"><span>الموسيقى:</span><button className={musicTrack === 'dark' ? 'active' : ''} onClick={() => changeMusic('dark')}>مظلمة</button><button className={musicTrack === 'forest' ? 'active' : ''} onClick={() => changeMusic('forest')}>غابة</button><button className={musicTrack === 'tense' ? 'active' : ''} onClick={() => changeMusic('tense')}>توتر</button><button className={musicTrack === 'victory' ? 'active' : ''} onClick={() => changeMusic('victory')}>نصر</button><div className="volume-control"><Volume2 size={14} /><input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(Number(e.target.value))} /></div></div>
    <audio ref={musicRef} loop src={musicTracks[musicTrack]} />
    <div className="content">
    {phase === 'setup' && <Setup playersText={playersText} setPlayersText={setPlayersText} enabled={enabled} setEnabled={setEnabled} wolfCount={wolfCount} setWolfCount={setWolfCount} onStart={beginGame} message={message} validation={validation} />}
    {phase === 'reveal' && <Reveal players={players} roles={roles} onContinue={startNight} round={round} />}
    {phase === 'night' && <Night players={players} roles={roles} alivePlayers={alivePlayers} enabled={enabled} playSound={playSound} onFinish={finishNight} witchPotionsLeft={witchPotionsLeft} setWitchPotionsLeft={setWitchPotionsLeft} nightCount={nightCount} eliminatePlayer={eliminatePlayer} guardianLastTarget={guardianLastTarget} setGuardianLastTarget={setGuardianLastTarget} />}
    {phase === 'vote' && <Vote players={players} roles={roles} alivePlayers={alivePlayers} onSubmit={submitVote} />}
    {phase === 'result' && <Result logs={logs} roles={roles} alivePlayers={alivePlayers} onVote={() => setPhase('vote')} onNewRound={newRound} onLog={goToLog} />}
    {phase === 'log' && <LogView logs={logs} onBack={backFromLog} roles={roles} players={players} showAllCards={showAllCards} setShowAllCards={setShowAllCards} />}
    {phase === 'gameover' && <GameOver roles={roles} players={players} alivePlayers={alivePlayers} onRestart={restartGame} />}
  </div></main>;
}

function Setup({ playersText, setPlayersText, enabled, setEnabled, wolfCount, setWolfCount, onStart, message, validation }: { playersText: string; setPlayersText: (value: string) => void; enabled: Record<RoleKey, boolean>; setEnabled: (value: Record<RoleKey, boolean>) => void; wolfCount: number; setWolfCount: (value: number) => void; onStart: () => void; message: string; validation: { warnings: string[]; villagerCount: number; totalSpecial: number } }) {
  const toggleRole = (role: RoleKey) => {
    if (role === 'wolf' || role === 'villager') return;
    setEnabled({ ...enabled, [role]: !enabled[role] });
  };
  return <section className="setup-page"><div className="section-heading"><div><div className="eyebrow">إعداد الطاولة</div><h2>جهّز القرية للجنون</h2><p>اختر من يستيقظ في الليل، واترك الباقي للنميمة.</p></div><div className="setup-count"><Users size={16} /> 4 — 16 لاعباً</div></div>
    <div className="validation-bar">
      <div className="validation-stat"><span>اللاعبون</span><strong>{playersText.split(/[،,\n]/).filter((p) => p.trim()).length}</strong></div>
      <div className="validation-stat"><span>الذئاب</span><strong className="red">{wolfCount}</strong></div>
      <div className="validation-stat"><span>القرويون</span><strong className="blue">{validation.villagerCount}</strong></div>
      <div className="validation-stat"><span>أدوار خاصة</span><strong className="gold">{validation.totalSpecial - wolfCount}</strong></div>
    </div>
    {validation.warnings.length > 0 && <div className="validation-warnings">{validation.warnings.map((w, i) => <div key={i} className="warning-item"><AlertTriangle size={15} /> {w}</div>)}</div>}
    <div className="setup-grid"><div className="panel players-panel"><div className="panel-heading"><span><Users size={18} /> أسماء اللاعبين</span><small>افصل بينهم بفاصلة</small></div><textarea value={playersText} onChange={(e) => setPlayersText(e.target.value)} placeholder="يونس، سلمى، حمزة، ليان..." /><div className="player-preview">{playersText.split(/[،,\n]/).filter((p) => p.trim()).map((p, i) => <span key={`${p}-${i}`}>{i + 1} {p.trim()}</span>)}</div></div>
    <div className="panel roles-panel"><div className="panel-heading"><span><Sparkles size={18} /> الأدوار</span><small>الذئب والقروي إجباريان</small></div><div className="role-grid">{(Object.keys(roleInfo) as RoleKey[]).map((role) => <button key={role} className={`role-option ${enabled[role] ? 'selected' : ''} ${roleInfo[role].color} ${(role === 'wolf' || role === 'villager') ? 'mandatory' : ''}`} onClick={() => toggleRole(role)} disabled={role === 'wolf' || role === 'villager'}><span className="role-symbol">{roleInfo[role].icon}</span><span><b>{roleInfo[role].name}</b><small>{roleInfo[role].description}</small></span><span className="check">{enabled[role] ? <Check size={13} /> : null}</span>{(role === 'wolf' || role === 'villager') && <span className="mandatory-tag">إجباري</span>}</button>)}</div></div></div>
    <div className="bottom-controls"><div className="control-card"><span><Skull size={17} /> عدد الذئاب</span><div className="stepper"><button onClick={() => setWolfCount(Math.max(1, wolfCount - 1))}>−</button><strong>{wolfCount}</strong><button onClick={() => setWolfCount(Math.min(5, wolfCount + 1))}>+</button></div></div><button className="primary-button" onClick={onStart} disabled={validation.warnings.length > 0}>توزيع الأدوار <ChevronLeft size={17} /></button></div>
    {message && <div className="message error-message">{message}</div>}</section>;
}

type RevealStep = 'pass' | 'show' | 'hidden';

function Reveal({ players, roles, onContinue, round }: { players: string[]; roles: RoleKey[]; onContinue: () => void; round: number }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [step, setStep] = useState<RevealStep>('pass');
  const [allDone, setAllDone] = useState(false);

  if (round > 1) {
    return <section className="game-page"><div className="section-heading"><div><div className="eyebrow">الجولة {round}</div><h2>ليلة جديدة تطلّ</h2><p>القرية تستعد لجولة أخرى. اضغط لبدء الليل.</p></div></div><button className="primary-button centered" onClick={onContinue}><Moon size={17} /> تبدأ ليلة الجولة {round}</button></section>;
  }

  const currentPlayer = players[currentIdx];
  const currentRole = roles[currentIdx];
  const info = roleInfo[currentRole];
  const isLeader = currentRole === 'leader';

  function nextPlayer() {
    if (currentIdx + 1 >= players.length) { setAllDone(true); return; }
    setCurrentIdx(currentIdx + 1);
    setStep('pass');
  }

  if (allDone) return <section className="game-page"><div className="section-heading"><div><div className="eyebrow">اكتمل التوزيع</div><h2>الجميع رأى بطاقته</h2><p>مرّروا الهاتف للحكم. الليل يبدأ الآن.</p></div></div><button className="primary-button centered" onClick={onContinue}><Moon size={17} /> تبدأ ليلة الجولة الأولى</button></section>;

  return <section className="game-page reveal-pass-page">
    <div className="pass-progress">{Array.from({ length: players.length }).map((_, i) => <span key={i} className={`pass-dot ${i < currentIdx ? 'done' : ''} ${i === currentIdx ? 'current' : ''}`} />)}</div>
    {step === 'pass' && <div className="pass-screen"><div className="pass-icon"><EyeOff size={48} /></div><div className="eyebrow">مرّر الهاتف</div><h2>مرّر الهاتف إلى</h2><p className="pass-name">{currentPlayer}</p><p className="pass-instruction">إذا كنت {currentPlayer}، اضغط لفتح بطاقتك</p><button className="primary-button large" onClick={() => setStep('show')}><Eye size={18} /> أنا {currentPlayer} — افتح البطاقة</button></div>}
    {step === 'show' && <div className="pass-screen">{isLeader ? <div className={`role-card-full gold`}><div className="role-card-image"><img src={roleImages.leader} alt={roleInfo.leader.name} /><div className="role-card-image-overlay" /></div><div className="role-card-content"><span className="secret-badge">بطاقة سرية — لا تظهر للآخرين</span><div className="role-large-symbol">{roleInfo.leader.icon}</div><h3>{roleInfo.leader.name}</h3><p>{roleInfo.leader.description}</p><small className="secret-note">دورك سري! الحكم فقط من يعرفه. صوتك في التصويت = 2</small></div></div> : <div className={`role-card-full ${info.color}`}><div className="role-card-image"><img src={roleImages[currentRole]} alt={info.name} /><div className="role-card-image-overlay" /></div><div className="role-card-content"><span className="secret-badge">بطاقة سرية</span><div className="role-large-symbol">{info.icon}</div><h3>{info.name}</h3><p>{info.description}</p>{info.isSecret && <small className="secret-note">دور سري — يظهر في الكشف ويستيقظ في الليل</small>}</div></div>}<button className="primary-button" onClick={() => setStep('hidden')}><EyeOff size={18} /> أخفِ البطاقة</button></div>}
    {step === 'hidden' && <div className="pass-screen"><div className="pass-icon"><Check size={48} /></div><h2>تم إخفاء البطاقة</h2><p className="pass-instruction">{currentIdx + 1 < players.length ? `مرّر الهاتف إلى ${players[currentIdx + 1]}` : 'الجميع رأى بطاقته'}</p><button className="primary-button large" onClick={nextPlayer}><ChevronLeft size={18} /> {currentIdx + 1 < players.length ? `التالي: ${players[currentIdx + 1]}` : 'ابدأ الليل'}</button></div>}
  </section>;
}

function Night({ players, roles, alivePlayers, enabled, playSound, onFinish, witchPotionsLeft, setWitchPotionsLeft, nightCount, eliminatePlayer, guardianLastTarget, setGuardianLastTarget }: { players: string[]; roles: RoleKey[]; alivePlayers: number[]; enabled: Record<RoleKey, boolean>; playSound: (type: SoundType) => void; onFinish: (results: LogEntry[]) => void; witchPotionsLeft: { kill: boolean; protect: boolean }; setWitchPotionsLeft: (v: { kill: boolean; protect: boolean }) => void; nightCount: number; eliminatePlayer: (index: number) => boolean; guardianLastTarget: number | null; setGuardianLastTarget: (v: number | null) => void }) {
  const steps: { role: RoleKey; title: string; sound: SoundType }[] = [
    { role: 'wolf', title: 'الذئاب تستيقظ', sound: 'wolf' },
    ...(enabled.alpha ? [{ role: 'alpha' as RoleKey, title: 'قائد الذئاب يستيقظ', sound: 'wolf' as SoundType }] : []),
    ...(enabled.seer ? [{ role: 'seer' as RoleKey, title: 'العراف يستيقظ', sound: 'night' as SoundType }] : []),
    ...(enabled.witch ? [{ role: 'witch' as RoleKey, title: 'الساحرة تستيقظ', sound: 'witch' as SoundType }] : []),
    ...(enabled.guardian ? [{ role: 'guardian' as RoleKey, title: 'الحارس يستيقظ', sound: 'success' as SoundType }] : []),
    ...(enabled.thief ? [{ role: 'thief' as RoleKey, title: 'السارق يستيقظ', sound: 'night' as SoundType }] : []),
  ];
  const [step, setStep] = useState(0);
  const [wolfTarget, setWolfTarget] = useState<number | null>(null);
  const [seerTarget, setSeerTarget] = useState<number | null>(null);
  const [seerResult, setSeerResult] = useState<{ name: string; role: RoleKey } | null>(null);
  const [witchKillTarget, setWitchKillTarget] = useState<number | null>(null);
  const [witchProtectTarget, setWitchProtectTarget] = useState<number | null>(null);
  const [guardianTarget, setGuardianTarget] = useState<number | null>(null);
  const [guardianResult, setGuardianResult] = useState<{ name: string; success: boolean } | null>(null);
  const [alphaReviveChoice, setAlphaReviveChoice] = useState<number | null>(null);
  const [thiefTarget, setThiefTarget] = useState<number | null>(null);

  const eliminatedWolves = players.map((_, i) => i).filter((i) => !alivePlayers.includes(i) && (roles[i] === 'wolf' || roles[i] === 'alpha'));
  const current = steps[step] ?? steps[0];
  const isLast = step + 1 >= steps.length;

  useEffect(() => { playSound(current.sound); }, [step]);

  function pickWolf(globalIndex: number) {
    const role = roles[globalIndex];
    if (role === 'wolf' || role === 'alpha') return;
    setWolfTarget(globalIndex);
  }
  function pickSeer(globalIndex: number) {
    if (seerResult) return;
    setSeerTarget(globalIndex);
    setSeerResult({ name: players[globalIndex], role: roles[globalIndex] });
  }
  function pickWitchKill(globalIndex: number) { if (witchPotionsLeft.kill) setWitchKillTarget(globalIndex); }
  function pickWitchProtect(globalIndex: number) { if (witchPotionsLeft.protect) setWitchProtectTarget(globalIndex); }
  function pickGuardian(globalIndex: number) {
    if (globalIndex === guardianLastTarget) return;
    setGuardianTarget(globalIndex);
  }
  function confirmGuardian() {
    if (guardianTarget === null) return;
    const success = Math.random() > 0.3;
    setGuardianResult({ name: players[guardianTarget], success });
    setGuardianLastTarget(guardianTarget);
  }
  function pickAlphaRevive(globalIndex: number) { setAlphaReviveChoice(globalIndex); }

  function next() {
    if (isLast) {
      const results: LogEntry[] = [];
      let killedThisNight: number[] = [];

      if (wolfTarget !== null) {
        const wolfName = players[wolfTarget];
        const protectedByWitch = witchProtectTarget === wolfTarget;
        const protectedByGuardian = guardianTarget === wolfTarget && guardianResult?.success;
        if (protectedByWitch || protectedByGuardian) {
          results.push({ title: 'حماية ناجحة', text: `${wolfName} كان محاطاً بطوق من النور. ${protectedByGuardian ? funnyProtection[Math.floor(Math.random() * funnyProtection.length)] : 'الساحرة سكبت جرعة الحماية بصمت، وأنقذت يوماً كاملاً.'}`, tone: 'green' });
        } else {
          results.push({ title: 'الذئاب اختارت', text: `${wolfName} كان هدف الذئاب. ${funnyKill[Math.floor(Math.random() * funnyKill.length)]}`, tone: 'red' });
          killedThisNight.push(wolfTarget);
        }
      }
      if (seerResult) results.push({ title: 'رؤية العراف', text: `${seerResult.name}: ${funnySeerResults[seerResult.role]}`, tone: 'gold' });
      if (witchPotionsLeft.kill && witchKillTarget !== null) {
        results.push({ title: 'جرعة القتل', text: `الساحرة سكبت جرعة الموت على ${players[witchKillTarget]}. ضحكة خافتة في الظلام ثم صمت.`, tone: 'red' });
        killedThisNight.push(witchKillTarget);
        setWitchPotionsLeft({ ...witchPotionsLeft, kill: false });
      }
      if (witchPotionsLeft.protect && witchProtectTarget !== null) {
        if (wolfTarget !== witchProtectTarget) {
          results.push({ title: 'جرعة الحماية', text: `الساحرة حمت ${players[witchProtectTarget]}، لكن لم يكن مهدداً الليلة. هدرت جرعة لطيف.`, tone: 'gold' });
        }
        setWitchPotionsLeft({ ...witchPotionsLeft, protect: false });
      }
      if (guardianResult) results.push({ title: guardianResult.success ? 'الحارس نجح' : 'الحارس أخفق', text: guardianResult.success ? `الحارس حمى ${guardianResult.name}. ${funnyProtection[Math.floor(Math.random() * funnyProtection.length)]}` : `الحارس اختار كرسياً فارغاً بدلاً من ${guardianResult.name}. يا لها من حراسة عظيمة.`, tone: guardianResult.success ? 'green' : 'red' });
      if (alphaReviveChoice !== null && eliminatedWolves.length > 0) {
        results.push({ title: 'قائد الذئاب يعيد', text: `قائد الذئاب أعاد ${players[alphaReviveChoice]} إلى صفوف الذئاب! عاد من الموت بأنياب أطول.`, tone: 'dark' });
      }

      const uniqueKilled = [...new Set(killedThisNight)];
      for (const killed of uniqueKilled) {
        const gameOver = eliminatePlayer(killed);
        if (gameOver) { onFinish(results); return; }
      }

      if (results.length === 0) results.push({ title: 'ليلة هادئة', text: 'لا أحد استيقظ، لا أحد مات. القرية تنام بعمق...', tone: 'dark' });
      const hasDeath = results.some((r) => r.tone === 'red' && r.title !== 'الحارس أخفق');
      results.push({ title: 'رسالة الصباح', text: hasDeath ? 'استيقظت القرية على خبر مأساوي... من سيثار ومن سيبكي؟' : 'الصباح جاء بسلام... هذه المرة. لكن الذئاب لا تنام للأبد.', tone: hasDeath ? 'red' : 'gold' });
      onFinish(results);
    } else {
      setStep(step + 1);
    }
  }

  const wolfPlayerIndices = alivePlayers.filter((i) => roles[i] !== 'wolf' && roles[i] !== 'alpha');

  return <section className="game-page night-page"><div className="night-sky"><div className="stars">✦　·　✧　　·　✦</div><Moon size={72} strokeWidth={1} /><div className="eyebrow">الليلة {nightCount} · خطوة {step + 1} من {steps.length}</div><h2>{current.title}</h2></div>
    {current.role === 'wolf' && <div className="night-action"><p className="night-instruction">الذئاب تختار ضحيتها. لا يمكنكم اختيار ذئب آخر.</p><div className="night-players">{wolfPlayerIndices.map((gi) => <button key={gi} className={`night-player ${wolfTarget === gi ? 'selected red' : ''}`} onClick={() => pickWolf(gi)}><span>{gi + 1}</span>{players[gi]}{wolfTarget === gi && <Skull size={15} />}</button>)}</div></div>}
    {current.role === 'alpha' && <div className="night-action"><p className="night-instruction">قائد الذئاب يمكنه إرجاع ذئب مقصي. اختر من القائمة:</p>{eliminatedWolves.length > 0 ? <div className="night-players">{eliminatedWolves.map((gi) => <button key={gi} className={`night-player ${alphaReviveChoice === gi ? 'selected' : ''}`} onClick={() => pickAlphaRevive(gi)}><span>{gi + 1}</span>{players[gi]}{alphaReviveChoice === gi && <Crown size={15} />}</button>)}</div> : <div className="night-empty"><p>لا يوجد ذئاب مقصيون بعد.</p></div>}</div>}
    {current.role === 'seer' && <div className="night-action"><p className="night-instruction">العراف يختار شخصاً لكشف حقيقته.</p><div className="night-players">{alivePlayers.filter((i) => roles[i] !== 'seer').map((gi) => <button key={gi} className={`night-player ${seerTarget === gi ? 'selected' : ''} ${seerResult && seerTarget !== gi ? 'dimmed' : ''}`} onClick={() => pickSeer(gi)} disabled={seerResult !== null && seerTarget !== gi}><span>{gi + 1}</span>{players[gi]}{seerTarget === gi && <Eye size={15} />}</button>)}</div>{seerResult && <div className="night-result gold"><Eye size={20} /><div><b>النتيجة: {seerResult.name}</b><p>{funnySeerResults[seerResult.role]}</p></div></div>}</div>}
    {current.role === 'witch' && <div className="night-action"><p className="night-instruction">الساحرة أمامها جرعتان: القتل والحماية. كل واحدة تستخدم مرة في اللعبة كلها.</p><div className="potion-section"><div className="potion-group"><div className="potion-header"><Droplet size={18} /> جرعة القتل {!witchPotionsLeft.kill && <span className="used-tag">استُخدمت</span>}</div><div className="night-players small">{alivePlayers.map((gi) => <button key={gi} className={`night-player ${witchKillTarget === gi ? 'selected red' : ''} ${!witchPotionsLeft.kill ? 'disabled' : ''}`} onClick={() => pickWitchKill(gi)} disabled={!witchPotionsLeft.kill}><span>{gi + 1}</span>{players[gi]}{witchKillTarget === gi && <Skull size={15} />}</button>)}</div></div><div className="potion-group"><div className="potion-header"><Heart size={18} /> جرعة الحماية {!witchPotionsLeft.protect && <span className="used-tag">استُخدمت</span>}</div><div className="night-players small">{alivePlayers.map((gi) => <button key={gi} className={`night-player ${witchProtectTarget === gi ? 'selected green' : ''} ${!witchPotionsLeft.protect ? 'disabled' : ''}`} onClick={() => pickWitchProtect(gi)} disabled={!witchPotionsLeft.protect}><span>{gi + 1}</span>{players[gi]}{witchProtectTarget === gi && <Shield size={15} />}</button>)}</div></div></div></div>}
    {current.role === 'guardian' && <div className="night-action"><p className="night-instruction">الحارس يختار من سيحميه. يمكنه حماية نفسه، لكن لا يحمي نفس الشخص مرتين متتاليتين.</p>{guardianLastTarget !== null && <p className="night-sub-note">آخر شخص حماه: {players[guardianLastTarget]} — لا يمكن اختياره مجدداً</p>}<div className="night-players">{alivePlayers.map((gi) => <button key={gi} className={`night-player ${guardianTarget === gi ? 'selected green' : ''} ${gi === guardianLastTarget ? 'disabled' : ''}`} onClick={() => pickGuardian(gi)} disabled={guardianResult !== null || gi === guardianLastTarget}><span>{gi + 1}</span>{players[gi]}{guardianTarget === gi && <Shield size={15} />}{gi === guardianLastTarget && <span className="blocked-tag">محمي سابقاً</span>}</button>)}</div>{guardianResult && <div className={`night-result ${guardianResult.success ? 'green' : 'red'}`}><Shield size={20} /><div><b>{guardianResult.success ? 'نجحت الحماية!' : 'أخفق الحارس!'}</b><p>الحارس حمى {guardianResult.name}. {guardianResult.success ? funnyProtection[Math.floor(Math.random() * funnyProtection.length)] : 'لكن الحظ لم يكن بجانبه.'}</p></div></div>}{guardianTarget !== null && !guardianResult && <button className="potion-confirm green" onClick={confirmGuardian}>تأكيد الحماية</button>}</div>}
    {current.role === 'thief' && <div className="night-action"><p className="night-instruction">السارق يستهدف لاعباً لسرقة دوره في الجولة القادمة.</p><div className="night-players">{alivePlayers.filter((i) => roles[i] !== 'thief').map((gi) => <button key={gi} className={`night-player ${thiefTarget === gi ? 'selected' : ''}`} onClick={() => setThiefTarget(gi)}><span>{gi + 1}</span>{players[gi]}{thiefTarget === gi && <Check size={15} />}</button>)}</div></div>}
    <div className="night-footer"><span>{current.role === 'wolf' && wolfTarget === null ? 'اختر ضحية' : current.role === 'guardian' && guardianResult === null ? 'اختر وأكّد الحماية' : 'جاهز للمتابعة'}</span><button className="primary-button" onClick={next} disabled={(current.role === 'wolf' && wolfTarget === null)}>{isLast ? <>شروق الشمس <ChevronLeft size={17} /></> : <>إيقاظ الدور التالي <ChevronLeft size={17} /></>}</button></div></section>;
}

function Vote({ players, roles, alivePlayers, onSubmit }: { players: string[]; roles: RoleKey[]; alivePlayers: number[]; onSubmit: (index: number) => void }) {
  const [voterIdx, setVoterIdx] = useState(0);
  const [currentChoice, setCurrentChoice] = useState<number | null>(null);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [leaderRevealed, setLeaderRevealed] = useState(false);

  const spiritIndices = players.map((_, i) => i).filter((i) => roles[i] === 'spirit' && !alivePlayers.includes(i));
  const aliveVoters = [...alivePlayers, ...spiritIndices];
  const currentVoterGlobal = aliveVoters[voterIdx];
  const isCurrentVoterSpirit = currentVoterGlobal !== undefined && !alivePlayers.includes(currentVoterGlobal);
  const isCurrentVoterLeader = currentVoterGlobal !== undefined && roles[currentVoterGlobal] === 'leader';
  const isCurrentVoterLeaderRevealed = isCurrentVoterLeader && leaderRevealed;

  function confirmVote() {
    if (currentChoice === null || currentVoterGlobal === undefined) return;
    const weight = isCurrentVoterLeader ? 2 : 1;
    setVotes((v) => ({ ...v, [currentChoice]: (v[currentChoice] ?? 0) + weight }));
    if (voterIdx + 1 >= aliveVoters.length) {
      setShowResult(true);
    } else {
      setVoterIdx(voterIdx + 1);
      setCurrentChoice(null);
    }
  }

  if (showResult) {
    const maxVotes = Math.max(...Object.values(votes), 0);
    const eliminated = Object.entries(votes).find(([, v]) => v === maxVotes)?.[0];
    const eliminatedIndex = eliminated !== undefined ? Number(eliminated) : null;
    return <section className="game-page"><div className="section-heading"><div><div className="eyebrow">نتيجة التصويت</div><h2>انتهى التصويت</h2></div></div><div className="vote-results">{alivePlayers.map((gi) => <div key={gi} className={`vote-result-row ${eliminatedIndex === gi ? 'eliminated' : ''}`}><span className="vote-avatar">{players[gi].slice(0, 1)}</span><b>{players[gi]}</b><span className="vote-count">{votes[gi] ?? 0} صوت</span>{eliminatedIndex === gi && <Skull size={18} />}</div>)}</div>{eliminatedIndex !== null && eliminatedIndex >= 0 ? <button className="primary-button centered" onClick={() => onSubmit(eliminatedIndex)}><Swords size={17} /> إقصاء {players[eliminatedIndex]}</button> : <button className="primary-button centered" onClick={() => onSubmit(-1)}>لا أحد يُقصى</button>}</section>;
  }

  if (currentVoterGlobal === undefined) return null;

  return <section className="game-page"><div className="section-heading"><div><div className="eyebrow">المرحلة 03 · مجلس القرية</div><h2>{players[currentVoterGlobal]}، اختر من تشك فيه</h2><p>ينتقل الدور إلى اللاعب التالي بعد تثبيت الاختيار.</p></div><div className="progress-label">صوت {voterIdx + 1} / {aliveVoters.length}</div></div>
    {isCurrentVoterLeader && !leaderRevealed && <div className="leader-reveal-banner"><Crown size={20} /><div><b>أنت قائد القرية!</b><p>دورك سري — الحكم فقط يعرفه. صوتك يعتبر 2 بدلاً من 1. اضغط للتأكيد.</p><button className="secondary-button" onClick={() => setLeaderRevealed(true)}>فهمت، اكشف دوري</button></div></div>}
    {isCurrentVoterLeaderRevealed && <div className="leader-active-banner"><Crown size={18} /> <b>صوتك = 2</b></div>}
    {isCurrentVoterSpirit && <div className="spirit-banner"><Ghost size={18} /> <b>روح القرية: تصوت من قبرك</b></div>}
    <div className="vote-board">{alivePlayers.map((gi) => <button key={gi} className={`vote-option ${currentChoice === gi ? 'selected' : ''} ${gi === currentVoterGlobal ? 'self' : ''}`} onClick={() => gi !== currentVoterGlobal && setCurrentChoice(gi)} disabled={gi === currentVoterGlobal || (isCurrentVoterLeader && !leaderRevealed)}><span className="vote-avatar">{players[gi].slice(0, 1)}</span><b>{players[gi]}</b><small>{gi === currentVoterGlobal ? 'لا تصوت لنفسك' : 'اضغط للاختيار'}</small>{currentChoice === gi && <Check size={17} />}</button>)}</div>
    <div className="vote-actions"><button className="secondary-button" onClick={confirmVote} disabled={currentChoice === null || (isCurrentVoterLeader && !leaderRevealed)}><Check size={16} /> تثبيت الصوت</button><button className="secondary-button" onClick={() => { if (voterIdx + 1 < aliveVoters.length) { setVoterIdx(voterIdx + 1); setCurrentChoice(null); } }}>تخطي <ChevronRight size={16} /></button></div></section>;
}

function Result({ logs, roles, alivePlayers, onVote, onNewRound, onLog }: { logs: LogEntry[][]; roles: RoleKey[]; alivePlayers: number[]; onVote: () => void; onNewRound: () => void; onLog: () => void }) {
  const latest = logs[logs.length - 1] ?? [];
  const wolvesAlive = alivePlayers.some((i) => roles[i] === 'wolf' || roles[i] === 'alpha');
  const memeImg = wolvesAlive ? memeImages.wolvesWin : memeImages.villageWin;
  const memeCaption = wolvesAlive ? 'الذئاب لا تزال بينكم...' : 'القرية تصمد... حتى الآن.';
  return <section className="game-page result-page"><div className="result-meme"><img src={memeImg} alt={memeCaption} loading="lazy" /><div className="result-meme-overlay" /><span className="result-meme-caption">{memeCaption}</span></div><div className="result-icon"><Flame size={30} /></div><div className="eyebrow">انتهت المرحلة</div><h2>الصباح يحمل خبراً جديداً</h2><p className="result-lead">{latest[latest.length - 1]?.text ?? 'القرية تستيقظ ببطء.'}</p><div className="story-stack">{latest.map((item, i) => <div className={`story-item ${item.tone}`} key={i}><span>{item.tone === 'green' ? <Shield size={17} /> : item.tone === 'red' ? <Skull size={17} /> : item.tone === 'gold' ? <Sparkles size={17} /> : <Moon size={17} />}</span><div><b>{item.title}</b><p>{item.text}</p></div></div>)}</div><div className="result-actions"><button className="secondary-button" onClick={onLog}><BookOpen size={16} /> اذهب للسجل يا حكم</button><button className="secondary-button" onClick={onVote}>ابدأ التصويت</button><button className="primary-button" onClick={onNewRound}><RotateCcw size={16} /> الجولة الجديدة</button></div></section>;
}

function LogView({ logs, onBack, roles, players, showAllCards, setShowAllCards }: { logs: LogEntry[][]; onBack: () => void; roles: RoleKey[]; players: string[]; showAllCards: boolean; setShowAllCards: (v: boolean) => void }) {
  return <section className="game-page log-page"><div className="section-heading"><div><div className="eyebrow">أرشيف الحكم</div><h2>سجل الحكاية</h2><p>كل ليلة في خانة منفصلة. يمكنك كشف كل البطاقات هنا.</p></div><div className="log-top-actions"><button className="secondary-button" onClick={() => setShowAllCards(!showAllCards)}><EyeIcon size={16} /> {showAllCards ? 'إخفاء البطاقات' : 'كشف كل البطاقات'}</button><button className="secondary-button" onClick={onBack}><ChevronRight size={16} /> العودة للعبة</button></div></div>
    {showAllCards && <div className="all-cards-grid">{players.map((p, i) => <div key={i} className={`mini-card ${roleInfo[roles[i]].color}`}><div className="mini-card-img"><img src={roleImages[roles[i]]} alt={roleInfo[roles[i]].name} /></div><div className="mini-card-info"><span className="role-symbol-small">{roleInfo[roles[i]].icon}</span><b>{p}</b><small>{roleInfo[roles[i]].name}</small></div></div>)}</div>}
    {logs.length === 0 ? <div className="empty-log"><BookOpen size={32} /><h3>السجل نظيف... مؤقتاً</h3><p>ابدأ الجولة ليبدأ التاريخ.</p></div> : <div className="log-list">{logs.map((night, i) => <div className="log-group" key={`log-${i}`}><div className="log-title"><span>الليلة {i + 1}</span></div>{night.map((item, j) => <div className={`log-row ${item.tone}`} key={`${i}-${j}`}><span>{item.title}</span><p>{item.text}</p></div>)}</div>)}</div>}</section>;
}

function GameOver({ roles, players, alivePlayers, onRestart }: { roles: RoleKey[]; players: string[]; alivePlayers: number[]; onRestart: () => void }) {
  const wolvesAlive = alivePlayers.some((i) => roles[i] === 'wolf' || roles[i] === 'alpha');
  const villagersAlive = alivePlayers.some((i) => roles[i] !== 'wolf' && roles[i] !== 'alpha');
  const wolvesWin = (wolvesAlive && !villagersAlive) || (wolvesAlive && wolvesAlive >= villagersAlive);
  const memeImg = wolvesWin ? memeImages.wolvesWin : memeImages.villageWin;
  return <section className="game-page result-page game-over-page"><div className="result-meme"><img src={memeImg} alt="نهاية اللعبة" /><div className="result-meme-overlay" /><span className="result-meme-caption">{wolvesWin ? 'فازت الذئاب! القرية نامت للأبد.' : 'فازت القرية! الذئاب هُزمت.'}</span></div><div className={`result-icon ${wolvesWin ? 'red' : 'green'}`}>{wolvesWin ? <Skull size={30} /> : <Shield size={30} />}</div><h2>{wolvesWin ? 'نهاية القرية' : 'نصر القرية'}</h2><p className="result-lead">{wolvesWin ? 'الذئاب التهمت الجميع. لم يبقَ أحد يروي القصة.' : 'القرية كشفت الذئاب وأقصتهم. السلام عاد... مؤقتاً.'}</p><div className="final-roster">{players.map((p, i) => <div key={i} className={`roster-row ${alivePlayers.includes(i) ? 'alive' : 'dead'} ${roleInfo[roles[i]].color}`}><span className="role-symbol-small">{roleInfo[roles[i]].icon}</span><b>{p}</b><small>{roleInfo[roles[i]].name}</small>{alivePlayers.includes(i) ? <Check size={15} /> : <Skull size={15} />}</div>)}</div><button className="primary-button centered" onClick={onRestart}><RotateCcw size={17} /> لعبة جديدة</button></section>;
}

export default App;
