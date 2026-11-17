import { useEffect, useMemo, useState } from 'react'
import { states } from './data/mockCompetitions'

const PROFILE_KEY = 'animahub-profile'
const API_URL = 'http://127.0.0.1:8000'

const emptyProfile = {
  name: '',
  educationLevel: '',
  education: '',
  targetPositions: '',
  knowledgeAreas: '',
  experience: '',
  salaryMinimum: '',
  states: [],
  description: '',
}

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY))
    return saved ? { ...emptyProfile, ...saved, states: saved.states || [] } : emptyProfile
  } catch {
    return emptyProfile
  }
}

function mapApiProfile(data) {
  return {
    name: data.name || '',
    educationLevel: data.education_level || '',
    education: data.education || '',
    targetPositions: data.target_positions || '',
    knowledgeAreas: data.knowledge_areas || '',
    experience: data.experience || '',
    salaryMinimum: data.minimum_salary ?? '',
    states: data.states || [],
    description: data.description || '',
  }
}

function App() {
  const [profile, setProfile] = useState(loadProfile)
  const [screen, setScreen] = useState(profile.name ? 'competitions' : 'profile')

  useEffect(() => {
    fetch(`${API_URL}/perfil`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!data?.configured) return
        const nextProfile = mapApiProfile(data)
        localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile))
        setProfile(nextProfile)
        setScreen('competitions')
      })
      .catch(() => {
        // O perfil local continua disponível se a API estiver desligada.
      })
  }, [])

  async function saveProfile(nextProfile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile))
    try {
      await fetch(`${API_URL}/perfil`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nextProfile.name,
          education_level: nextProfile.educationLevel,
          education: nextProfile.education,
          target_positions: nextProfile.targetPositions,
          knowledge_areas: nextProfile.knowledgeAreas,
          experience: nextProfile.experience,
          minimum_salary: nextProfile.salaryMinimum ? Number(nextProfile.salaryMinimum) : null,
          states: nextProfile.states,
          description: nextProfile.description,
        }),
      })
    } catch {
      // O modo local continua disponível para a demonstração sem o backend.
    }
    setProfile(nextProfile)
    setScreen('competitions')
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setScreen(profile.name ? 'competitions' : 'profile')}>
          <span className="brand-mark">A</span>
          <span>AnimaHub</span>
        </button>
        {profile.name && (
          <button className="profile-chip" onClick={() => setScreen('profile')}>
            <span className="avatar">{profile.name.charAt(0).toUpperCase()}</span>
            {profile.name}
          </button>
        )}
      </header>

      {screen === 'profile' ? (
        <ProfileScreen initialProfile={profile} onSave={saveProfile} />
      ) : (
        <CompetitionsScreen profile={profile} onEditProfile={() => setScreen('profile')} />
      )}
    </main>
  )
}

function ProfileScreen({ initialProfile, onSave }) {
  const [form, setForm] = useState(initialProfile.name ? initialProfile : emptyProfile)

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function toggleState(uf) {
    const nextStates = form.states.includes(uf)
      ? form.states.filter((item) => item !== uf)
      : [...form.states, uf]
    update('states', nextStates)
  }

  function submit(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.educationLevel || !form.education.trim() || form.states.length === 0) return
    onSave({ ...form, name: form.name.trim(), education: form.education.trim() })
  }

  return (
    <section className="page narrow-page">
      <div className="eyebrow">Seu perfil</div>
      <h1>Vamos entender o que combina com você.</h1>
      <p className="lead">Conte um pouco sobre sua formação e escolha onde deseja fazer concurso. A IA usa esse contexto para explicar as recomendações.</p>

      <form className="card form-card" onSubmit={submit}>
        <label>
          Como podemos chamar você?
          <input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex.: João" required />
        </label>

        <label>
          Nível de escolaridade
          <select value={form.educationLevel} onChange={(event) => update('educationLevel', event.target.value)} required>
            <option value="">Selecione</option>
            <option value="fundamental">Ensino fundamental</option>
            <option value="medio">Ensino médio</option>
            <option value="tecnico">Curso técnico</option>
            <option value="superior">Ensino superior</option>
            <option value="pos-graduacao">Pós-graduação</option>
            <option value="mestrado">Mestrado</option>
            <option value="doutorado">Doutorado</option>
          </select>
        </label>

        <label>
          Qual é a sua formação?
          <input value={form.education} onChange={(event) => update('education', event.target.value)} placeholder="Ex.: Sistemas de Informação" required />
        </label>

        <div className="form-row">
          <label>
            Cargos ou áreas de interesse
            <input value={form.targetPositions} onChange={(event) => update('targetPositions', event.target.value)} placeholder="Ex.: Analista, TI, administrativo" />
          </label>
          <label>
            Pretensão salarial mínima
            <input type="number" min="0" step="100" value={form.salaryMinimum} onChange={(event) => update('salaryMinimum', event.target.value)} placeholder="A partir de R$" />
          </label>
        </div>

        <label>
          Conhecimentos e assuntos que domina
          <input value={form.knowledgeAreas} onChange={(event) => update('knowledgeAreas', event.target.value)} placeholder="Ex.: programação, gestão, direito administrativo" />
        </label>

        <label>
          Experiência profissional
          <textarea value={form.experience} onChange={(event) => update('experience', event.target.value)} placeholder="Ex.: Trabalho com desenvolvimento de sistemas e análise de processos." rows="4" />
        </label>

        <fieldset>
          <div className="fieldset-heading">
            <legend>Em quais estados você quer fazer concurso?</legend>
            <button type="button" className="text-button" onClick={() => update('states', states.map((state) => state.uf))}>Selecionar todos</button>
          </div>
          <div className="state-grid">
            {states.map((state) => (
              <label className={`state-option ${form.states.includes(state.uf) ? 'selected' : ''}`} key={state.uf}>
                <input type="checkbox" checked={form.states.includes(state.uf)} onChange={() => toggleState(state.uf)} />
                <strong>{state.uf}</strong>
                <span>{state.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          Objetivos e interesses
          <textarea value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Ex.: Busco estabilidade e quero trabalhar com tecnologia no setor público." rows="5" />
        </label>

        <button className="primary-button" type="submit">Salvar e ver concursos</button>
      </form>
    </section>
  )
}

function CompetitionsScreen({ profile, onEditProfile }) {
  const [stateFilter, setStateFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [competitions, setCompetitions] = useState([])
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [selectedCompetition, setSelectedCompetition] = useState(null)

  async function loadRecommendations() {
    try {
      const response = await fetch(`${API_URL}/recomendacoes`)
      if (!response.ok) {
        setCompetitions([])
        setSyncMessage('Não foi possível carregar as recomendações da API.')
        return
      }
      const data = await response.json()
      setCompetitions(data.map(mapRecommendation))
      setSyncMessage('Recomendações carregadas da API.')
    } catch {
      setCompetitions([])
      setSyncMessage('API indisponível. Inicie o backend para carregar concursos reais.')
    }
  }

  async function syncAll() {
    setSyncing(true)
    setSyncMessage('Sincronizando fonte real e dados de teste...')
    try {
      const response = await fetch(`${API_URL}/sincronizacao?fonte=both`, { method: 'POST' })
      if (!response.ok) throw new Error('sync failed')
      await loadRecommendations()
    } catch {
      setSyncMessage('API indisponível: os dados locais continuam disponíveis.')
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    loadRecommendations()
  }, [])

  const visibleCompetitions = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim()
    return competitions.filter((competition) => {
      const matchesProfileState = profile.states.length === 0 || profile.states.includes(competition.state)
      const matchesState = stateFilter === 'all' || competition.state === stateFilter
      const matchesStatus = statusFilter === 'all' || competition.sourceStatus === statusFilter
      const matchesSearch = !normalizedSearch || `${competition.title} ${competition.organization}`.toLowerCase().includes(normalizedSearch)
      return matchesProfileState && matchesState && matchesStatus && matchesSearch
    })
  }, [competitions, profile.states, search, stateFilter, statusFilter])

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">Concursos para você</div>
          <h1>Olá, {profile.name.split(' ')[0]}.</h1>
          <p className="lead">Encontramos oportunidades que conversam com a sua formação.</p>
        </div>
        <div className="heading-actions">
          <button className="primary-button" onClick={syncAll} disabled={syncing}>{syncing ? 'Sincronizando...' : 'Sincronizar dados'}</button>
          <button className="secondary-button" onClick={onEditProfile}>Editar perfil</button>
        </div>
      </div>

      {syncMessage && <p className="sync-message">{syncMessage}</p>}

      <div className="filters card">
        <label className="search-field">
          <span>Buscar</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cargo ou órgão" />
        </label>
        <label>
          Estado
          <select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}>
            <option value="all">Todos os estados</option>
            {profile.states.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </label>
        <label>
          Situação
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Todas</option>
            <option value="open">Inscrições abertas</option>
            <option value="expected">Previstos</option>
          </select>
        </label>
      </div>

      <div className="results-header">
        <strong>{visibleCompetitions.length} concursos encontrados</strong>
        <span>Ordenados por compatibilidade</span>
      </div>

      <div className="competition-list">
        {visibleCompetitions.map((competition) => <CompetitionCard competition={competition} onAnalyze={setSelectedCompetition} key={competition.id} />)}
        {visibleCompetitions.length === 0 && <div className="card empty-state">Nenhum concurso encontrado com esses filtros.</div>}
      </div>

      {selectedCompetition && <AnalysisModal competition={selectedCompetition} onClose={() => setSelectedCompetition(null)} />}
    </section>
  )
}

function mapRecommendation(item) {
  const labels = { alta: 'Compatibilidade alta', media: 'Compatibilidade média', baixa: 'Compatibilidade baixa' }
  const sourceStatusLabels = { open: 'Inscrições abertas', expected: 'Previsto' }
  const rawScore = item.compatibility_score ?? item.confidence ?? 0
  const compatibilityScore = rawScore <= 1 ? rawScore * 100 : rawScore
  return {
    id: item.id,
    title: item.title,
    organization: item.organization,
    state: item.state,
    status: labels[item.classification_label || item.classification] || 'Compatibilidade incerta',
    sourceStatus: item.source_status || item.status || 'unknown',
    sourceStatusLabel: sourceStatusLabels[item.source_status || item.status] || 'Situação não informada',
    publishedAt: 'Fonte sincronizada',
    deadline: 'Ver detalhes',
    score: Math.round(compatibilityScore),
    confidence: Math.round(item.confidence * 100),
    vacancies: 'Consultar edital',
    summary: item.summary || 'Concurso processado pelo classificador.',
    classification: item.classification,
    classificationLabel: item.classification_label || item.classification,
    probabilities: item.probabilities || {},
    source: item.source || 'fonte sincronizada',
    sourceUrl: item.source_url,
    scoreBreakdown: item.score_breakdown || {},
    reasons: item.reasons || [],
    gaps: item.gaps || [],
    educationRequired: item.education_required,
    areas: item.areas || [],
    positions: item.positions || [],
    salaryIdentified: item.salary_identified,
  }
}

function CompetitionCard({ competition, onAnalyze }) {
  return (
    <article className="card competition-card">
      <div className="card-topline">
        <span className="status-badge">{competition.status}</span>
        <span className="source-status-badge">{competition.sourceStatusLabel}</span>
        <span className="state-badge">{competition.state}</span>
      </div>
      <div className="competition-content">
        <div>
          <h2>{competition.title}</h2>
          <p className="organization">{competition.organization}</p>
          <p className="summary">{competition.summary}</p>
        </div>
        <div className="score-block">
          <span className="score">{competition.score}%</span>
          <span>compatibilidade</span>
        </div>
      </div>
      <div className="card-footer">
        <span><strong>Publicação</strong>{competition.publishedAt}</span>
        <span><strong>Inscrições até</strong>{competition.deadline}</span>
        <span><strong>Oportunidades</strong>{competition.vacancies}</span>
        <button className="text-button" onClick={() => onAnalyze(competition)}>Ver análise <span aria-hidden="true">→</span></button>
      </div>
    </article>
  )
}

function AnalysisModal({ competition, onClose }) {
  const probabilities = Object.entries(competition.probabilities)
    .map(([label, value]) => `${label}: ${Math.round(value * 100)}%`)
    .join(' · ')

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="analysis-modal card" role="dialog" aria-modal="true" aria-labelledby="analysis-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <div className="eyebrow">Análise da IA</div>
            <h2 id="analysis-title">{competition.title}</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Fechar análise">×</button>
        </div>
        <p className="analysis-result">{competition.status}</p>
        <p>{competition.summary}</p>
        <div className="analysis-grid">
          <span><strong>Compatibilidade estimada</strong>{competition.score}%</span>
          <span><strong>Confiança do modelo</strong>{competition.confidence ?? '—'}%</span>
          <span><strong>Classe prevista</strong>{competition.classificationLabel || '—'}</span>
          <span><strong>Distribuição do modelo</strong>{probabilities || 'Disponível após sincronização'}</span>
          <span><strong>Fonte</strong>{competition.source}</span>
          <span><strong>Estado</strong>{competition.state}</span>
        </div>
        <h3>Por que apareceu</h3>
        <ul className="analysis-list">{competition.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        {competition.gaps.length > 0 && <><h3>Pontos não identificados</h3><ul className="analysis-list muted-list">{competition.gaps.map((gap) => <li key={gap}>{gap}</li>)}</ul></>}
        <div className="analysis-details">
          <span><strong>Posições identificadas</strong>{competition.positions.join(', ') || 'Não identificadas'}</span>
          <span><strong>Salário identificado</strong>{competition.salaryIdentified ? `R$ ${competition.salaryIdentified.toLocaleString('pt-BR')}` : 'Não identificado'}</span>
        </div>
        <h3>Composição do índice</h3>
        <div className="score-breakdown">{Object.entries(competition.scoreBreakdown).map(([label, value]) => <span key={label}><strong>{label}</strong>{value} pontos</span>)}</div>
        {competition.sourceUrl && <a className="source-link" href={competition.sourceUrl} target="_blank" rel="noreferrer">Abrir publicação original</a>}
      </section>
    </div>
  )
}

export default App
