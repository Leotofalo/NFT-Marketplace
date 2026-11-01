import { useQuery } from '@tanstack/react-query'
import { nftService } from '../../services/nftService'
import type { NFTListParams } from '../../services/nftService'

export function useNFTs(params: NFTListParams = { pageSize: 24 }) {
  return useQuery({
    queryKey: ['nfts', params],
    queryFn: () => nftService.getAll(params),
  })
}

export function useNFT(nftId: string) {
  return useQuery({
    queryKey: ['nfts', nftId],
    queryFn: () => nftService.getById(nftId),
    enabled: Boolean(nftId),
  })
}
