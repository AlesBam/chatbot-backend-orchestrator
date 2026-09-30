# Chatbot Backend Orchestrator

Backend pro simulovaného chatbota. Přijímá POST requesty s textem zprávy a session ID,
detekuje intent (bez ML – regex pattern matching), zavolá odpovídající API/logiku,
ošetří chyby (timeout, 5xx) a vrátí odpověď. Session state (kontext konverzace) se
drží v paměti procesu.

Učební projekt – cílem je projít si návrh intent routeru, multi-turn session state
a fallback handling na vlastní kůži, ne postavit produkční systém.

## Spuštění

```bash
npm install
cp .env.example .env
npm start
```

Server naslouchá na `http://localhost:3000` (port lze změnit přes `PORT` v `.env`).

## API

### `POST /message`

Request:

```json
{ "sessionId": "abc123", "message": "jaké je počasí v Praze?" }
```

Response:

```json
{ "reply": "Praha: jasno, 13.4 °C, vítr 2.8 km/h." }
```

Validační chyby (`400`):

```json
{ "error": { "code": "MISSING_SESSION_ID", "message": "sessionId is required" } }
```

Možné kódy: `MISSING_SESSION_ID`, `MISSING_MESSAGE`, `MESSAGE_TOO_LONG`.

### `GET /mock/orders/:orderId`

Mock endpoint simulující API pro sledování objednávek (volá ho interně
`order.service.js`, ale jde zavolat i přímo pro testování). Vrací náhodný stav
objednávky (`processing` / `shipped` / `delivered` / `cancelled`) a náhodně
(nebo deterministicky) simuluje chyby – viz níže.

## Intenty

| Intent | Spouští se na | Chování |
|---|---|---|
| `track_order` | `track`, `order`, `stav objednávky`, `zásilka`, `balík`, ... | Multi-turn – zeptá se na číslo objednávky, pak zavolá mock API |
| `check_weather` | `weather`, `počasí`, `prší`, `forecast`, `teplota` | Multi-turn – zeptá se na město, geocoding + Open-Meteo forecast |
| `help` | `help`, `pomoc`, `co umíš`, `nápověda` | Statická odpověď |
| `fallback` | nic nematchne | Po 5 fallbacích za sebou automaticky nabídne `help` |

Regex patterny jsou seřazené od nejspecifičtějších po `help` (matchuje skoro
cokoliv, musí být poslední). Regex má vždy prioritu před rozdělaným multi-turn
flow – to je záměrný "escape hatch" (uživatel může kdykoliv přerušit
rozdělaný dotaz novým intentem).

## Testování fallbacků na `track_order`

Mock endpoint podporuje deterministické vyvolání chyby přes `orderId`:

- `orderId: "timeout"` – vždy zpozdí odpověď o `timeouts.orderApi + 2000` ms (déle,
  než klient čeká) → vyvolá `TimeoutError`
- `orderId: "error500"` – vždy vrátí `500` → vyvolá `ApiError`
- cokoliv jiného – 10 % šance na náhodnou chybu, 5 % šance na náhodný timeout

Po chybě zůstává `track_order` v pending stavu se zapamatovaným `orderId` –
jakákoliv další zpráva (i "zkus znovu") zopakuje dotaz na stejné číslo
objednávky bez nutnosti ho psát znovu.

## Známá omezení (vědomě neřešeno – mimo rozsah projektu)

- **Regex nerozumí negaci.** `"nechci sledovat objednávku"` matchne `track_order`
  stejně jako `"sleduj mou objednávku"`. Keyword-based routing bez ML tohle
  neumí odlišit.
- **Skloňování českých měst.** Open-Meteo geocoding hledá jen podle 1. pádu a na
  skloněné tvary (`"Praze"`) může fuzzy-matchnout na nesouvisející místo. Pokrytá
  je jen malá tabulka nejběžnějších měst (`src/services/geocoding.service.js`),
  zbytek zůstává zdokumentovaným omezením.
- **Extrakce města z věty** je naivní regex (slovo za předložkou `v`/`ve`/`pro`),
  ne skutečné NLP – u složitějších vět (víc měst, jiné předložky) může selhat.

## Struktura projektu

```
config/index.js          – jediné místo čtoucí process.env
src/
  app.js, index.js        – Express app, start serveru, cleanup session store
  middleware/validate.js  – validace request body
  router/intent.router.js – regex matching + multi-turn routing rozhodovací strom
  intents/                – track_order, check_weather, help, fallback handlery
  services/                – order/weather/geocoding – volání navenek
  mock/orders.mock.js      – mock Express route pro track_order
  session/session.store.js – in-memory Map + TTL cleanup
  utils/{http,errors,logger}.js – HTTP klient, error třídy, winston logger
```
