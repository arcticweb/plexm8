/**
 * Plex Collections API Client
 * Handles collection operations (add items, delete items, reorder)
 */
import { PlexApiClient, ApiClientConfig } from './base';
import { Collection } from './types';
/**
 * Collections API operations
 */
export declare class CollectionsApi extends PlexApiClient {
    constructor(config: ApiClientConfig);
    /**
     * Get all collections for a library section
     */
    getCollections(librarySectionId: number): Promise<Collection[]>;
    /**
     * Add items to a collection
     * @param collectionId - Collection ID
     * @param uri - URI of items to add (e.g., library://metadata/123,456)
     */
    addItemsToCollection(collectionId: number, uri: string): Promise<Collection>;
    /**
     * Delete an item from a collection
     */
    deleteItemFromCollection(collectionId: number, itemId: number): Promise<Collection>;
    /**
     * Reorder items in a collection
     * @param collectionId - Collection ID
     * @param itemId - Item to move
     * @param afterItemId - Optional: Move after this item; if not provided, moves to beginning
     */
    reorderItem(collectionId: number, itemId: number, afterItemId?: number): Promise<Collection>;
}
/**
 * Factory function to create Collections API instance
 */
export declare function createCollectionsApi(config: ApiClientConfig): CollectionsApi;
//# sourceMappingURL=collections.d.ts.map