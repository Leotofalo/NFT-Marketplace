import { api } from './api'

export interface CartValidationItem {
  nftId: string
  quantity: number
}

export interface CartValidationResult {
  valid: boolean
  items: Array<{
    nftId: string
    available: boolean
    price?: string
    quantity: number
    message?: string
  }>
}

export const cartService = {
  async validateItems(
    items: CartValidationItem[],
  ): Promise<CartValidationResult> {
    const response = await api.post<CartValidationResult>(
      '/cart/validate',
      { items },
    )

    return response.data
  },
}