import { pagina } from '../lib/layout.mjs';
export default function () {
  return { pad:'/404', html: pagina({
    pad:'/404', titel:'Pagina niet gevonden', h1:'Deze pagina bestaat niet',
    lede:`Mogelijk is de pagina verplaatst. Begin bij de <a href="/">kerncijfers</a> of bekijk
      <a href="/bronnen/">alle bronnen en parameters</a>.`, body:'' })};
}
