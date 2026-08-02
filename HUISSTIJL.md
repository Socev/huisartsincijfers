# Huisstijl huisartsincijfers.nl

Alle ontwerpwaarden staan in `src/styles/tokens.css`. Wijzig ze daar; nergens
anders in de code staat een kleur of een maat hard gecodeerd.

## Uitgangspunt

De site moet lezen als een bronnenwerk, niet als een campagne. Rustige vlakken,
één accentkleur, en de data als enige element dat luid mag zijn. Wie de site
opent moet denken: dit is nagerekend — niet: hier wil iemand iets van mij.

## Kleur

| Rol | Licht | Donker | Gebruik |
|---|---|---|---|
| `--surface-0` | `#f6f6f4` | `#121211` | paginaachtergrond |
| `--surface-1` | `#fcfcfb` | `#1a1a19` | kaarten, panelen, grafiekvlak |
| `--surface-2` | `#eeeeea` | `#242422` | tabelkoppen, ingedrukte knoppen |
| `--text-primary` | `#141413` | `#ffffff` | kopteksten en waarden |
| `--text-secondary` | `#52514e` | `#c3c2b7` | lopende tekst en labels |
| `--text-muted` | `#7c7a73` | `#94938a` | bronvermelding, assen |
| `--accent` | `#1c4f8f` | `#7fb2f0` | links, actieve navigatie |
| `--signal` | `#eda100` | `#c98500` | let-op-blokken, status "afgeleid" |

De donkere modus is apart gekozen, geen automatische omkering: dezelfde tinten
zijn opnieuw gestapt tegen een donker vlak.

## Datareeksen

`--series-1` tot en met `--series-8`, in vaste volgorde, nooit gecycled.

1 blauw · 2 oranje · 3 aqua · 4 geel · 5 magenta · 6 groen · 7 violet · 8 rood

Regels:

- Kleur volgt de entiteit, nooit de rangorde. Een filter dat reeksen weglaat
  mag de overgebleven reeksen niet herkleuren.
- Bij twee of meer reeksen is er altijd een legenda. Bij één reeks niet — de
  titel zegt al wat er staat.
- Tekst draagt nooit een reekskleur. Waarden en labels staan in de inkttinten;
  identiteit komt van het gekleurde blokje ernaast.
- Bij spreidingsvormen (puntenwolk, kaart) maximaal drie reeksen; daarboven
  samenvoegen tot "overig" of opsplitsen in kleine veelvouden.
- Nooit twee y-assen.

## Maatvoering van grafieken

- Staven maximaal 24 pixels dik, afgeronde datakant van 4 pixels.
- Lijnen 2 pixels, eindpunt met een markering van minimaal 8 pixels met een
  ring in de vlakkleur.
- Tussen aanrakende segmenten een gat van 2 pixels in de vlakkleur, nooit een
  rand om het segment.
- Rasterlijnen zijn haarlijnen in `--line`, altijd doorgetrokken, nooit gestreept.
- Labels spaarzaam: het eindpunt of het uiterste, niet elk punt.
- Een waardelabel staat alleen ín een segment als het comfortabel past.
  Anders draagt de legenda of de tabelweergave het.
- Elke grafiek heeft een tabelweergave achter "Toon als tabel".

## Typografie

Systeemletters, geen webfont. Dat scheelt een externe aanvraag, voorkomt
verspringende tekst en houdt de belofte dat de site niets bij derden ophaalt.

Alle getallen krijgen `font-variant-numeric: tabular-nums`, zodat kolommen
uitlijnen. Nederlandse notatie overal: punt als duizendscheiding, komma als
decimaalteken. Dat loopt via `src/lib/format.mjs` — schrijf nooit zelf een
getal in een pagina.

## Logo

Vier staven, oplopend. De vierde blijft achter bij de trend en staat in de
accentkleur, met de veronderstelde hoogte er licht achter. Dat is de hele
boodschap van de site in één beeldmerk.

Bestanden: `src/assets/logo.svg` (met woordmerk), `logo-mark.svg` (alleen het
beeldmerk), `favicon.svg` (op donkere achtergrond, voor het tabblad). In de
kop staat het beeldmerk inline zodat het meekleurt met het thema.

## Statusaanduiding

| Aanduiding | Betekenis |
|---|---|
| `definitief` | staat letterlijk in de bron, op de genoemde plaats |
| `afgeleid` | door ons berekend; de rekenstap staat erbij |
| `schatting` | extrapolatie of aanname; draagt nooit alleen een conclusie |

Afgeleide en geschatte cijfers krijgen een zichtbaar label. Dat is geen
slag om de arm maar de kern van de methode.

## Toon

Nederlands, geen jargon zonder uitleg, geen uitroeptekens. Cijfers spreken;
de tekst wijst alleen aan waar je moet kijken. Waar iets onzeker is, staat dat
er — juist dat maakt de rest geloofwaardig.
