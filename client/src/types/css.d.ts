import * as CSS from 'csstype';

declare module 'csstype' {
  interface Properties {
    // Add custom CSS properties
    '--x'?: string;
    '--y'?: string;
  }
}