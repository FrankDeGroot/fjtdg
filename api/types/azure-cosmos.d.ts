declare module "@azure/cosmos" {
  export type SqlParameter = {
    name: string;
    value: unknown;
  };

  export type SqlQuerySpec = {
    query: string;
    parameters?: SqlParameter[];
  };

  export interface QueryIterator<T> {
    fetchAll(): Promise<{ resources: T[] }>;
  }

  export interface ItemDefinition {
    [key: string]: unknown;
  }

  export interface Items {
    query<T extends ItemDefinition = ItemDefinition>(querySpec: SqlQuerySpec): QueryIterator<T>;
  }

  export interface Container {
    items: Items;
  }

  export interface Database {
    container(id: string): Container;
  }

  export class CosmosClient {
    constructor(options: { endpoint: string; key: string });
    database(id: string): Database;
  }
}
