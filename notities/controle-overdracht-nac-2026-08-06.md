# Controle van de overdracht "analyse nac en tarieven"

Nagerekend op 6 augustus 2026 tegen de Eindrapportage (274 bladzijden pdf) en tegen de
datalaag van de site. Er is nog **niets** aan de pagina's veranderd.

**Embargo blijft staan.** Alles wat uit de microdata komt heet op de site
"de onderliggende gegevens van het kostprijsonderzoek". Nooit "de 301 praktijken",
en ook geen aantallen records (613, 320, 287) zonder die formulering erbij.

---

## A. Wat er klopt

### De twee kerngetallen, letterlijk

Beide staan in het hoofdrapport (§4.3, blz. 33-34) én in bijlage 6 (blz. 46-47),
in vrijwel identieke bewoordingen. De twee citaten in de overdracht zijn correct
overgenomen, inclusief de plaatsing van het beletselteken.

- "Het is ten behoeve van het berekenen en vaststellen van de tarieven een puur
  beleidsmatige keuze van de NZa geweest…" — **blz. 46**, klopt.
- "Uit het kostprijsonderzoek blijkt dat voltijd werkende praktijkhouders gemiddeld
  2.357,7 uur per jaar werken (…). In de kostprijzen is al een volledige nac ingerekend
  voor iedere 2.125,4 gewerkte uren per jaar." — **blz. 47**, klopt.

Omrekening naar weken klopt ook: 2.125,4 ÷ 46 = 46,2 en 2.357,7 ÷ 46 = 51,3.
De NZa noemt die twee weekcijfers zelf op blz. 33-34.

### De schoningspercentages

Tabel 5 van de Eindrapportage (blz. 35), kolom arbeidskosten:

| | € per praktijk | aandeel van € 238.845 |
|---|---:|---:|
| Arbeidskosten totaal | 238.845 | 100% |
| correctie poh-ggz (buiten scope) | −4.491 | **1,88%** |
| schoning buiten 100% | −21.392 | **8,96%** |
| Totaal binnen 100% | 212.962 | **89,16%** |

De 10,84% en de 89,16% uit de overdracht komen exact uit deze tabel. Ze staan al zo
in `nac.json` op de site.

### De keten en de landelijke vertaling

Alles reproduceert tot op de decimaal met wat `metrics.mjs` al doet:
6.603,6 → 5.887,8 → 4.380,5 nac; 14,04 miljoen uur uitvraag tegenover 18,41 miljoen
uur Nivel; **dekking 76,2%**. Ook 2.125,4 ÷ 0,8916 = **2.383,8** klopt, en de
bedragen per uur bij nac-2026 van € 219.479 (€ 132,54 / € 103,26 / € 93,09 / € 92,07
/ € 68,50) kloppen alle vijf.

### De functiewaardering

De hele scoretabel is uit de lopende tekst van de Berenschot-bijlage te reconstrueren
en klopt kolom voor kolom: 60/42, 21, 3, 96/78, 102/90, 78/51, 10, 4 → **350 / 285 / 374**.
De NZa schrijft zelf: "een totaalscore van 24 USB punten op het gezichtspunt
leidinggeven vanuit het praktijkhouderschap". 24 ÷ 374 = **6,4%**.
Dit staat al op `/nac/`; de overdracht voegt hier niets nieuws toe.

Eén terminologiepuntje: het achtste gezichtspunt heet bij Berenschot **inconveniënten**,
niet "persoonlijk risico".

---

## B. Drie dingen die moeten worden gecorrigeerd

### 1. De "niet-openbare PowerPoint" zit in dit pdf-bestand

De overdracht zegt over slides 27 en 29: *"die zijn niet openbaar. Concrete vraag om
te stellen."* Dat klopt niet meer. De **Technische bijlage — Normatieve
arbeidskostencomponent, 27 maart 2026** (bijlage 7) is integraal meegebonden,
op **pdf-bladzijden 242 tot en met 273**. Slide 27 staat op pdf-blz. 268,
slide 29 op 270, slide 30 op 271.

Openstaande vraag 3 uit de overdracht kan daarmee vervallen — en, belangrijker,
er staat materiaal op die slides dat de zaak *sterker* maakt (zie C).

### 2. "÷ 74,4%" in de urentabel is een verkeerd etiket

De regel "Per nac die door NZa-maximumtarieven wordt gedekt (÷ 74,4%) → 3.204,0" klopt
als getal maar niet als beschrijving. 2.125,4 ÷ 0,744 = 2.856,7. Het getal 3.204,0
ontstaat pas door **beide** stappen: 2.125,4 ÷ (0,8916 × 0,744) = 2.125,4 ÷ 0,6634 = 3.204,0.
Zo staat het ook in de landelijke vertaling, waar 4.380,5 wél cumulatief is berekend.
Op de site moet er dus "÷ 66,3%" staan, of "na beide stappen".

Zijstapje: de Eindrapportage noemt in Tabel 6 **74,5%** tariefgereguleerd; de site
gebruikt 0,744 uit Tabel 34 van het Verantwoordingsdocument. Verschil 0,1 procentpunt,
niet materieel, maar het verdient één zin in de bronvermelding.

### 3. De uurreeks in §5 mag niet worden overgenomen

Die tabel is **inclusief** de dienst op de post en gebruikt de oude
praktijkhouders-vintage (7.860 in 2018, hoort bij 2013). De site is sinds de
audit netto en gebruikt de herziene Nivel-registratie:

| | overdracht §5 (bruto) | overdracht, variant excl. | site nu |
|---|---:|---:|---:|
| 2024 | € 73,71 | € 77,32 | **€ 77,43** |
| 2025 | € 61,70 | € 64,72 | **€ 64,75** |
| knik | −16,3% | −16,3% | **−16,4%** |
| reëel 2025 t.o.v. 2018 | −22,9% | — | **−23,0%** |

De conclusies zijn identiek; alleen de getallen wijken 0,1 tot 0,2% af. Neem de
site-reeks, niet die uit de overdracht.

---

## C. Wat de gepubliceerde slides toevoegen — dit is de winst

### De reconstructiemethode staat gewoon in de bijlage

Het fictieve rekenvoorbeeld (slides 5-11, pdf-blz. 246-252) bevestigt letterlijk twee
stappen die de overdracht als "uitgeprobeerd over zestien varianten" presenteert:

- **uren per jaar = uren/week × weken/jaar, zonder aftopping.** 42×10 = 420; 48×47 = 2.256.
- **fte = min(uren/36; 1) × min(weken/46; 1).** 42 uur en 10 weken → 0,22 fte;
  18 uur en 40 weken → 0,43 fte. Beide reproduceren exact.

De reconstructie is dus geen gok meer. Dat is prettig om te kunnen schrijven.

### Het aantal voltijders is nu een gepubliceerd getal

Uit de subpopulatie-uren op blz. 46 gedeeld door de uren-per-nac op slide 29:

| Subpopulatie | uren voltijders | uren per nac | **voltijders** |
|---|---:|---:|---:|
| Klein | 76.202,6 | 2.381,3 | **32,0** |
| Middelgroot | 169.855,9 | 2.392,3 | **71,0** |
| Groot | 219.331,8 | 2.193,3 | **100** (staat op slide 27) |
| Samen | 465.390,3 | | **203,0** |

Drie ronde getallen uit een deling — de afleiding is goed. **De NZa heeft 203
praktijkhouders als voltijd werkend aangemerkt.** In dezelfde gegevens voldoen er 287
aan het criterium dat zij zelf noemt (≥ 36 uur per week én ≥ 46 weken per jaar).

Dat is een veel scherpere formulering van de openstaande vraag dan "hun definitie is
enger en staat op een geheime slide". De vraag wordt: **welk deel van de praktijkhouders
die aan uw eigen criterium voldoen is buiten de groep voltijders gehouden, en waarom?**

Voorbehoud dat erbij hoort: welke uren je meetelt (met of zonder apotheek) verschuift
het getal 287. De 203 is hard, de 287 is een reconstructie.

### Voor subpopulatie groot ligt de hele verdeling er

Slide 27 en 28 (pdf-blz. 268-269) geven per kwart van de voltijders en per zesde van
de deeltijders de uren en de toegerekende nac. Daaruit volgt rechtstreeks:

- **31%** van de praktijkhouders in de grootste praktijken is voltijd (100 van 320).
- Voltijders: 219.331,8 uur op 100 nac → **2.193,3 uur per nac**.
- Deeltijders: 352.062,7 uur op 182,5 nac → **1.929,1 uur per nac**.
- Bovenste kwart van de voltijders: **2.758,5 uur per nac**. Onderste kwart: 1.790,8.

Dat laatste is de aftopping in één regel: binnen dezelfde groep "voltijd" krijgt de
zwaarste kwart per gewerkt uur **35% minder nac** dan de lichtste kwart. Dit is
precies waar het CBb over sprak, en het staat in de bijlage waarmee de NZa dat
bezwaar meent te weerleggen.

---

## D. Eén punt waar ik de overdracht zou afzwakken

De overdracht schrijft: *"De uitkomst draait om."* Dat is een halve stap te ver.

Beide getallen van de NZa — 2.125,4 en 2.357,7 — staan op dezelfde ongeschoonde basis.
Binnen bijlage 6 is de vergelijking dus intern consistent, en het rekenwerk klopt
(dat stelt de overdracht zelf ook vast). De 2.383,8 ontstaat door één kant van de
vergelijking wél te schonen en de andere niet. Dat is een geldige en belangrijke
vraag, maar het is een *andere* vraag dan die de NZa beantwoordt.

Eerlijker en sterker geformuleerd:

> Bijlage 6 beantwoordt de vraag *"krijgt elk gewerkt uur een deel van een nac
> toegerekend?"* Het antwoord daarop is ja. Zij beantwoordt niet de vraag *"hoeveel
> nac blijft er per gewerkt uur in de tarieven over?"* Dat is 2.383,8 uur per nac die
> na schoning binnen de 100% overblijft, en 3.204,0 uur per nac die door een
> maximumtarief wordt gedekt. Het verschil is geen rekenfout maar een verschil in
> vraagstelling — en het is dezelfde asymmetrie als elders op deze site: geschoond
> op omzet, niet op uren.

Zo blijft de bewering houdbaar als de NZa antwoordt.

---

## E. Voorstel voor plaatsing — jij beslist

Niets hiervan is uitgevoerd.

| # | Bevinding | Voorstel | Omvang |
|---|---|---|---|
| 1 | Vierde staaf "2.383,8 uur per nac binnen de 100%" en vijfde "3.204,0 gedekt door een maximumtarief" | `/nac/#uren`, in de bestaande `compareBars` | klein |
| 2 | De herformulering uit D, als `callout` onder die grafiek | `/nac/#uren` | klein |
| 3 | 76,2% dekking van de uitvraag, landelijk | `/uren/`, naast het bestaande 53,1 ↔ 46,2 blok | middel |
| 4 | 203 aangemerkte voltijders, en de deling die daartoe leidt | nieuwe sectie `/nac/#voltijders` óf `/arbeidskosten/#schoning` | middel |
| 5 | Subpopulatie groot: 2.758,5 tegenover 1.790,8 uur per nac binnen dezelfde voltijdgroep | `/uren/`, bij de aftopping — dit is het sterkste losse cijfer | middel |
| 6 | Anw-uurtarieven 2026 en de eenrichtingskoppeling nac ↔ anw | `/tarieven/`, nieuwe sectie | middel |
| 7 | 18,3% van de opgegeven uren boven de cap; 30% werkt meer dan 46,2 uur | `/uren/` — **embargo-formulering verplicht** | klein |
| 8 | Zes openstaande vragen, nu vijf | `/over/` of een nieuwe pagina `/vragen/` | groot |
| 9 | Bijlage 7 als vindplaats opnemen (pdf-blz. 242-273) | `/bronnen/` | klein |

Mijn voorkeur als je wilt beginnen: **1, 2, 5 en 9**. Dat zijn vier ingrepen op twee
pagina's, ze steunen alle vier op openbaar materiaal zonder embargo, en punt 5 is het
enige cijfer in dit hele dossier dat de aftopping laat zien met de eigen tabel van de NZa.

Punt 7 zou ik pas doen als je zeker weet hoe je die zin wilt hebben staan.
