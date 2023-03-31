import { BaseDotsamaWallet } from '../base-dotsama-wallet';
import logo from './MantajsLogo.svg';

export class MantaWallet extends BaseDotsamaWallet {
  extensionName = 'manta-wallet-js';
  title = 'Manta.js';
  noExtensionMessage =
    'You can use any Manta compatible wallet but we recommend using Talisman';
  installUrl ='https://chrome.google.com/webstore/detail/manta-walletstaging/ojfnheclkhcophocgofibdgofgijnfck'
  logo = {
    src: logo,
    alt: 'MantaWallet Logo',
  };
}
