# huisartsincijfers.nl

Openbare brondata over de bekostiging van de Nederlandse huisartsenzorg,
bij elkaar gebracht en doorgerekend. Elk cijfer op de site is herleidbaar tot
een gepubliceerde bron; eigen bewerkingen staan gemarkeerd met de rekenstap erbij.

## Opzet

Statische site, gegenereerd door een build-script van ongeveer honderd regels
zonder afhankelijkheden. Geen framework, geen runtime aan de serverkant. Dat is
een bewuste keuze: een site die het van betrouwbaarheid moet hebben, moet over
vijf jaar nog te bouwen zijn.

```
src/
  data/       de datalaag — elk cijfer met bron, vindplaats en status
  lib/        opmaak, bouwstenen, nummerformattering
  pages/      één bestand per pagina; stelt alleen samen
  styles/     tokens.css bevat alle ontwerpwaarden
  assets/     logo, favicon, browserscripts
build.mjs     genereert dist/
```

## Werken aan de site

```bash
npm install      # alleen wrangler, voor het publiceren
npm run build    # bouwt dist/
npm run dev      # bouwt en serveert op http://localhost:8788
npm run deploy   # bouwt en publiceert naar Cloudflare
```

## De datalaag

Pagina's schrijven nooit zelf een getal op. Ze halen het op met `w('nac','nac_2026')`
en de bronvermelding rolt er automatisch bij. Wordt een bron bijgewerkt, dan
wijzigt één JSON-bestand en loopt de hele site mee — inclusief de bronnenpagina,
die zichzelf uit die laag opbouwt.

Elke parameter heeft een status:

- `definitief` — staat letterlijk in de bron
- `afgeleid` — door ons berekend, rekenstap in het veld `vindplaats`
- `schatting` — extrapolatie of aanname

## Vormgeving

Zie [HUISSTIJL.md](HUISSTIJL.md). Alle ontwerpwaarden staan in
`src/styles/tokens.css`; wijzig ze daar en de hele site volgt.

## Publiceren

Cloudflare Workers met statische assets. `wrangler.jsonc` wijst naar `dist/`.
Er is geen Worker-script: Cloudflare serveert alleen bestanden, dus er kan aan
de serverkant niets stukgaan.
