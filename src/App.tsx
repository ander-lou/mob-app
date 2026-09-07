import { useEffect, useMemo, useRef, useState } from 'react'
import { appearanceLabel, interpretObservation, sensationLabel } from './domain/engine'
import { observations as seededObservations, revisions as seededRevisions } from './domain/mockData'
import type { Appearance, Bleeding, Goal, MobDecision, Observation, Sensation } from './domain/types'

type Tab = 'today' | 'calendar' | 'learn' | 'privacy'
type IconName = 'today' | 'calendar' | 'learn' | 'lock' | 'plus' | 'eye' | 'eyeOff' | 'arrow' | 'info' | 'check' | 'download' | 'edit' | 'spark'

const todayIso = '2026-09-07'
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    today: <><path d="M4 11.5a8 8 0 1 1 16 0V20H4v-8.5Z"/><path d="M8 20v-4h8v4M9 3V1m6 2V1"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></>,
    learn: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5ZM20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></>,
    eyeOff: <><path d="m3 3 18 18M10.6 6.2A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.1 2.8M6.2 6.2C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6a9.7 9.7 0 0 0 3-.5M9.8 9.8A3 3 0 0 0 14.2 14.2"/></>,
    arrow: <path d="m9 18 6-6-6-6"/>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    download: <><path d="M12 3v12m-4-4 4 4 4-4M5 20h14"/></>,
    edit: <><path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></>,
    spark: <><path d="M12 2c.6 4.7 2.3 7.1 7 8-4.7.9-6.4 3.3-7 8-.6-4.7-2.3-7.1-7-8 4.7-.9 6.4-3.3 7-8Z"/><path d="M19 17c.2 1.6.9 2.3 2.5 2.5-1.6.2-2.3.9-2.5 2.5-.2-1.6-.9-2.3-2.5-2.5 1.6-.2 2.3-.9 2.5-2.5Z"/></>,
  }
  return <svg aria-hidden="true" className="icon" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function Brand() {
  return <div className="brand" aria-label="MOB KL"><span className="wordmark" aria-hidden="true"><span className="wordmark-mob">M<span>O</span>B</span><span className="wordmark-kl">KL</span></span></div>
}

const navItems: Array<{ id: Tab; label: string; icon: IconName }> = [
  { id: 'today', label: 'Hoje', icon: 'today' },
  { id: 'calendar', label: 'Calendário', icon: 'calendar' },
  { id: 'learn', label: 'Aprender', icon: 'learn' },
  { id: 'privacy', label: 'Privacidade', icon: 'lock' },
]

function DemoNotice() {
  return <div className="demo-notice" role="note"><Icon name="spark" size={16}/><span><strong>Experiência demonstrativa.</strong><span className="demo-detail"> Dados fictícios e interpretação provisória.</span></span></div>
}

function GoalSwitch({ goal, onChange, compact = false }: { goal: Goal; onChange: (goal: Goal) => void; compact?: boolean }) {
  return <div className={`goal-switch ${compact ? 'compact' : ''}`} role="group" aria-label="Objetivo atual">
    <button type="button" className={goal === 'avoid' ? 'active' : ''} aria-pressed={goal === 'avoid'} onClick={() => onChange('avoid')}>Espaçar gravidez</button>
    <button type="button" className={goal === 'achieve' ? 'active' : ''} aria-pressed={goal === 'achieve'} onClick={() => onChange('achieve')}>Buscar gravidez</button>
  </div>
}

function Shell({ active, onNavigate, privateMode, onTogglePrivacy, children }: { active: Tab; onNavigate: (tab: Tab) => void; privateMode: boolean; onTogglePrivacy: () => void; children: React.ReactNode }) {
  return <div className="app-shell">
    <aside className="sidebar">
      <Brand />
      <nav aria-label="Navegação principal">
        {navItems.map(item => <button key={item.id} className={active === item.id ? 'active' : ''} aria-current={active === item.id ? 'page' : undefined} onClick={() => onNavigate(item.id)}><Icon name={item.icon}/><span>{item.label}</span></button>)}
      </nav>
      <div className="sidebar-foot">
        <button className="privacy-quick" onClick={onTogglePrivacy}><Icon name={privateMode ? 'eye' : 'eyeOff'}/><span>{privateMode ? 'Mostrar dados' : 'Modo discreto'}</span></button>
        <p>Protocolo demo v0.1</p>
      </div>
    </aside>
    <div className="mobile-head"><Brand/><button className="icon-button" onClick={onTogglePrivacy} aria-label={privateMode ? 'Mostrar dados sensíveis' : 'Ativar modo discreto'}><Icon name={privateMode ? 'eye' : 'eyeOff'}/></button></div>
    <main id="main-content">{children}</main>
    <nav className="bottom-nav" aria-label="Navegação principal">
      {navItems.map(item => <button key={item.id} className={active === item.id ? 'active' : ''} aria-current={active === item.id ? 'page' : undefined} onClick={() => onNavigate(item.id)}><Icon name={item.icon}/><span>{item.label}</span></button>)}
    </nav>
  </div>
}

function StateGlyph({ observation, future = false, size = 'md' }: { observation?: Observation; future?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  let kind = 'missing'
  let label = 'Sem registro'
  if (future) { kind = 'future'; label = 'Dia futuro, aguardando observação' }
  else if (observation?.bleeding === 'heavy' || observation?.bleeding === 'moderate' || observation?.bleeding === 'light') { kind = 'bleeding'; label = 'Sangramento' }
  else if (observation?.bleeding === 'spotting') { kind = 'spotting'; label = 'Mancha de sangue' }
  else if (observation?.sensation === 'dry' && observation?.appearance === 'nothing') { kind = 'dry'; label = 'Seca, sem muco observado' }
  else if (observation) { kind = 'change'; label = 'Mudança observada, possível fertilidade' }
  return <span className={`state-glyph ${kind} ${size}`} role="img" aria-label={label}><i/><i/><i/><i/><i/><i/></span>
}

function StatusCard({ decision, goal, recordStatus, privateMode, onExplain }: { decision: MobDecision; goal: Goal; recordStatus: Observation['recordStatus']; privateMode: boolean; onExplain: () => void }) {
  const stateLabel = decision.fertilityState === 'potentially_fertile' ? 'Fertilidade potencial observada' : decision.fertilityState === 'recognized_infertility' ? 'Infertilidade reconhecida pelo padrão' : 'Ainda não é possível determinar'
  const certainty = decision.certainty === 'confirmed' ? 'Confirmado' : decision.certainty === 'provisional' ? 'Provisório' : 'Precisa de revisão'
  const awaitingRecord = recordStatus === 'draft'
  const guidance = decision.guidance[goal]
  const relationshipTitle = awaitingRecord
    ? 'Aguardando o registro de hoje'
    : goal === 'avoid' && guidance.value === 'available'
      ? 'Relação disponível esta noite'
      : goal === 'avoid' && guidance.value === 'wait'
        ? 'Aguardar relação vaginal hoje'
        : guidance.label
  const relationshipDetail = awaitingRecord
    ? 'Conclua a observação no fim do dia antes de tomar uma decisão.'
    : guidance.detail
  return <section className={`status-card ${privateMode ? 'masked' : ''}`} aria-labelledby="today-status">
    <img className="status-illustration" src={`${import.meta.env.BASE_URL}mob-kl-daily-orbit.png`} alt="" aria-hidden="true"/>
    <div className="status-orbit" aria-hidden="true"><i/><i/><i/><span><small>dia</small>11</span></div>
    <div className="status-meta"><span className="status-kicker">Estado observado hoje</span><span className={`certainty ${decision.certainty}`}><i/>{certainty}</span></div>
    <div className="status-copy"><h1 id="today-status">{privateMode ? 'Dados ocultos' : stateLabel}</h1>
    <div className={`relationship-guidance ${awaitingRecord ? 'pending' : guidance.value}`} role="status"><span>{privateMode ? 'Orientação protegida' : goal === 'avoid' ? 'Para espaçar gravidez' : 'Para buscar gravidez'}</span><strong>{privateMode ? 'Toque no olho para visualizar' : relationshipTitle}</strong>{!privateMode && <small>{relationshipDetail}</small>}</div></div>
    <div className="rule-row"><span>{privateMode ? 'Interpretação protegida' : decision.ruleLabel}</span><button onClick={onExplain}>Entenda a regra <Icon name="arrow" size={16}/></button></div>
  </section>
}

function DailySnapshot({ observation, privateMode }: { observation: Observation; privateMode: boolean }) {
  const items = [
    { label: 'Sensação', value: sensationLabel(observation.sensation), className: 'sage' },
    { label: 'Aparência', value: appearanceLabel(observation.appearance), className: 'plum' },
    { label: 'Fechamento', value: observation.recordStatus === 'day_closed' ? 'Concluído' : 'Confirmar à noite', className: 'gold' },
  ]
  return <section className={`daily-snapshot ${privateMode ? 'is-private' : ''}`} aria-label="Resumo da observação de hoje">
    <div className="snapshot-intro"><span className="eyebrow">Leitura do dia</span><strong>Três pontos essenciais</strong></div>
    {items.map(item => <div className="snapshot-item" key={item.label}><i className={item.className}/><span>{item.label}</span><strong>{privateMode ? 'Oculto' : item.value}</strong></div>)}
  </section>
}

function WeekStrip({ data, onSelect }: { data: Observation[]; onSelect: (observation: Observation) => void }) {
  const days = [
    ['Ter', '1'], ['Qua', '2'], ['Qui', '3'], ['Sex', '4'], ['Sáb', '5'], ['Dom', '6'], ['Hoje', '7'],
  ]
  return <section className="week-card" aria-labelledby="week-title">
    <div className="section-heading"><div><span className="eyebrow">Esta semana</span><h2 id="week-title">Seu padrão, dia a dia</h2></div><span className="cycle-label">Ciclo atual · dia 11</span></div>
    <div className="week-strip">
      {days.map(([weekday, day]) => {
        const iso = `2026-09-${day.padStart(2, '0')}`
        const observation = data.find(item => item.localDate === iso)
        return <button key={iso} onClick={() => observation && onSelect(observation)} className={day === '7' ? 'today' : ''} aria-label={`${weekday}, ${day} de setembro. ${observation ? sensationLabel(observation.sensation) : 'Sem registro'}`}>
          <span>{weekday}</span><strong>{day}</strong><StateGlyph observation={observation} size="sm"/>
        </button>
      })}
    </div>
  </section>
}

function EvidenceCard({ decision, observation }: { decision: MobDecision; observation: Observation }) {
  return <section className="evidence-card" aria-labelledby="evidence-title">
    <div className="section-heading"><div><span className="eyebrow">Transparência</span><h2 id="evidence-title">Por que estou vendo isso?</h2></div><span className="version">v0.1 demo</span></div>
    <ol className="evidence-list">
      {decision.evidence.map((item, index) => <li key={item}><span>{index + 1}</span><p>{item}</p></li>)}
      {decision.evidence.length === 0 && <li><span>!</span><p>O registro ainda não tem dados suficientes para uma interpretação.</p></li>}
    </ol>
    <div className="observation-summary"><span>Observação de hoje</span><strong>{sensationLabel(observation.sensation)} · {appearanceLabel(observation.appearance)}</strong></div>
    <p className="clinical-note"><Icon name="info" size={18}/> Esta interpretação é demonstrativa. O MOB deve ser aprendido e revisado com instrutora credenciada.</p>
  </section>
}

function TodayPage({ data, goal, privateMode, onGoalChange, onOpenRecord, onCalendar, onExplain, onSelectDay }: { data: Observation[]; goal: Goal; privateMode: boolean; onGoalChange: (goal: Goal) => void; onOpenRecord: () => void; onCalendar: () => void; onExplain: () => void; onSelectDay: (observation: Observation) => void }) {
  const today = data.find(item => item.localDate === todayIso)!
  const previous = data.find(item => item.localDate === '2026-09-06')
  const decision = interpretObservation(today, previous)
  return <div className="page today-page">
    <DemoNotice/>
    <header className="page-header today-header">
      <div><p className="greeting">Boa tarde, Kauany</p><p className="date-line">{dateFormatter.format(new Date(`${todayIso}T12:00:00`))} <span/> Dia 11 do ciclo</p></div>
      <GoalSwitch goal={goal} onChange={onGoalChange} compact/>
    </header>
    <div className="today-grid">
      <div className="today-primary">
        <StatusCard decision={decision} goal={goal} recordStatus={today.recordStatus} privateMode={privateMode} onExplain={onExplain}/>
        <button className="primary-action" onClick={onOpenRecord}><span><Icon name="plus"/> {today.recordStatus === 'draft' ? 'Concluir registro de hoje' : 'Editar registro de hoje'}</span><small>Leva cerca de 30 segundos</small></button>
        <DailySnapshot observation={today} privateMode={privateMode}/>
        <WeekStrip data={data} onSelect={onSelectDay}/>
      </div>
      <aside className="today-context">
        <EvidenceCard decision={decision} observation={today}/>
        <button className="text-link" onClick={onCalendar}>Ver calendário completo <Icon name="arrow" size={18}/></button>
      </aside>
    </div>
  </div>
}

function CalendarPage({ data, selectedDate, onSelectDate, privateMode, onEdit, onExport }: { data: Observation[]; selectedDate: string; onSelectDate: (date: string) => void; privateMode: boolean; onEdit: () => void; onExport: () => void }) {
  const selected = data.find(item => item.localDate === selectedDate)
  const selectedIndex = data.findIndex(item => item.localDate === selectedDate)
  const decision = selected ? interpretObservation(selected, data[selectedIndex - 1]) : undefined
  const offset = 2
  const days = Array.from({ length: 30 }, (_, index) => index + 1)
  return <div className="page calendar-page">
    <DemoNotice/>
    <header className="page-header split-header"><div><span className="eyebrow">Ciclo atual</span><h1>Setembro de 2026</h1><p>O calendário mostra somente o que foi observado.</p></div><button className="secondary-action" onClick={onExport}><Icon name="download"/> Exportar gráfico</button></header>
    <div className="calendar-layout">
      <section className="calendar-card" aria-labelledby="calendar-title">
        <h2 id="calendar-title" className="sr-only">Calendário de setembro de 2026</h2>
        <div className="weekday-row" aria-hidden="true">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <span key={day}>{day}</span>)}</div>
        <div className="month-grid">
          {Array.from({ length: offset }, (_, i) => <span className="calendar-spacer" key={`spacer-${i}`}/>) }
          {days.map(day => {
            const iso = `2026-09-${String(day).padStart(2, '0')}`
            const observation = data.find(item => item.localDate === iso)
            const future = day > 7
            return <button key={iso} className={`${iso === todayIso ? 'is-today' : ''} ${iso === selectedDate ? 'selected' : ''}`} onClick={() => onSelectDate(iso)} aria-label={`${day} de setembro${future ? ', dia futuro, aguardando observação' : observation ? `, ${sensationLabel(observation.sensation)}` : ', sem registro'}`}>
              <span className="month-day">{day}</span>
              {observation && <span className="cycle-day">CD {observation.cycleDay}</span>}
              <StateGlyph observation={observation} future={future} size="md"/>
              {!privateMode && observation?.intercourseVaginal && <span className="intercourse-mark" title="Relação registrada" aria-label="Relação registrada">•</span>}
            </button>
          })}
        </div>
        <div className="legend" aria-label="Legenda do gráfico">
          <span><StateGlyph observation={{ bleeding: 'heavy' } as Observation} size="sm"/> Sangramento</span>
          <span><StateGlyph observation={{ bleeding: 'spotting' } as Observation} size="sm"/> Mancha</span>
          <span><StateGlyph observation={{ bleeding: 'none', sensation: 'dry', appearance: 'nothing' } as Observation} size="sm"/> Seca/nada</span>
          <span><StateGlyph observation={{ bleeding: 'none', sensation: 'damp' } as Observation} size="sm"/> Mudança</span>
          <span><StateGlyph future size="sm"/> Futuro</span>
        </div>
      </section>
      <aside className="day-panel">
        {selected && decision ? <>
          <div className="day-panel-head"><div><span className="eyebrow">Dia selecionado</span><h2>{new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(new Date(`${selected.localDate}T12:00:00`))}</h2></div><StateGlyph observation={selected} size="lg"/></div>
          <dl className={privateMode ? 'masked-copy' : ''}>
            <div><dt>Sensação</dt><dd>{privateMode ? 'Oculto' : sensationLabel(selected.sensation)}</dd></div>
            <div><dt>Aparência</dt><dd>{privateMode ? 'Oculto' : appearanceLabel(selected.appearance)}</dd></div>
            <div><dt>Interpretação</dt><dd>{privateMode ? 'Oculta' : decision.phaseLabel}</dd></div>
            <div><dt>Regra aplicada</dt><dd>{privateMode ? 'Oculta' : decision.ruleLabel}</dd></div>
          </dl>
          <div className="decision-note"><span>{decision.certainty === 'confirmed' ? 'Confirmado' : 'Provisório'}</span><p>{privateMode ? 'Ative a visualização para ler a orientação.' : decision.guidance.avoid.label}</p></div>
          <button className="secondary-action full" onClick={onEdit}><Icon name="edit"/> Editar este registro</button>
          <p className="audit-line">Versão {selected.revision} · alterado em {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(selected.updatedAt))}</p>
        </> : <div className="empty-state"><StateGlyph future size="lg"/><h2>Aguardando observação</h2><p>Dias futuros não recebem previsão de fertilidade.</p></div>}
      </aside>
    </div>
  </div>
}

const learningCards = [
  { number: '01', tag: 'Regra 1', title: 'Sangramento forte pede cautela', body: 'O sangramento pode mascarar o início do muco fértil. Esses dias não são classificados automaticamente como inférteis.' },
  { number: '02', tag: 'Regra 2', title: 'Observe o PBI até o fim do dia', body: 'Com o Padrão Básico de Infertilidade reconhecido e sem mudança, a orientação considera noites alternadas.' },
  { number: '03', tag: 'Regra 3', title: 'Mudou? Aguarde e observe', body: 'Qualquer mudança da sensação ou aparência em relação ao seu padrão indica fertilidade potencial.' },
  { number: '04', tag: 'Ápice', title: 'O Ápice é retrospectivo', body: 'É o último dia de sensação escorregadia. Só pode ser confirmado no dia seguinte e não confirma diretamente a ovulação.' },
]

const mucusStages = [
  { key: 'dry', step: '01', sensation: 'Seca', appearance: 'Nada observado', note: 'O símbolo é compacto e sem brilho.' },
  { key: 'creamy', step: '02', sensation: 'Úmida', appearance: 'Cremosa', note: 'A forma fica opaca, espessa e irregular.' },
  { key: 'clear', step: '03', sensation: 'Molhada', appearance: 'Clara', note: 'A amostra se torna ampla e translúcida.' },
  { key: 'slippery', step: '04', sensation: 'Escorregadia', appearance: 'Elástica', note: 'O desenho se alonga como um fio contínuo.' },
]

function MucusEvolution() {
  return <section className="mucus-evolution" aria-labelledby="mucus-title">
    <header><div><span className="eyebrow">Diferenças visíveis</span><h2 id="mucus-title">Quando o muco evolui, a forma também muda.</h2></div><p>Sensação e aparência são registradas separadamente. Estes exemplos ajudam a distinguir observações — não preveem uma sequência obrigatória.</p></header>
    <ol>{mucusStages.map(stage => <li key={stage.key}><div className={`mucus-sample ${stage.key}`} role="img" aria-label={`${stage.sensation}, ${stage.appearance}`}><i/><i/><i/></div><div className="mucus-stage-copy"><small>{stage.step} · {stage.appearance}</small><strong>{stage.sensation}</strong><p>{stage.note}</p></div></li>)}</ol>
    <footer><Icon name="info" size={17}/><span>O que define o padrão é a comparação com o seu próprio dia anterior. O Ápice só é confirmado retrospectivamente.</span></footer>
  </section>
}

function LearnPage() {
  const [open, setOpen] = useState(2)
  return <div className="page learn-page">
    <DemoNotice/>
    <header className="learn-hero"><span className="eyebrow">Aprender com calma</span><h1>Seu corpo não segue um calendário.<br/> Ele mostra um padrão.</h1><p>O Método de Ovulação Billings parte do que você percebe ao longo do dia. O registro organiza essas observações para apoiar uma conversa informada com sua instrutora.</p></header>
    <MucusEvolution/>
    <div className="learn-layout">
      <section className="rules-list" aria-labelledby="rules-title"><h2 id="rules-title">As regras, em linguagem simples</h2>
        {learningCards.map((card, index) => <article className={open === index ? 'open' : ''} key={card.number}>
          <button aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)}><span className="rule-number">{card.number}</span><span><small>{card.tag}</small><strong>{card.title}</strong></span><i aria-hidden="true">+</i></button>
          {open === index && <p>{card.body}</p>}
        </article>)}
      </section>
      <aside className="pattern-lesson"><div className="lesson-visual" aria-hidden="true"><img src={`${import.meta.env.BASE_URL}mob-kl-organic-map.png`} alt="" loading="lazy"/><div className="lesson-sequence"><StateGlyph observation={{ bleeding: 'none', sensation: 'dry', appearance: 'nothing' } as Observation} size="lg"/><span className="lesson-line"/><StateGlyph observation={{ bleeding: 'none', sensation: 'damp' } as Observation} size="lg"/></div></div><span className="eyebrow">O princípio central</span><h2>Compare cada dia com o seu padrão.</h2><p>Uma mudança não é uma previsão. É um sinal observado que pede atenção e uma interpretação conservadora.</p><div className="boundary-note"><Icon name="info"/><p>O MOB não protege contra infecções sexualmente transmissíveis e o app não substitui acompanhamento profissional.</p></div></aside>
    </div>
  </div>
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (checked: boolean) => void; label: string; description: string }) {
  return <label className="toggle-row"><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)}/><i aria-hidden="true"><b/></i></label>
}

function PrivacyPage({ goal, onGoalChange, privateMode, onTogglePrivate }: { goal: Goal; onGoalChange: (goal: Goal) => void; privateMode: boolean; onTogglePrivate: (value: boolean) => void }) {
  const [discreteNotifications, setDiscreteNotifications] = useState(true)
  const [highContrast, setHighContrast] = useState(false)
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast)
  }, [highContrast])
  return <div className="page privacy-page">
    <DemoNotice/>
    <header className="page-header"><span className="eyebrow">Seu espaço</span><h1>Privacidade e preferências</h1><p>Você decide o que aparece e como usa esta demonstração.</p></header>
    <div className="settings-grid">
      <section className="settings-card privacy-feature"><div className="privacy-visual" aria-hidden="true"><img src={`${import.meta.env.BASE_URL}mob-kl-privacy-cocoon.png`} alt="" loading="lazy"/><span><Icon name="lock" size={22}/></span></div><span className="eyebrow">Atalho de privacidade</span><h2>Modo discreto</h2><p>Oculta o estado, a orientação e o marcador de relação com um toque.</p><Toggle checked={privateMode} onChange={onTogglePrivate} label="Ocultar dados sensíveis" description="Apenas nesta sessão de demonstração"/></section>
      <section className="settings-card"><span className="eyebrow">Objetivo atual</span><h2>Como você quer usar o MOB?</h2><p>A observação não muda. A orientação é adaptada ao seu objetivo.</p><GoalSwitch goal={goal} onChange={onGoalChange}/></section>
      <section className="settings-card"><span className="eyebrow">Preferências</span><h2>Conforto e discrição</h2><Toggle checked={discreteNotifications} onChange={setDiscreteNotifications} label="Notificações discretas" description="Exibe apenas “Seu registro diário está disponível”"/><Toggle checked={highContrast} onChange={setHighContrast} label="Contraste reforçado" description="Aumenta contornos e contraste das superfícies"/></section>
      <section className="settings-card data-card"><span className="eyebrow">Dados da demonstração</span><h2>Armazenados somente neste navegador</h2><p>Este protótipo não possui conta, servidor, analytics ou sincronização. Ao recarregar, os dados fictícios originais retornam.</p><button className="danger-link" onClick={() => window.location.reload()}>Restaurar dados fictícios</button></section>
    </div>
  </div>
}

const sensationOptions: Array<{ value: Sensation; label: string; description: string }> = [
  { value: 'dry', label: 'Seca', description: 'Sem sensação de umidade' },
  { value: 'damp', label: 'Úmida', description: 'Leve umidade percebida' },
  { value: 'wet', label: 'Molhada', description: 'Umidade evidente' },
  { value: 'slippery', label: 'Escorregadia', description: 'Sensação lubrificativa' },
  { value: 'other', label: 'Outra', description: 'Descrever com suas palavras' },
]
const appearanceOptions: Array<{ value: Appearance; label: string }> = [
  { value: 'nothing', label: 'Nada' }, { value: 'creamy', label: 'Cremosa' }, { value: 'shampoo_like', label: 'Tipo shampoo' }, { value: 'clear', label: 'Clara/transparente' }, { value: 'spotting', label: 'Mancha' }, { value: 'other', label: 'Outra' },
]
const bleedingOptions: Array<{ value: Bleeding; label: string }> = [
  { value: 'none', label: 'Nenhum' }, { value: 'spotting', label: 'Mancha' }, { value: 'light', label: 'Leve' }, { value: 'moderate', label: 'Moderado' }, { value: 'heavy', label: 'Forte' },
]

function RecordDialog({ open, initial, onClose, onSave }: { open: boolean; initial: Observation; onClose: () => void; onSave: (observation: Observation) => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState(initial)
  const [finalize, setFinalize] = useState(false)
  useEffect(() => {
    if (open) { setDraft(initial); setStep(0); setFinalize(initial.recordStatus === 'day_closed'); dialog.current?.showModal() }
    else if (dialog.current?.open) dialog.current.close()
  }, [open, initial])

  const save = () => onSave({ ...draft, recordStatus: finalize ? 'day_closed' : 'draft', revision: initial.revision + 1, updatedAt: new Date().toISOString() })
  const titles = ['O que você sentiu?', 'O que você observou?', 'Houve sangramento?', 'Feche o registro']
  const nextLabels = ['Próximo: aparência', 'Próximo: sangramento', 'Revisar e fechar']
  return <dialog ref={dialog} className="record-dialog" onCancel={event => { event.preventDefault(); onClose() }} aria-labelledby="record-title">
    <div className="dialog-shell">
      <header><div className="dialog-heading"><span className="eyebrow">Registro de hoje</span><h2 id="record-title">{titles[step]}</h2><div className="step-summary"><span>Etapa {step + 1} de 4</span><div className="progress" role="progressbar" aria-label={`Etapa ${step + 1} de 4`} aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={4}>{[0, 1, 2, 3].map(index => <i className={index <= step ? 'active' : ''} key={index}/>)}</div></div></div><button className="icon-button" onClick={onClose} aria-label="Fechar registro">×</button></header>
      <div className="dialog-content">
        {step === 0 && <fieldset><legend className="sr-only">Sensação na vulva ao longo do dia</legend><p className="prompt-help">Considere o que você percebeu durante suas atividades normais.</p><div className="choice-list sensation-list">{sensationOptions.map(option => <label key={option.value} className={draft.sensation === option.value ? 'selected' : ''}><input type="radio" name="sensation" value={option.value} checked={draft.sensation === option.value} onChange={() => setDraft({ ...draft, sensation: option.value })}/><span className={`sensation-symbol ${option.value}`} aria-hidden="true"><i/><i/></span><span className="choice-copy"><strong>{option.label}</strong><small>{option.description}</small></span><span className="choice-mark"><Icon name="check" size={16}/></span></label>)}</div>{draft.sensation === 'other' && <label className="text-field"><span>Descreva a sensação</span><input value={draft.sensationRaw ?? ''} onChange={event => setDraft({ ...draft, sensationRaw: event.target.value })} placeholder="Use suas próprias palavras"/></label>}</fieldset>}
        {step === 1 && <fieldset><legend className="sr-only">Aparência observada</legend><p className="prompt-help">Registre o que viu, sem precisar encaixar tudo em uma categoria.</p><div className="chip-grid">{appearanceOptions.map(option => <label key={option.value} className={draft.appearance === option.value ? 'selected' : ''}><input type="radio" name="appearance" value={option.value} checked={draft.appearance === option.value} onChange={() => setDraft({ ...draft, appearance: option.value })}/><span>{option.label}</span><Icon name="check" size={16}/></label>)}</div><label className="text-field"><span>Descrição livre <small>(opcional)</small></span><textarea value={draft.appearanceRaw ?? ''} onChange={event => setDraft({ ...draft, appearanceRaw: event.target.value })} placeholder="Ex.: creme esbranquiçado, sem elasticidade" rows={3}/></label></fieldset>}
        {step === 2 && <fieldset><legend className="sr-only">Sangramento</legend><p className="prompt-help">Selecione a intensidade percebida hoje.</p><div className="chip-grid bleeding-grid">{bleedingOptions.map(option => <label key={option.value} className={draft.bleeding === option.value ? 'selected' : ''}><input type="radio" name="bleeding" value={option.value} checked={draft.bleeding === option.value} onChange={() => setDraft({ ...draft, bleeding: option.value })}/><span className={`drop drop-${option.value}`} aria-hidden="true"/><span>{option.label}</span><Icon name="check" size={16}/></label>)}</div></fieldset>}
        {step === 3 && <fieldset><legend className="sr-only">Fechar registro</legend><p className="prompt-help">Essa informação serve apenas à alternância da Regra 2. Não pedimos outros detalhes.</p><div className="binary-question"><span>Houve relação vaginal?</span><div><label className={draft.intercourseVaginal === true ? 'selected' : ''}><input type="radio" name="intercourse" checked={draft.intercourseVaginal === true} onChange={() => setDraft({ ...draft, intercourseVaginal: true })}/><span>Sim</span></label><label className={draft.intercourseVaginal === false ? 'selected' : ''}><input type="radio" name="intercourse" checked={draft.intercourseVaginal === false} onChange={() => setDraft({ ...draft, intercourseVaginal: false })}/><span>Não</span></label></div></div><label className="finalize-check"><input type="checkbox" checked={finalize} onChange={event => setFinalize(event.target.checked)}/><span className="box"><Icon name="check" size={16}/></span><span><strong>Este é meu resumo final do dia</strong><small>Se desmarcado, o registro permanece provisório.</small></span></label></fieldset>}
      </div>
      <footer><button className="dialog-back" onClick={() => step === 0 ? onClose() : setStep(step - 1)}>{step === 0 ? 'Cancelar' : 'Voltar'}</button>{step < 3 ? <button className="dialog-next" onClick={() => setStep(step + 1)}>{nextLabels[step]} <Icon name="arrow" size={18}/></button> : <button className="dialog-next" onClick={save}>Salvar registro <Icon name="check" size={18}/></button>}</footer>
    </div>
  </dialog>
}

function RuleDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { if (open) dialog.current?.showModal(); else if (dialog.current?.open) dialog.current.close() }, [open])
  return <dialog ref={dialog} className="rule-dialog" onCancel={event => { event.preventDefault(); onClose() }}><div><button className="icon-button close" onClick={onClose} aria-label="Fechar explicação">×</button><span className="rule-seal">R3</span><span className="eyebrow">Regra 3 · mudou, aguarde e observe</span><h2>Hoje houve uma mudança do seu padrão.</h2><p>A sensação úmida e a aparência cremosa são diferentes do Padrão Básico de Infertilidade seco registrado nos dias anteriores. Por isso, a interpretação é conservadora.</p><div className="boundary-note"><Icon name="info"/><p>A Regra 3 permanece até que o padrão evolua para um possível Ápice ou retorne ao PBI pelo período previsto no método.</p></div><button className="dialog-next full" onClick={onClose}>Entendi</button></div></dialog>
}

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [goal, setGoal] = useState<Goal>('avoid')
  const [data, setData] = useState(seededObservations)
  const [privateMode, setPrivateMode] = useState(false)
  const [selectedDate, setSelectedDate] = useState(todayIso)
  const [recordOpen, setRecordOpen] = useState(false)
  const [ruleOpen, setRuleOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [lastToday, setLastToday] = useState<Observation | null>(null)
  const today = useMemo(() => data.find(item => item.localDate === todayIso)!, [data])

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [tab])
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(null), 5000); return () => window.clearTimeout(timer) }, [toast])

  const navigate = (next: Tab) => setTab(next)
  const openDay = (observation: Observation) => { setSelectedDate(observation.localDate); setTab('calendar') }
  const saveObservation = (updated: Observation) => {
    setLastToday(today)
    setData(items => items.map(item => item.id === updated.id ? updated : item))
    setRecordOpen(false)
    setToast(updated.recordStatus === 'day_closed' ? 'Registro concluído. A interpretação de hoje foi atualizada.' : 'Rascunho salvo. Confirme o registro à noite.')
  }
  const undo = () => { if (!lastToday) return; setData(items => items.map(item => item.id === lastToday.id ? lastToday : item)); setToast('Alteração desfeita.'); setLastToday(null) }
  const exportChart = () => {
    const rows = ['data,dia_do_ciclo,sangramento,sensacao,aparencia,relacao_vaginal,estado_registro']
    data.forEach(item => rows.push([item.localDate, item.cycleDay, item.bleeding, item.sensation, item.appearance, item.intercourseVaginal ?? '', item.recordStatus].join(',')))
    const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'registro-mob-kl-demonstracao.csv'; anchor.click(); URL.revokeObjectURL(url)
    setToast('Gráfico demonstrativo exportado em CSV.')
  }

  return <Shell active={tab} onNavigate={navigate} privateMode={privateMode} onTogglePrivacy={() => setPrivateMode(value => !value)}>
    {tab === 'today' && <TodayPage data={data} goal={goal} privateMode={privateMode} onGoalChange={setGoal} onOpenRecord={() => setRecordOpen(true)} onCalendar={() => setTab('calendar')} onExplain={() => setRuleOpen(true)} onSelectDay={openDay}/>} 
    {tab === 'calendar' && <CalendarPage data={data} selectedDate={selectedDate} onSelectDate={setSelectedDate} privateMode={privateMode} onEdit={() => selectedDate === todayIso ? setRecordOpen(true) : setToast('Nesta demonstração, a edição está ativa apenas para hoje.')} onExport={exportChart}/>} 
    {tab === 'learn' && <LearnPage/>}
    {tab === 'privacy' && <PrivacyPage goal={goal} onGoalChange={setGoal} privateMode={privateMode} onTogglePrivate={setPrivateMode}/>} 
    <RecordDialog open={recordOpen} initial={today} onClose={() => setRecordOpen(false)} onSave={saveObservation}/>
    <RuleDialog open={ruleOpen} onClose={() => setRuleOpen(false)}/>
    {toast && <div className="toast" role="status"><Icon name="check"/><span>{toast}</span>{lastToday && <button onClick={undo}>Desfazer</button>}</div>}
    <span className="sr-only" aria-live="polite">{seededRevisions.length} edição anterior carregada.</span>
  </Shell>
}
