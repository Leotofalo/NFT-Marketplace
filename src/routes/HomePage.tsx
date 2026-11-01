import emeraldApeImage from "../assets/images/emerald-ape.png"
import ivoryBaronImage from "../assets/images/ivory-baron.png"
import cosmicBloomImage from "../assets/images/cosmic-bloom.png"
import violetNomadImage from "../assets/images/violet-nomad.png"
import goldenMinkImage from "../assets/images/golden-mink.png"
import neonVesselImage from "../assets/images/neon-vessel.png"
import { Footer } from "../components/layout/Footer"
import { Header } from "../components/layout/Header"
import { MobileNavigation } from "../components/layout/MobileNavigation"
import { NFTCard } from "../components/ui/NFTCard"
import { useNFTs } from "../features/nft/useNFTs"
import { useNavigate, useSearch } from "@tanstack/react-router"

export function HomePage() {
  const search = useSearch({ from: '/' })
  const navigate = useNavigate({ from: '/' })
  const updateSearch = (values: Partial<typeof search>, replace = true) => void navigate({ search: (previous) => ({ ...previous, ...values }), replace })
  const setNetworkFilter = (network: string, checked: boolean) => {
    const next = checked
      ? [...selectedNetworks, network]
      : selectedNetworks.filter((value) => value !== network)
    updateSearch({ networks: next, page: 1 })
  }
  const activeTab = search.tab ?? 'all'
  const selectedCategory = search.category ?? 'Todas'
  const searchTerm = search.q ?? ''
  const minPrice = search.min ?? 0
  const maxPrice = search.max ?? 3
  const selectedNetworks = search.networks ?? []
  const { data, isLoading, isError, refetch } = useNFTs({ q: searchTerm, category: selectedCategory === 'Todas' ? '' : selectedCategory, min: minPrice, max: Math.max(maxPrice, minPrice), networks: selectedNetworks, sort: search.sort ?? 'recent', page: search.page ?? 1, pageSize: 6 })
  const catalog = data?.items ?? []
  const totalPages = Math.ceil((data?.total ?? 0) / 6)
  const currentPage = data?.page ?? search.page ?? 1

  const categories = [
    'Arte digital',
    'Música',
    'Colecionáveis',
    'Generativa',
  ]
  const filteredNFTs = catalog.filter((nft, index) => {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('pt-BR')

  const matchesSearch =
    nft.name.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
    nft.category.toLocaleLowerCase('pt-BR').includes(normalizedSearch)

  const matchesCategory =
    selectedCategory === 'Todas' ||
    nft.category === selectedCategory

  const matchesTab =
    activeTab === 'all' ||
    (activeTab === 'new' && index < 3) ||
    (activeTab === 'trending' && nft.featured === true)

  const matchesNetwork = selectedNetworks.length === 0 || selectedNetworks.includes(nft.network)

  return matchesSearch && matchesCategory && matchesTab && matchesNetwork
})

  return (
    <div className="min-h-screen bg-ink pb-24 text-foreground md:pb-0">
      <Header
  searchValue={searchTerm}
  onSearchChange={(value) => updateSearch({ q: value, page: 1 })}
/>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="relative grid min-h-[190px] grid-cols-1 items-center gap-8 overflow-hidden rounded-2xl bg-surface-raised p-4 py-8 sm:min-h-[230px] sm:p-8 sm:py-12 lg:min-h-0 lg:grid-cols-2 lg:gap-16 lg:overflow-visible lg:rounded-none lg:bg-transparent lg:p-0 lg:py-16">
          <div className="relative z-10 order-2 max-w-[62%] lg:order-1 lg:max-w-none">
            <p className="text-xs tracking-wide text-text-secondary">
              Bem-vindo à Kurio
            </p>

            <h1 className="mt-2 max-w-xl text-base font-bold uppercase leading-snug text-foreground sm:text-2xl lg:mt-4 lg:text-5xl lg:leading-tight">
              Seja dono do futuro da arte digital
            </h1>

            <p className="mt-2 max-w-lg text-[10px] leading-relaxed text-text-secondary sm:text-xs lg:mt-5 lg:text-sm">
              Descubra NFTs selecionados de criadores emergentes e
              consagrados. Colecione arte digital rara e faça parte da
              cultura da internet.
            </p>

            <a
              href="#marketplace"
              className="mt-2 inline-flex rounded-md bg-transparent p-0 text-[10px] font-bold uppercase text-primary transition hover:text-primary-light sm:mt-4 lg:mt-6 lg:bg-primary lg:px-6 lg:py-3 lg:text-xs lg:text-ink"
            >
              Explorar
            </a>

            <div className="mt-8 hidden gap-2 lg:flex" aria-label="Slide 1 de 3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
            </div>
          </div>

          <div className="absolute right-0 top-0 order-1 h-full w-[44%] lg:static lg:order-2 lg:h-auto lg:w-auto">
        <div className="h-full overflow-hidden rounded-2xl bg-surface-raised lg:aspect-square">
          <img
    src={emeraldApeImage}
    alt="Macaco colecionável usando jaqueta verde e óculos"
    className="h-full w-full object-cover"
    fetchPriority="high"
    />
  </div>

            <div className="absolute bottom-3 left-1/2 z-10 mt-3 flex -translate-x-1/2 justify-center gap-2 lg:static lg:hidden lg:translate-x-0">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
            </div>
          </div>
        </section>

        {/* Marketplace */}
        <section id="marketplace" className="py-8 sm:py-12">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div
  className="flex gap-5 overflow-x-auto whitespace-nowrap text-xs"
  role="tablist"
  aria-label="Filtrar NFTs"
>
  <button
    type="button"
    role="tab"
    aria-selected={activeTab === 'all'}
    onClick={() => updateSearch({ tab: 'all', page: 1 }, false)}
    className={`border-b-2 pb-2 ${
      activeTab === 'all'
        ? 'border-primary font-bold text-primary'
        : 'border-transparent text-text-secondary hover:text-primary'
    }`}
  >
    Todos os NFTs
  </button>

  <button
    type="button"
    role="tab"
    aria-selected={activeTab === 'new'}
    onClick={() => updateSearch({ tab: 'new', page: 1 }, false)}
    className={`border-b-2 pb-2 ${
      activeTab === 'new'
        ? 'border-primary font-bold text-primary'
        : 'border-transparent text-text-secondary hover:text-primary'
    }`}
  >
    Novos lançamentos
  </button>

  <button
    type="button"
    role="tab"
    aria-selected={activeTab === 'trending'}
    onClick={() => updateSearch({ tab: 'trending', page: 1 }, false)}
    className={`border-b-2 pb-2 ${
      activeTab === 'trending'
        ? 'border-primary font-bold text-primary'
        : 'border-transparent text-text-secondary hover:text-primary'
    }`}
  >
    Em alta
  </button>
</div>

            <label className="hidden items-center gap-2 text-[10px] text-text-secondary sm:flex">Ordenar por:
              <select value={search.sort} onChange={(event) => updateSearch({ sort: event.target.value as 'recent' | 'price-low' | 'price-high', page: 1 })} className="rounded border border-border bg-ink px-2 py-2 text-foreground"><option value="recent">Listados recentemente</option><option value="price-low">Menor preço</option><option value="price-high">Maior preço</option></select>
            </label>
          </div>

          <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
            {/* Filtros Desktop */}
            <aside className="hidden space-y-8 lg:block">
              <div className="space-y-1">
  <button
    type="button"
    onClick={() => updateSearch({ category: 'Todas', page: 1 }, false)}
    aria-pressed={selectedCategory === 'Todas'}
    className={`flex w-full justify-between gap-3 py-2 text-left text-xs transition ${
      selectedCategory === 'Todas'
        ? 'font-bold text-primary'
        : 'text-text-secondary hover:text-primary'
    }`}
  >
    <span>Todas as categorias</span>
    <span>({catalog.length})</span>
  </button>

  {categories.map((category) => {
    const categoryCount = catalog.filter(
      (nft) => nft.category === category,
    ).length

    return (
      <button
        key={category}
        type="button"
        onClick={() => updateSearch({ category, page: 1 }, false)}
        aria-pressed={selectedCategory === category}
        className={`flex w-full justify-between gap-3 py-2 text-left text-xs transition ${
          selectedCategory === category
            ? 'font-bold text-primary'
            : 'text-text-secondary hover:text-primary'
        }`}
      >
        <span>{category}</span>
        <span>({categoryCount})</span>
      </button>
    )
  })}
</div>

              <div className="bg-surface-card p-5">
                <h2 className="text-sm font-bold">Faixa de preço</h2>

                <div className="my-4 grid gap-3 text-xs">
                  <label className="grid gap-1">Mínimo: {minPrice.toFixed(2)}<input aria-label="Preço mínimo" type="range" min="0" max="2" step="0.01" value={minPrice} onChange={event => updateSearch({ min: Number(event.target.value), page: 1 })} className="accent-primary" /></label>
                  <label className="grid gap-1">Máximo: {maxPrice.toFixed(2)}<input aria-label="Preço máximo" type="range" min="0" max="3" step="0.01" value={maxPrice} onChange={event => updateSearch({ max: Number(event.target.value), page: 1 })} className="accent-primary" /></label>
                </div>
              </div>

              <div className="bg-surface-card p-5">
                <h2 className="mb-3 text-sm font-bold">Rede</h2>

                {['Ethereum', 'Polygon', 'Solana'].map((network) => (
                  <label
                    key={network}
                    className="flex items-center gap-2 py-2 text-xs text-text-secondary"
                  >
                    <input type="checkbox" aria-label={network} checked={selectedNetworks.includes(network)} onChange={(event) => setNetworkFilter(network, event.target.checked)} className="accent-primary" />
                    {network}
                  </label>
                ))}
              </div>

              <div className="overflow-hidden rounded-xl bg-surface-raised">
  <img
    src={emeraldApeImage}
    alt="NFT em destaque: macaco colecionável com jaqueta verde"
    className="aspect-[3/4] w-full object-cover"
    loading="lazy"
  />

  <div className="p-4">
    <p className="text-sm font-bold text-primary">
      NFT EM DESTAQUE
    </p>

    <p className="mt-2 text-xs text-text-secondary">
      OFERTA LIMITADA
    </p>
  </div>
</div>
            </aside>

            {/* Grade de NFTs */}
            <div>
              <fieldset className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs lg:hidden">
                <legend className="mb-2 font-bold text-foreground">Filtrar por rede</legend>
                {['Ethereum', 'Polygon', 'Solana'].map((network) => (
                  <label key={network} className="flex items-center gap-2 text-text-secondary">
                    <input type="checkbox" aria-label={`${network} mobile`} checked={selectedNetworks.includes(network)} onChange={(event) => setNetworkFilter(network, event.target.checked)} className="accent-primary" />
                    {network}
                  </label>
                ))}
              </fieldset>
              {isError ? <div role="alert" className="rounded-xl border border-border bg-surface-card p-6 sm:col-span-3"><p>Não foi possível carregar o catálogo.</p><button type="button" onClick={() => void refetch()} className="mt-3 text-primary underline">Tentar novamente</button></div> : isLoading ? <div aria-label="Carregando catálogo" className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 md:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index}><div className="skeleton-shimmer aspect-square rounded-xl" /><div className="skeleton-shimmer mt-3 h-4 w-2/3 rounded" /><div className="skeleton-shimmer mt-2 h-4 w-1/3 rounded" /></div>)}</div> : <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 md:grid-cols-3">
  {filteredNFTs.map((nft) => (
    <NFTCard key={nft.id} nft={nft} />
  ))}
</div>}

{!isLoading && !isError && filteredNFTs.length === 0 && (
  <div className="col-span-full rounded-xl border border-border bg-surface-card px-6 py-12 text-center">
    <h3 className="text-base font-bold">
      Nenhum NFT encontrado
    </h3>

    <p className="mt-2 text-sm text-text-secondary">
      Não encontramos NFTs para esta combinação de filtros.
    </p>

    <button
      type="button"
      onClick={() => updateSearch({ q: '', category: 'Todas', tab: 'all', page: 1, min: 0, max: 3, sort: 'recent', networks: [] })}
      className="mt-5 rounded-md bg-primary px-5 py-3 text-xs font-bold text-ink transition hover:bg-primary-light"
    >
      Limpar filtros
    </button>
  </div>
)}

              <nav
                aria-label="Paginação dos NFTs"
                className="mt-10 hidden justify-end gap-2 sm:flex"
              >
                {activeTab === 'all' && Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    aria-current={page === currentPage ? 'page' : undefined}
                    onClick={() => updateSearch({ page }, false)}
                    className={`h-8 w-8 rounded border border-border text-xs ${
                      page === currentPage
                        ? 'bg-primary font-bold text-ink'
                        : 'text-foreground hover:bg-surface-raised'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  aria-label="Próxima página"
                  disabled={currentPage >= totalPages}
                  onClick={() => updateSearch({ page: currentPage + 1 }, false)}
                  className="h-8 w-8 rounded border border-border text-xs hover:bg-surface-raised"
                >
                  ›
                </button>
              </nav>
            </div>
          </div>
        </section>

        {/* Banners promocionais */}
<section
  id="creators"
  className="grid gap-5 py-10 md:grid-cols-2"
>
  {/* Banner: Lançamentos gênesis */}
  <article className="grid min-h-56 grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface-card sm:min-h-64">
    <div className="flex items-center justify-center overflow-hidden bg-surface-raised">
      <div className="min-h-56 overflow-hidden bg-surface-raised sm:min-h-64">
  <img
    src={ivoryBaronImage}
    alt="Obra digital da coleção de lançamentos Gênesis"
    className="h-full min-h-56 w-full object-cover sm:min-h-64"
    loading="lazy"
  />
</div>
      
    </div>

    <div className="flex flex-col items-start justify-center p-4 sm:p-6">
      <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
        Edição limitada
      </span>

      <h2 className="mt-3 text-sm font-bold leading-relaxed sm:text-lg">
        Lançamentos gênesis de edição limitada
      </h2>

      <p className="mt-3 text-[10px] leading-relaxed text-text-secondary sm:text-xs">
        Colecione edições escassas diretamente dos criadores.
      </p>

      <a
        href="#marketplace"
        className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-[10px] font-bold text-ink transition hover:bg-primary-light sm:text-xs"
      >
        Explorar coleção <span aria-hidden="true">→</span>
      </a>
    </div>
  </article>

  {/* Banner: Arte digital */}
  <article className="grid min-h-56 grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface-card sm:min-h-64">
    <div className="min-h-56 overflow-hidden bg-surface-raised sm:min-h-64">
  <img
    src={cosmicBloomImage}
    alt="Arte digital da coleção selecionada da Kurio"
    className="h-full min-h-56 w-full object-cover sm:min-h-64"
    loading="lazy"
  />
</div>

    <div className="flex flex-col items-start justify-center p-4 sm:p-6">
      <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
        Descubra
      </span>

      <h2 className="mt-3 text-sm font-bold leading-relaxed sm:text-lg">
        Arte digital selecionada e muito mais
      </h2>

      <p className="mt-3 text-[10px] leading-relaxed text-text-secondary sm:text-xs">
        Explore novos artistas, coleções verificadas e obras digitais.
      </p>

      <a
        href="#marketplace"
        className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-[10px] font-bold text-ink transition hover:bg-primary-light sm:text-xs"
      >
        Explorar NFTs <span aria-hidden="true">→</span>
      </a>
    </div>
  </article>
</section>

        {/* Diário da Cunhagem */}
        <section id="journal" className="py-12">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold sm:text-2xl">
              Diário da Cunhagem
            </h2>

            <p className="mt-3 text-xs text-text-secondary">
              Histórias, guias e insights sobre o universo da propriedade digital.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              'Como funciona a propriedade de NFTs',
              '10 artistas digitais para acompanhar',
              'Raridade, atributos e procedência',
              'Como proteger sua carteira',
            ].map((title) => (
              <article
                key={title}
                className="overflow-hidden rounded-lg bg-surface-card"
              >
                <div className="aspect-[4/3] overflow-hidden bg-surface-raised">
  <img
    src={
      title === 'Como funciona a propriedade de NFTs'
        ? emeraldApeImage
        : title === '10 artistas digitais para acompanhar'
          ? violetNomadImage
          : title === 'Raridade, atributos e procedência'
            ? goldenMinkImage
            : neonVesselImage
    }
    alt={`Capa do artigo: ${title}`}
    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
    loading="lazy"
  />
</div>

                <div className="p-3">
                  <p className="text-[9px] text-text-secondary">
                    12 de setembro · Leitura de 6 min
                  </p>

                  <h3 className="mt-2 text-xs font-bold leading-relaxed">
                    {title}
                  </h3>

                  <a
                    href="#journal"
                    className="mt-2 inline-block text-[10px] text-primary"
                  >
                    Ler mais →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Rodapé  */}
      
      <Footer />

      <MobileNavigation />
    </div>
  )
}

