import { useMemo, useState } from 'react'
import { mockCompetitions, states } from './data/mockCompetitions'

const PROFILE_KEY = 'animahub-profile'

const emptyProfile = {
  name: '',
  education: '',
  states: [],
  description: '',
}

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || emptyProfile
  } catch {
    return emptyProfile
  }
}

function App() {
  const [profile, setProfile] = useState(loadProfile)
  const [screen, setScreen] = useState(profile.name ? 'competitions' : 'profile')

  function saveProfile(nextProfile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile))
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
    if (!form.name.trim() || !form.education.trim() || form.states.length === 0) return
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
          Qual é a sua formação?
          <input value={form.education} onChange={(event) => update('education', event.target.value)} placeholder="Ex.: Sistemas de Informação" required />
        </label>

        <fieldset>
          <legend>Em quais estados você quer fazer concurso?</legend>
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
          Fale mais sobre sua experiência e interesses
          <textarea value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Ex.: Trabalho com desenvolvimento de sistemas e me interesso por tecnologia no setor público." rows="5" />
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

  const visibleCompetitions = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim()
    return mockCompetitions.filter((competition) => {
      const matchesState = stateFilter === 'all' || competition.state === stateFilter
      const matchesStatus = statusFilter === 'all' || competition.status === statusFilter
      const matchesSearch = !normalizedSearch || `${competition.title} ${competition.organization}`.toLowerCase().includes(normalizedSearch)
      return matchesState && matchesStatus && matchesSearch
    })
  }, [search, stateFilter, statusFilter])

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">Concursos para você</div>
          <h1>Olá, {profile.name.split(' ')[0]}.</h1>
          <p className="lead">Encontramos oportunidades que conversam com a sua formação.</p>
        </div>
        <button className="secondary-button" onClick={onEditProfile}>Editar perfil</button>
      </div>

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
            <option value="Inscrições abertas">Inscrições abertas</option>
            <option value="Previsto">Previstos</option>
          </select>
        </label>
      </div>

      <div className="results-header">
        <strong>{visibleCompetitions.length} concursos encontrados</strong>
        <span>Ordenados por compatibilidade</span>
      </div>

      <div className="competition-list">
        {visibleCompetitions.map((competition) => <CompetitionCard competition={competition} key={competition.id} />)}
        {visibleCompetitions.length === 0 && <div className="card empty-state">Nenhum concurso encontrado com esses filtros.</div>}
      </div>
    </section>
  )
}

function CompetitionCard({ competition }) {
  return (
    <article className="card competition-card">
      <div className="card-topline">
        <span className="status-badge">{competition.status}</span>
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
        <button className="text-button">Ver análise <span aria-hidden="true">→</span></button>
      </div>
    </article>
  )
}

export default App
