import { useState } from 'react'
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaLinkedinIn,
  FaYoutube,
} from 'react-icons/fa6'

const benefits = [
  {
    icon: 'W',
    title: 'Segurança da carteira',
    description:
      'Proteja sua carteira e colecione arte digital verificada com confiança.',
  },
  {
    icon: 'C',
    title: 'Criadores em destaque',
    description:
      'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    icon: 'D',
    title: 'Alertas de lançamentos',
    description:
      'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
  },
]

const profileLinks = [
  'Meu perfil',
  'Minha coleção',
  'Atividade',
  'Estúdio do criador',
  'Lista de interesse',
]

const helpLinks = [
  'Central de ajuda',
  'Como comprar NFTs',
  'Carteira e segurança',
  'Política do mercado',
  'Denunciar item',
]

const collectionLinks = [
  'Arte digital',
  'Fotografia',
  'Música',
  'Arte 3D',
  'Utilidade',
]

const socialLinks = [
  { label: 'Facebook', icon: FaFacebookF },
  { label: 'Instagram', icon: FaInstagram },
  { label: 'X', icon: FaXTwitter },
  { label: 'LinkedIn', icon: FaLinkedinIn },
  { label: 'YouTube', icon: FaYoutube },
]

const footerRoutes: Record<string, string> = {
  'Meu perfil': '/profile',
  'Minha coleção': '/wallets',
  'Lista de interesse': '/favorites',
  'Arte digital': '/?category=Arte%20digital',
  'Música': '/?category=M%C3%BAsica',
}

export function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim()) return

    setSubscribed(true)
  }

  return (
    <footer className="mt-8 bg-[#24150F] text-[#F5F1EB]">
      {/* Benefícios e inscrição */}
      <div className="border-b border-[#55321F]">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-7 sm:px-8 lg:grid-cols-4 lg:gap-0">
          {benefits.map((benefit, index) => (
            <article
              key={benefit.title}
              className={`${
                index > 0
                  ? 'lg:border-l lg:border-[#80502F] lg:pl-6'
                  : ''
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D28A4C] text-xl font-bold text-[#140D0A]">
                {benefit.icon}
              </div>

              <h2 className="mt-3 text-sm font-bold">
                {benefit.title}
              </h2>

              <p className="mt-2 max-w-xs text-xs leading-relaxed text-[#CFB28C]">
                {benefit.description}
              </p>
            </article>
          ))}

          {/* Newsletter */}
          <div className="lg:border-l lg:border-[#80502F] lg:pl-6">
            <h2 className="max-w-xs text-sm font-bold leading-tight">
              Antecipe-se ao próximo lançamento
            </h2>

            <form
              onSubmit={handleSubscribe}
              className="mt-3 flex overflow-hidden rounded"
            >
              <label htmlFor="footer-email" className="sr-only">
                Seu e-mail
              </label>

              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setSubscribed(false)
                }}
                placeholder="digite seu e-mail..."
                required
                className="min-w-0 flex-1 bg-[#402817] px-3 py-2 text-xs text-[#F5F1EB] outline-none placeholder:text-[#B39463] focus:ring-1 focus:ring-[#D28A4C]"
              />

              <button
                type="submit"
                className="bg-[#D28A4C] px-3 py-2 text-xs font-bold text-[#140D0A] transition hover:bg-[#DD9A5F]"
              >
                Enviar
              </button>
            </form>

            <p className="mt-3 text-[10px] leading-relaxed text-[#CFB28C]">
              {subscribed
                ? 'E-mail registrado nesta demonstração!'
                : 'Receba lançamentos selecionados, histórias de criadores e novidades do mercado.'}
            </p>
          </div>
        </div>
      </div>

      {/* Informações institucionais */}
      <div className="bg-[#38220F]">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-5 text-xs sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:items-center">
          <a
            href="/"
            className="font-bold tracking-widest"
            aria-label="Kurio, página inicial"
          >
            KURIO
          </a>

          <p className="max-w-xs leading-relaxed">
            Feito para colecionadores, criadores e cultura digital
          </p>

          <a
            href="mailto:contato@email.com"
            className="transition hover:text-[#D28A4C]"
          >
            contato@email.com
          </a>

          <a
            href="tel:+551140028922"
            className="transition hover:text-[#D28A4C]"
          >
            +55 11 4002 8922
          </a>
        </div>
      </div>

      {/* Links do rodapé */}
      <div>
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-7 sm:px-8 sm:grid-cols-2 lg:grid-cols-4">
          <FooterLinkColumn title="Meu perfil" links={profileLinks} />

          <FooterLinkColumn title="Central de ajuda" links={helpLinks} />

          <FooterLinkColumn title="Coleções" links={collectionLinks} />

          <div>
            <h2 className="text-sm font-bold">Redes sociais</h2>

            <div className="mt-3 flex flex-wrap gap-1.5">
  {socialLinks.map((social) => {
    const Icon = social.icon

    return (
              <span
        key={social.label}
        aria-label={social.label}
        title={social.label}
                role="img"
                className="flex h-7 w-7 items-center justify-center rounded border border-[#A66A38] text-[#D28A4C]"
      >
        <Icon size={15} aria-hidden="true" />
              </span>
    )
  })}
</div>

            <h3 className="mt-6 text-sm font-bold">
              Carteiras compatíveis
            </h3>

            <div className="mt-3 flex flex-wrap gap-2 text-[8px] font-bold text-[#D28A4C]">
              <span className="rounded bg-[#402817] px-2 py-1">
                METAMASK
              </span>

              <span className="rounded bg-[#402817] px-2 py-1">
                WALLETCONNECT
              </span>

              <span className="rounded bg-[#402817] px-2 py-1">
                COINBASE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-[#140D0A] px-4 py-3 text-center">
        <p className="text-[10px] tracking-wide text-[#D6C9BD]">
          © 2026 Kurio. Propriedade digital para todos.
        </p>
      </div>
    </footer>
  )
}

interface FooterLinkColumnProps {
  title: string
  links: string[]
}

function FooterLinkColumn({ title, links }: FooterLinkColumnProps) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-bold">{title}</h2>

      <ul className="mt-2 space-y-2">
        {links.map((link) => (
          <li key={link}>
            {footerRoutes[link] ? (
              <a href={footerRoutes[link]} className="text-xs text-[#E0D5CB] transition hover:text-[#D28A4C]">
                {link}
              </a>
            ) : (
              <span className="text-xs text-[#E0D5CB]">{link}</span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
