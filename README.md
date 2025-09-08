# Mini Dashboard COVID-19

Este proyecto consiste en un mini-dashboard desarrollado en Next.js que consume datos de COVID-19 desde la API de [Disease.sh](https://disease.sh/)
y aplica varias transformaciones de datos para visualización.

## Cómo correr
```
  npm install
  npm run dev
```
El proyecto correrá por defecto en http://localhost:3000.

## Variables de entorno

Configura un archivo .env con las siguientes variables:
```
DISEASE_API_URL=https://disease.sh/v3/covid-19
WEBHOOK_URL=https://webhook.site/tu-id-unico
```
DISEASE_API_URL → URL base de la API de Disease.sh.

WEBHOOK_URL → Destino para enviar trazas de ejecución en tiempo real.

## Endpoints implementados

### 1. /api/covid/casesByPeriod

Agrega casos por periodo (day, week, month) dentro de un rango de fechas y país.

**Ejemplo:**
```
GET /api/covid/casesByPeriod?period=month&start=2021-01-01&end=2021-03-01&country=USA
```
**Response:**
```json
{
  "period": "month",
  "country": "all",
  "start": "2021-01-01",
  "end": "2021-03-01",
  "aggregated": {
    "2021-01": 1550000,
    "2021-02": 1250000,
    "2021-03": 900000
  }
}
```

### 2. /api/covid/countryList

Devuelve la lista de todos los países disponibles en la API para filtros de frontend.

**Ejemplo:**

```
GET /api/covid/countryList
```

**Response:**

```json
{
"countries": [
  "USA",
  "India",
  "Brazil",
  "UK",
  "Russia",
  "France",
  "Germany"
  ]
}
```

### 3. /api/covid/rateChange

Calcula la variación porcentual de casos entre periodos consecutivos, usando los datos agregados de casesByPeriod.

**Ejemplo:**

```
GET /api/covid/rateChange?period=month&start=2021-01-01&end=2021-03-01&country=USA
```

**Response:**
```json
{
  "period": "month",
  "country": "argentina",
  "start": "2021-01-01",
  "end": "2021-03-01",
  "rateChange": {
    "2021-01": null,
    "2021-02": 0.19,
    "2021-03": -0.28
  }
}
```

### 4. /api/covid/topCountries

Devuelve los países con mayor número de casos dentro de un rango de fechas.

**Ejemplo:**

```
GET /api/covid/topCountries?start=2021-01-01&end=2021-01-31&n=5
```

**Response:**

```json
[
  { "country": "USA", "cases": 1550000 },
  { "country": "India", "cases": 980000 },
  { "country": "Brazil", "cases": 870000 },
  { "country": "UK", "cases": 720000 },
  { "country": "Russia", "cases": 610000 }
]
```

## Transformaciones implementadas

- Agregación temporal → Casos sumados por periodo.

- Top-N por métrica → Ranking de países (topCountries).

- Rate Change (Variación porcentual) → Comparación de periodos consecutivos.


## Decisiones de diseño y trade-offs

- Se eligió Next.js por integrar backend y frontend en un solo proyecto.

- Disease.sh es gratuita, aunque limitada en granularidad histórica.

- Logs de ejecución guardados en JSONL (/logs/http_trace.jsonl) y enviados opcionalmente a WEBHOOK_URL.

- Transformaciones en backend para reducir carga de frontend.

- Validaciones de fechas y país para evitar errores de API externa.

## Declaración de uso de IA

Durante el desarrollo se utilizó ChatGPT (OpenAI, GPT-5) para:
  - Generar endpoints y utilidades de transformación.

  - Explicar fórmulas y escribir este README.

  - Sugerir decisiones de diseño y trade-offs.

  - Toda la implementación final fue revisada y adaptada manualmente.
