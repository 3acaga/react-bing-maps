import "bingmaps/types/MicrosoftMaps/Microsoft.Maps.All";

declare global {
  interface Window extends Window {
    Microsoft: typeof Microsoft;
    __initBingmaps__: () => void;
  }
}
