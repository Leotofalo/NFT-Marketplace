import { api } from './api'
import type { NFT } from '../features/nft/nftData'

export interface NFTListParams {
  q?: string
  category?: string
  min?: number
  max?: number
  sort?: 'recent' | 'price-low' | 'price-high'
  page?: number
  pageSize?: number
  networks?: string[]
}

export interface NFTListResponse {
  items: NFT[]
  total: number
  page: number
  pageSize: number
}

export const nftService = {
  async getAll(params: NFTListParams = {}): Promise<NFTListResponse> {
    const { networks, ...query } = params
    const response = await api.get<NFTListResponse>('/nfts', { params: { ...query, networks: networks?.join(',') } })
    return response.data
  },

  async getById(nftId: string): Promise<NFT> {
    const response = await api.get<NFT>(
      `/nfts/${encodeURIComponent(nftId)}`,
    )

    return response.data
  },
}
