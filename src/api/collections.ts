/**
 * Plex Collections API Client
 * Handles collection operations (add items, delete items, reorder)
 */

import { PlexApiClient, ApiClientConfig } from './base';
import { Collection, MediaContainer } from './types';

/**
 * Collections API operations
 */
export class CollectionsApi extends PlexApiClient {
  constructor(config: ApiClientConfig) {
    super(config);
  }

  /**
   * Get all collections for a library section
   */
  async getCollections(librarySectionId: number): Promise<Collection[]> {
    const response = await this.get<MediaContainer<Collection>>(
      `/library/sections/${librarySectionId}/collections`
    );

    return response.Metadata || [];
  }

  /**
   * Add items to a collection
   * @param collectionId - Collection ID
   * @param uri - URI of items to add (e.g., library://metadata/123,456)
   */
  async addItemsToCollection(
    collectionId: number,
    uri: string
  ): Promise<Collection> {
    const queryString = this.buildQueryString({ uri });
    const response = await this.put<MediaContainer<Collection>>(
      `/library/collections/${collectionId}/items${queryString}`,
      null
    );

    const collections = response.Metadata || [];
    return collections[0];
  }

  /**
   * Delete an item from a collection
   */
  async deleteItemFromCollection(
    collectionId: number,
    itemId: number
  ): Promise<Collection> {
    const response = await this.delete<MediaContainer<Collection>>(
      `/library/collections/${collectionId}/items/${itemId}`
    );

    const collections = response.Metadata || [];
    return collections[0];
  }

  /**
   * Reorder items in a collection
   * @param collectionId - Collection ID
   * @param itemId - Item to move
   * @param afterItemId - Optional: Move after this item; if not provided, moves to beginning
   */
  async reorderItem(
    collectionId: number,
    itemId: number,
    afterItemId?: number
  ): Promise<Collection> {
    const params: any = {};

    if (afterItemId !== undefined) {
      params.after = afterItemId;
    }

    const queryString = this.buildQueryString(params);
    const response = await this.put<MediaContainer<Collection>>(
      `/library/collections/${collectionId}/items/${itemId}${queryString}`,
      null
    );

    const collections = response.Metadata || [];
    return collections[0];
  }
}

/**
 * Factory function to create Collections API instance
 */
export function createCollectionsApi(
  config: ApiClientConfig
): CollectionsApi {
  return new CollectionsApi(config);
}
