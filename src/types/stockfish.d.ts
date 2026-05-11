declare module 'stockfish.js' {
  export interface StockfishInstance {
    postMessage(msg: string): void
    addMessageListener(listener: (msg: string) => void): void
    removeMessageListener(listener: (msg: string) => void): void
  }
  export interface StockfishModule {
    (): StockfishInstance
  }
  const Stockfish: StockfishModule
  export default Stockfish
}
