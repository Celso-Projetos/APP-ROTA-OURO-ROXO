import { useEffect, useMemo, useState } from 'react';
import { api, auth } from '@appdeploy/client';

type Visit = {
  id: string;
  date: string;
  seller: string;
  plannedRoute: string;
  customer: string;
  placeVisited: string;
  status: string;
  order: boolean;
  revenue: number;
  notes: string;
  latitude?: number;
  longitude?: number;
  locationAt?: string;
  checkInAt?: string;
  visitPhoto?: { path: string; contentType: string };
  orderPhoto?: { path: string; contentType: string };
  visitPhotoUrl?: string;
  orderPhotoUrl?: string;
  registeredBy?: string;
};
const simulationResults = [
  { name: 'Luiz Prado', visits: 18, completed: 14, orders: 8, sales: 12480 },
  { name: 'Flávio', visits: 22, completed: 18, orders: 9, sales: 17850 },
  { name: 'Fagner', visits: 15, completed: 12, orders: 6, sales: 9300 },
  { name: '2ª programação', visits: 9, completed: 7, orders: 3, sales: 3600 },
];
const simulationVisits = [
  { day: '03', seller: 'Luiz Prado', customer: 'Mercado Central', city: 'Pouso Alegre', status: 'Pedido realizado', value: 1850 },
  { day: '05', seller: 'Flávio', customer: 'Empório da Praça', city: 'Varginha', status: 'Pedido realizado', value: 2470 },
  { day: '08', seller: 'Fagner', customer: 'Mercearia São José', city: 'Santa Rita do Sapucaí', status: 'Pedido realizado', value: 1320 },
  { day: '11', seller: 'Luiz Prado', customer: 'Comercial Estiva', city: 'Estiva', status: 'Sem pedido', value: 0 },
  { day: '14', seller: 'Flávio', customer: 'Supermercado União', city: 'Alfenas', status: 'Pedido realizado', value: 3180 },
  { day: '18', seller: '2ª programação', customer: 'Loja do Bairro', city: 'Poços de Caldas', status: 'Pedido realizado', value: 980 },
];
const routes: Record<string, string[][]> = {
  'Luiz Prado': [
    ['Pouso Alegre', 'Pouso Alegre', 'Pouso Alegre', 'Pouso Alegre'],
    [
      'Estiva, Cambuí e Camanducaia',
      'Silvianópolis e Turvolândia',
      'Estiva, Cambuí e Camanducaia',
      'Silvianópolis e Turvolândia',
    ],
    ['Pouso Alegre', 'Poço Fundo', 'Pouso Alegre', 'Poço Fundo'],
    [
      'Itapeva, Extrema, Senador Amaral e Bom Repouso',
      'Estiva e Cambuí',
      'Itapeva, Extrema, Senador Amaral e Bom Repouso',
      'Estiva e Cambuí',
    ],
    [
      'Pouso Alegre • reunião',
      'Pouso Alegre • reunião',
      'Pouso Alegre • reunião',
      'Pouso Alegre • reunião',
    ],
  ],
  '2ª programação': [
    [
      'Andradas, Congonhal, Ipuiúna e Senador José Bento',
      'Poços de Caldas',
      'Andradas, Congonhal, Ipuiúna e Senador José Bento',
      'Poços de Caldas',
    ],
    ['Campestre', 'Campestre', 'Campestre', 'Campestre'],
    [
      'Monte Sião, Águas de Lindóia e Ouro Fino',
      'Águas de Lindóia',
      'Monte Sião, Águas de Lindóia e Ouro Fino',
      'Águas de Lindóia',
    ],
    [
      'Borda da Mata, Inconfidentes, Bueno Brandão e Tocos do Moji',
      'Inconfidentes e Borda da Mata',
      'Borda da Mata, Inconfidentes, Bueno Brandão e Tocos do Moji',
      'Inconfidentes e Borda da Mata',
    ],
    [
      'Ouro Fino • telefone e reunião',
      'Ouro Fino • telefone e reunião',
      'Ouro Fino • telefone e reunião',
      'Ouro Fino • telefone e reunião',
    ],
  ],
  'Rota sugerida (Fagner)': [
    [
      'Santa Rita do Sapucaí e Cachoeira de Minas',
      'Santa Rita do Sapucaí e Cachoeira de Minas',
      'Santa Rita do Sapucaí e Cachoeira de Minas',
      'Santa Rita do Sapucaí e Cachoeira de Minas',
    ],
    [
      'Conceição dos Ouros e Paraisópolis',
      'Conceição dos Ouros e Paraisópolis',
      'Conceição dos Ouros e Paraisópolis',
      'Conceição dos Ouros e Paraisópolis',
    ],
    [
      'São José do Alegre e Itajubá',
      'São José do Alegre e Itajubá',
      'São José do Alegre e Itajubá',
      'São José do Alegre e Itajubá',
    ],
    [
      'São Gonçalo do Sapucaí e Bela Vista',
      'São Gonçalo do Sapucaí e Bela Vista',
      'São Gonçalo do Sapucaí e Bela Vista',
      'São Gonçalo do Sapucaí e Bela Vista',
    ],
    [
      'Empresa • reunião, clientes, pedidos e planejamento',
      'Empresa • reunião, clientes, pedidos e planejamento',
      'Empresa • reunião, clientes, pedidos e planejamento',
      'Empresa • reunião, clientes, pedidos e planejamento',
    ],
  ],
  Flávio: [
    [
      'Varginha / Alfenas',
      'Varginha / Alfenas',
      'Varginha / Alfenas',
      'Varginha / Alfenas',
    ],
    [
      'Lavras / Ijaci / Perdões',
      'Lavras / Ijaci / Perdões',
      'Lavras / Ijaci / Perdões',
      'Lavras / Ijaci / Perdões',
    ],
    [
      'Três Pontas, Campos Gerais e Boa Esperança',
      'Três Pontas, Campos Gerais e Boa Esperança',
      'Três Pontas, Campos Gerais e Boa Esperança',
      'Três Pontas, Campos Gerais e Boa Esperança',
    ],
    [
      'Itumirim / Três Corações / Nepomuceno',
      'Itumirim / Três Corações / Nepomuceno',
      'Itumirim / Três Corações / Nepomuceno',
      'Itumirim / Três Corações / Nepomuceno',
    ],
    ['Telefone', 'Telefone', 'Telefone', 'Telefone'],
  ],
};
const sellers = Object.keys(routes),
  days = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
  ];
const today = () => new Date().toLocaleDateString('en-CA');
const money = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    n || 0
  );
const dateLabel = (s: string) =>
  s ? new Date(s + 'T12:00:00').toLocaleDateString('pt-BR') : '—';
function plan(date: string, seller: string) {
  if (!date || !seller) return '';
  const d = new Date(date + 'T12:00:00'),
    day = d.getDay();
  if (day === 0 || day === 6) return 'Sem rota planejada para este dia';
  return routes[seller][day - 1][
    Math.min(3, Math.floor((d.getDate() - 1) / 7))
  ];
}
function App() {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(
      null
    ),
    [ready, setReady] = useState(false);
  const [items, setItems] = useState<Visit[]>([]),
    [month, setMonth] = useState(today().slice(0, 7)),
    [tab, setTab] = useState('Resumo');
  const [date, setDate] = useState(today()),
    [seller, setSeller] = useState(sellers[0]),
    [customer, setCustomer] = useState('');
  const [place, setPlace] = useState(''),
    [status, setStatus] = useState('Realizada'),
    [order, setOrder] = useState(false);
  const [revenue, setRevenue] = useState(''),
    [notes, setNotes] = useState(''),
    [gps, setGps] = useState<{
      latitude: number;
      longitude: number;
      locationAt: string;
    } | null>(null);
  const [message, setMessage] = useState(''),
    [saving, setSaving] = useState(false);
  const [visitPhoto, setVisitPhoto] = useState('');
  const [orderPhoto, setOrderPhoto] = useState('');
  async function refresh() {
    const r = await api.get('/api/visits');
    setItems(r.data as Visit[]);
  }
  useEffect(() => {
    auth
      .getUser()
      .then(async u => {
        setUser(u);
        if (u) await refresh();
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);
  const monthItems = useMemo(
    () => items.filter(v => v.date.slice(0, 7) === month),
    [items, month]
  );
  const revenueTotal = monthItems
      .filter(v => v.order)
      .reduce((a, v) => a + Number(v.revenue || 0), 0),
    gpsTotal = monthItems.filter(v => v.latitude !== undefined).length;
  const sellerResults = sellers
    .map(name => {
      const visits = monthItems.filter(v => v.seller === name);
      const completed = visits.filter(v => v.status === 'Realizada');
      const orders = visits.filter(v => v.order);
      const sales = orders.reduce((sum, v) => sum + Number(v.revenue || 0), 0);
      return {
        name,
        visits: visits.length,
        completed: completed.length,
        orders: orders.length,
        conversion: visits.length ? Math.round((orders.length / visits.length) * 100) : 0,
        sales,
      };
    })
    .sort((a, b) => b.sales - a.sales || b.orders - a.orders);
  const topSales = Math.max(1, ...sellerResults.map(result => result.sales));
  const route = plan(date, seller);
  function capture() {
    if (gps) return;
    setMessage('');
    if (!navigator.geolocation) {
      setMessage(
        'Este aparelho não oferece localização. O check-in com GPS é obrigatório para salvar a visita.'
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      p => {
        setGps({
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
          locationAt: new Date().toISOString(),
        });
        setMessage('Check-in registrado com localização e horário.');
      },
      e =>
        setMessage(
          e.code === 1
            ? 'A permissão foi negada. Libere o GPS no navegador para fazer o check-in.'
            : 'Não foi possível obter o GPS agora. Tente novamente.'
        ),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!customer.trim()) {
      setMessage('Informe o nome do cliente.');
      return;
    }
    if (!gps) {
      setMessage('Faça o check-in com GPS antes de salvar a visita.');
      return;
    }
    if (!visitPhoto) {
      setMessage('Anexe uma foto da visita antes de salvar.');
      return;
    }
    if (order && !orderPhoto) {
      setMessage('Como houve pedido, anexe também a foto do pedido.');
      return;
    }
    if (order && !(Number(revenue) > 0)) {
      setMessage('Informe o valor do pedido.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        id: crypto.randomUUID(),
        date,
        seller,
        plannedRoute: route,
        customer: customer.trim(),
        placeVisited: place.trim(),
        status,
        order,
        revenue: order ? Number(revenue || 0) : 0,
        notes: notes.trim(),
        ...gps,
        checkInAt: gps.locationAt,
        photos: { visit: visitPhoto, ...(orderPhoto ? { order: orderPhoto } : {}) },
      };
      const r = await api.post('/api/visits', payload);
      setItems([r.data as Visit, ...items]);
      setCustomer('');
      setPlace('');
      setStatus('Realizada');
      setOrder(false);
      setRevenue('');
      setNotes('');
      setGps(null);
      setVisitPhoto('');
      setOrderPhoto('');
      setTab('Histórico');
      setMessage('Visita salva.');
    } catch {
      setMessage('Não foi possível salvar. Confira a conexão e tente de novo.');
    } finally {
      setSaving(false);
    }
  }
  async function remove(id: string) {
    if (!window.confirm('Excluir este registro?')) return;
    try {
      await api.delete('/api/visits/' + encodeURIComponent(id));
      setItems(items.filter(v => v.id !== id));
    } catch {
      setMessage('Não foi possível excluir o registro. Apenas quem registrou a visita pode excluí-la.');
    }
  }
  if (!ready) return <main className="center">Carregando…</main>;
  if (!user)
    return (
      <main className="login">
        <div className="login-card">
          <img className="brand-image login-logo" src="/resources/ouro-roxo-logo.png" alt="Ouro Roxo Açaí Rotas e Visitas" />
          <p className="eyebrow">OURO ROXO AÇAÍ</p>
          <h1>Rotas e visitas</h1>
          <p>
            Consulte as rotas planejadas e registre os atendimentos. A localização é registrada somente no check-in de cada visita.
          </p>
          <button
            className="primary wide"
            onClick={() =>
              auth
                .signInWithRedirect()
                .catch(() =>
                  setMessage('Não foi possível entrar. Tente novamente.')
                )
            }
          >
            Entrar com minha conta
          </button>
          {message && <p className="notice">{message}</p>}
          <small>Seus registros ficam salvos nesta conta.</small>
        </div>
      </main>
    );
  return (
    <div className="shell">
      <header>
        <div className="brand">
          <img className="brand-image header-logo" src="/resources/ouro-roxo-logo.png" alt="Ouro Roxo Açaí Rotas e Visitas" />
          <div>
            <b>Ouro Roxo</b>
            <small>Rotas e visitas</small>
          </div>
        </div>
        <div className="account">
          {user.name || user.email}
          <button
            onClick={async () => {
              await auth.signOut();
              setUser(null);
            }}
          >
            Sair
          </button>
        </div>
      </header>
      <main className="container">
        <div className="heading">
          <div>
            <p className="eyebrow">GESTÃO DE ROTAS E CLIENTES</p>
            <h1>Rotas e visitas em um só lugar</h1>
            <p>
              Planeje o dia, registre cada atendimento e acompanhe os resultados do mês.
            </p>
          </div>
          <label className="month">
            Mês de acompanhamento
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
            />
          </label>
        </div>
        <nav>
          {['Resumo', 'Registrar visita', 'Histórico', 'Rotas planejadas', 'Simulação'].map(
            t => (
              <button
                className={tab === t ? 'selected' : ''}
                key={t}
                onClick={() => {
                  setTab(t);
                  setMessage('');
                }}
              >
                {t}
              </button>
            )
          )}
        </nav>
        {message && tab !== 'Registrar visita' && (
          <p className="notice">{message}</p>
        )}
        {tab === 'Resumo' && (
          <>
            <div className="metrics">
              <article>
                <span>Visitas registradas</span>
                <b>{monthItems.length}</b>
                <small>no mês</small>
              </article>
              <article>
                <span>Visitas com GPS</span>
                <b>{gpsTotal}</b>
                <small>local e horário registrados</small>
              </article>
              <article>
                <span>Pedidos gerados</span>
                <b>{monthItems.filter(v => v.order).length}</b>
                <small>marcados neste mês</small>
              </article>
              <article>
                <span>Vendas registradas</span>
                <b>{money(revenueTotal)}</b>
                <small>no mês</small>
              </article>
            </div>
            <section className="performance panel">
              <div className="section-title performance-heading">
                <div>
                  <p className="eyebrow">DESEMPENHO COMERCIAL</p>
                  <h2>Resultado por vendedor</h2>
                  <p>Comparativo do mês selecionado, com base nas visitas registradas.</p>
                </div>
                <span className="period-chip">{dateLabel(month + '-01').slice(3)}</span>
              </div>
              {monthItems.length === 0 ? (
                <div className="performance-empty">Os resultados aparecem aqui assim que houver visitas registradas neste mês.</div>
              ) : (
                <div className="seller-results">
                  {sellerResults.map((result, index) => (
                    <article className="seller-result" key={result.name}>
                      <div className="seller-result-top">
                        <div className="seller-name">
                          <span className="rank">{String(index + 1).padStart(2, '0')}</span>
                          <div><b>{result.name}</b><small>{result.visits} visitas · {result.completed} realizadas</small></div>
                        </div>
                        <strong>{money(result.sales)}</strong>
                      </div>
                      <div className="sales-track" aria-label={result.sales + ' em vendas'}>
                        <span style={{ width: Math.max(result.sales ? 8 : 0, (result.sales / topSales) * 100) + '%' }} />
                      </div>
                      <div className="seller-stats">
                        <span><b>{result.orders}</b> pedidos</span>
                        <span><b>{result.conversion}%</b> conversão</span>
                        <span><b>{result.visits}</b> visitas</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              <p className="chart-note">Conversão = visitas com pedido ÷ visitas registradas. Os resultados dependem dos dados preenchidos pela equipe.</p>
            </section>
            <div className="section-title">
              <div>
                <h2>Visitas recentes</h2>
                <p>Últimos atendimentos registrados neste mês.</p>
              </div>
              <button
                className="primary"
                onClick={() => setTab('Registrar visita')}
              >
                + Registrar visita
              </button>
            </div>
            <Table items={monthItems.slice(0, 8)} remove={remove} />
          </>
        )}
        {tab === 'Registrar visita' && (
          <div className="layout">
            <form className="panel form" onSubmit={save}>
              <p className="eyebrow">NOVO REGISTRO</p>
              <h2>Registrar visita</h2>
              <p>
                Informe o cliente e faça o check-in com GPS no local. Depois registre o resultado, o pedido e as fotos.
              </p>
              <div className="fields">
                <label>
                  Data
                  <input
                    disabled={Boolean(gps)}
                    required
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </label>
                <label>
                  Responsável
                  <select
                    disabled={Boolean(gps)}
                    value={seller}
                    onChange={e => setSeller(e.target.value)}
                  >
                    {sellers.map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="full">
                  Rota planejada
                  <input readOnly value={route} />
                </label>
                <label>
                  Cliente
                  <input
                    disabled={Boolean(gps)}
                    required
                    value={customer}
                    onChange={e => setCustomer(e.target.value)}
                    placeholder="Nome do cliente"
                  />
                </label>
                <label>
                  Local visitado
                  <input
                    disabled={Boolean(gps)}
                    value={place}
                    onChange={e => setPlace(e.target.value)}
                    placeholder="Cidade, bairro ou endereço"
                  />
                </label>
                <label>
                      Resultado do atendimento
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                  >
                    <option>Realizada</option>
                    <option>Cliente inativo</option>
                    <option>Não atendido</option>
                    <option>Remarcada</option>
                  </select>
                </label>
                <label>
                  Valor do pedido (R$)
                  <input
                    disabled={!order}
                    type="number"
                    min="0"
                    step="0.01"
                    value={revenue}
                    onChange={e => setRevenue(e.target.value)}
                    placeholder={order ? '0,00' : 'Marque "Gerou pedido"'}
                  />
                </label>
                <label className="full">
                  Observações
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Resultado ou detalhe importante"
                  />
                </label>
              </div>
              <div className="evidence-fields">
                <label className="photo-input">
                  Foto da visita <small>Obrigatória</small>
                  <input type="file" accept="image/*" capture="environment" onChange={async e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 12 * 1024 * 1024) { setMessage('A foto deve ter até 12 MB.'); return; }
                    const data = await new Promise<string>((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
                      reader.onerror = reject;
                      reader.readAsDataURL(file);
                    });
                    setVisitPhoto(data);
                  }} />
                  {visitPhoto && <span className="photo-ready">Foto anexada</span>}
                </label>
                <label className="photo-input">
                  Foto do pedido <small>{order ? 'Obrigatória quando houver pedido' : 'Opcional'}</small>
                  <input type="file" accept="image/*" capture="environment" onChange={async e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 12 * 1024 * 1024) { setMessage('A foto deve ter até 12 MB.'); return; }
                    const data = await new Promise<string>((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
                      reader.onerror = reject;
                      reader.readAsDataURL(file);
                    });
                    setOrderPhoto(data);
                  }} />
                  {orderPhoto && <span className="photo-ready">Foto anexada</span>}
                </label>
              </div>
              <div className="gps">
                <span className="pin">⌖</span>
                <div>
                  <b>
                    {gps
                      ? 'Check-in realizado'
                      : 'Faça o check-in no local'}
                  </b>
                  <small>
                    {gps
                      ? gps.latitude.toFixed(5) +
                        ', ' +
                        gps.longitude.toFixed(5) +
                        ' • ' +
                        new Date(gps.locationAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Permita o acesso ao GPS ao marcar a visita.'}
                    {gps && (
                      <a
                        className="checkin-map-link"
                        href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(gps.latitude + ',' + gps.longitude)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir endereço no Google Maps
                      </a>
                    )}
                  </small>
                </div>
                <button className="secondary" type="button" onClick={capture} disabled={Boolean(gps)}>
                  {gps ? 'Check-in travado' : 'Fazer check-in'}
                </button>
              </div>
              <p className="privacy">
                O check-in salva o ponto GPS e o horário informados pelo aparelho. O aplicativo não acompanha o celular continuamente; use as fotos e observações para a conferência.
              </p>
              {message && <p className="notice">{message}</p>}
              <div className="actions">
                <label>
                  <input
                    type="checkbox"
                    checked={order}
                    onChange={e => {
                      setOrder(e.target.checked);
                      if (!e.target.checked) setRevenue('');
                    }}
                  />{' '}
                  Gerou pedido
                </label>
                <button className="primary" disabled={saving}>
                  {saving ? 'Salvando…' : 'Salvar visita'}
                </button>
              </div>
            </form>
            <aside className="panel preview">
              <p className="eyebrow">PROGRAMAÇÃO DO DIA</p>
              <h3>{dateLabel(date)}</h3>
              <small>{seller}</small>
              <div className="route">{route}</div>
              <p>
                A rota é preenchida conforme a programação da planilha. Registre
                o local visitado para comparar depois.
              </p>
            </aside>
          </div>
        )}
        {tab === 'Simulação' && (
          <section className="simulation">
            <div className="simulation-banner">
              <div>
                <p className="eyebrow">MODO DE DEMONSTRAÇÃO</p>
                <h2>Simulação de visitas e vendas</h2>
                <p>Exemplo fictício para visualizar como os resultados da equipe aparecem no aplicativo.</p>
              </div>
              <span>DEMO · NÃO SALVA NO HISTÓRICO</span>
            </div>
            <div className="metrics simulation-metrics">
              <article><span>Visitas simuladas</span><b>64</b><small>no período demonstrativo</small></article>
              <article><span>Visitas realizadas</span><b>51</b><small>80% das visitas</small></article>
              <article><span>Pedidos gerados</span><b>26</b><small>conversão geral de 41%</small></article>
              <article><span>Faturamento simulado</span><b>{money(43230)}</b><small>valor fictício</small></article>
            </div>
            <section className="performance panel">
              <div className="section-title performance-heading">
                <div><p className="eyebrow">DESEMPENHO POR VENDEDOR</p><h2>Comparativo da equipe</h2><p>Conversão calculada sobre as visitas simuladas.</p></div>
              </div>
              <div className="seller-results">
                {simulationResults.map((result, index) => (
                  <article className="seller-result" key={result.name}>
                    <div className="seller-result-top">
                      <div className="seller-name"><span className="rank">{String(index + 1).padStart(2, '0')}</span><div><b>{result.name}</b><small>{result.visits} visitas · {result.completed} realizadas</small></div></div>
                      <strong>{money(result.sales)}</strong>
                    </div>
                    <div className="sales-track"><span style={{ width: (result.sales / 17850 * 100) + '%' }} /></div>
                    <div className="seller-stats"><span><b>{result.orders}</b> pedidos</span><span><b>{Math.round(result.orders / result.visits * 100)}%</b> conversão</span><span><b>{result.visits}</b> visitas</span></div>
                  </article>
                ))}
              </div>
            </section>
            <div className="section-title"><div><h2>Exemplos de visitas</h2><p>Registros inventados apenas para demonstrar o painel.</p></div></div>
            <div className="panel table-wrap">
              <table><thead><tr><th>Dia</th><th>Vendedor</th><th>Cliente</th><th>Cidade</th><th>Resultado</th><th>Venda simulada</th></tr></thead>
                <tbody>{simulationVisits.map((visit, index) => <tr key={index}><td>{visit.day}</td><td>{visit.seller}</td><td>{visit.customer}</td><td>{visit.city}</td><td>{visit.status}</td><td>{money(visit.value)}</td></tr>)}</tbody>
              </table>
            </div>
            <p className="chart-note">Todos os nomes de clientes, quantidades e valores desta aba são dados demonstrativos. Eles não entram nos indicadores reais, não geram pedidos e não ficam salvos.</p>
          </section>
        )}
        {tab === 'Histórico' && (
          <>
            <div className="section-title">
              <div>
                <h2>Histórico de visitas</h2>
                <p>{monthItems.length} registros no mês selecionado.</p>
              </div>
              <button
                className="primary"
                onClick={() => setTab('Registrar visita')}
              >
                + Registrar visita
              </button>
            </div>
            <Table items={monthItems} remove={remove} />
          </>
        )}
        {tab === 'Rotas planejadas' && (
          <>
            <div className="section-title">
              <div>
                <h2>Programação das rotas</h2>
                <p>Conforme a planilha enviada.</p>
              </div>
            </div>
            {sellers.map(s => (
              <article className="panel route-card" key={s}>
                <h3>{s}</h3>
                {s === '2ª programação' && (
                  <small>Responsável ainda não definido na planilha</small>
                )}
                {days.map((d, i) => (
                  <div className="day" key={d}>
                    <b>{d}</b>
                    <div className="weeks">
                      {routes[s][i].map((x, j) => (
                        <div key={j}>
                          <small>Semana {j + 1}</small>
                          <span>{x}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </article>
            ))}
          </>
        )}
      </main>
      <footer>Ouro Roxo Açaí · Controle mensal de visitas</footer>
    </div>
  );
}
function Table({
  items,
  remove,
}: {
  items: Visit[];
  remove: (id: string) => void;
}) {
  if (!items.length)
    return (
      <div className="panel empty">
        <b>Nenhuma visita neste mês</b>
        <p>Registre a primeira visita para começar.</p>
      </div>
    );
  return (
    <div className="panel table-wrap">
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Cliente / responsável</th>
            <th>Rota planejada</th>
            <th>Resultado</th>
            <th>Pedido / valor</th>
            <th>Localização</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map(v => (
            <tr key={v.id}>
              <td>{dateLabel(v.date)}</td>
              <td>                  <b>{v.customer}</b>
                <small>{v.seller}</small>
                {v.registeredBy && <small>Registrado por: {v.registeredBy}</small>}
              </td>
              <td>{v.plannedRoute}</td>
              <td>{v.status}</td>
              <td>{v.order ? 'Sim • ' + money(v.revenue) : 'Não'}</td>
              <td>
                {v.latitude !== undefined && v.longitude !== undefined ? (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={
                      'https://www.google.com/maps/search/?api=1&query=' +
                      encodeURIComponent(v.latitude + ',' + v.longitude)
                    }
                  >
                    Abrir no Google Maps
                  </a>
                )                  : (
                  'Sem GPS'
                )}
                {v.checkInAt && <small className="checkin-time">Check-in: {new Date(v.checkInAt).toLocaleString('pt-BR')}</small>}
                {v.visitPhotoUrl && <a className="evidence-link" href={v.visitPhotoUrl} target="_blank" rel="noreferrer">Foto da visita</a>}
                {v.orderPhotoUrl && <a className="evidence-link" href={v.orderPhotoUrl} target="_blank" rel="noreferrer">Foto do pedido</a>}
              </td>
              <td>
                <button className="delete" onClick={() => remove(v.id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default App;
