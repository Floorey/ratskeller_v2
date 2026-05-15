# Ratskeller Go SSR Übergangslösung

Diese Variante ist bewusst klein gehalten: Die bestehende Website unter `static/` bleibt die Quelle. Ein Go/Gin-Server rendert die HTML-Dateien serverseitig und liefert Assets aus `static/css`, `static/js`, `static/img`, `static/fonts`, `static/pdf` und optional `static/sandbox` aus.

## Start lokal

```bash
git checkout go-ssr-transition
go mod tidy
go run ./cmd/web
```

Danach öffnen:

```text
http://localhost:8080/
```

Healthcheck:

```text
http://localhost:8080/healthz
```

## Konfiguration

```bash
RK_ADDR=:8080 RK_STATIC_ROOT=static go run ./cmd/web
```

- `RK_ADDR`: Adresse/Port, Default `:8080`
- `RK_STATIC_ROOT`: statischer Website-Ordner, Default `static`

## Ziel dieser Version

- Website schnell wieder stabil aus Go servieren
- keine Vermischung mit Admin-Backend, DB oder Astro
- später Admin/API sauber daneben entwickeln
- Assets und PDFs exakt aus der bestehenden Struktur nutzen

## Nächste sinnvolle Fixes

1. Gastronovi-Widget in eine Sandbox-Datei auslagern und erst nach Consent laden.
2. Gemeinsame Header/Footer-Templates extrahieren, sobald die Übergangslösung stabil läuft.
3. Logging um Request-ID/Trace-ID erweitern, sobald Admin/API dazukommt.
4. Optional Dockerfile ergänzen, wenn Deployment nicht per lokalem Binary laufen soll.
