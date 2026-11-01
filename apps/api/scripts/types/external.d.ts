declare module 'pg-copy-streams' {
  import type { Readable, Writable } from 'node:stream';
  import type { Submittable } from 'pg';

  export function from(query: string): Writable & Submittable;
  export function to(query: string): Readable & Submittable;
}

declare module 'unzipper' {
  import type { Readable } from 'node:stream';

  export interface Entry {
    path: string;
    type: string;
    uncompressedSize: number;
    stream(): Readable;
  }

  export interface Directory {
    files: Entry[];
  }

  const unzipper: {
    Open: {
      file(path: string): Promise<Directory>;
    };
  };

  export default unzipper;
}
