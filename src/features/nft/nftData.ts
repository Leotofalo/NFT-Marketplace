import cosmicBloomImage from '../../assets/images/cosmic-bloom.png'
import sageNomadImage from '../../assets/images/sage-nomad.png'
import violetNomadImage from '../../assets/images/violet-nomad.png'
import emeraldApeImage from '../../assets/images/emerald-ape.png'
import goldenBeatImage from '../../assets/images/golden-beat.png'
import goldenMinkImage from '../../assets/images/golden-mink.png'
import goldenSignalImage from '../../assets/images/golden-signal.png'
import ivoryBaronImage from '../../assets/images/ivory-baron.png'
import neonVesselImage from '../../assets/images/neon-vessel.png'

export interface NFT {
  id: string
  name: string
  price: string
  image: string
  category: string
  network: 'Ethereum' | 'Polygon' | 'Solana'
  featured?: boolean
  available?: boolean
  version?: number
}

export const nftData: NFT[] = [
  {
    id: 'emerald-ape-042',
    name: 'Emerald Ape #042',
    price: '1.19 ETH',
    image: emeraldApeImage,
    category: 'Arte digital',
    network: 'Ethereum',
    featured: true,
  },
  {
    id: 'sage-nomad-009',
    name: 'Sage Nomad #009',
    price: '1.69 ETH',
    image: sageNomadImage,
    category: 'Colecionáveis',
    network: 'Ethereum',
  },
  {
    id: 'neon-vessel-552',
    name: 'Neon Vessel #552',
    price: '1.99 ETH',
    image: neonVesselImage,
    category: 'Arte digital',
    network: 'Polygon',
  },
  {
    id: 'cosmic-bloom-118',
    name: 'Cosmic Bloom #118',
    price: '1.29 ETH',
    image: cosmicBloomImage,
    category: 'Generativa',
    network: 'Ethereum',
  },
  {
    id: 'violet-nomad-314',
    name: 'Violet Nomad #314',
    price: '1.39 ETH',
    image: violetNomadImage,
    category: 'Colecionáveis',
    network: 'Solana',
  },
  {
    id: 'ivory-baron-088',
    name: 'Ivory Baron #088',
    price: '1.79 ETH',
    image: ivoryBaronImage,
    category: 'Arte digital',
    network: 'Polygon',
  },
  {
    id: 'golden-beat-207',
    name: 'Golden Beat #207',
    price: '0.99 ETH',
    image: goldenBeatImage,
    category: 'Música',
    network: 'Ethereum',
  },
   {
    id: 'golden-mink-209',
    name: 'Golden Mink #209',
    price: '0.99 ETH',
    image: goldenMinkImage,
    category: 'Música',
    network: 'Solana',
  },
  {
    id: 'golden-signal-160',
    name: 'Golden Signal #160',
    price: '0.39 ETH',
    image: goldenSignalImage,
    category: 'Música',
    network: 'Polygon',
  },
  {
    id: 'neon-vessel-884',
    name: 'Neon Vessel #884',
    price: '0.79 ETH',
    image: neonVesselImage,
    category: 'Arte digital',
    network: 'Polygon',
  },
  {
    id: 'cosmic-bloom-204',
    name: 'Cosmic Bloom #204',
    price: '0.89 ETH',
    image: cosmicBloomImage,
    category: 'Generativa',
    network: 'Polygon',
  },
  {
    id: 'violet-nomad-681',
    name: 'Violet Nomad #681',
    price: '1.09 ETH',
    image: violetNomadImage,
    category: 'Colecionáveis',
    network: 'Solana',
  },
  {
    id: 'golden-beat-318',
    name: 'Golden Beat #318',
    price: '0.69 ETH',
    image: goldenBeatImage,
    category: 'Música',
    network: 'Solana',
  },
]
