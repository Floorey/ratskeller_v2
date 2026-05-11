# Ratskeller Static Page – Arbeitsanleitung

Dieses Repository enthält den aktuellen statischen Stand der Website.

Der spätere Server/Webhost kann noch wechseln.  
Aktuell wichtig ist vor allem, dass die Dateien sauber ersetzt werden können.

---

## 1. Ordnerstruktur

Aktueller Aufbau:

```txt
.
├── static/
│   ├── index.html
│   ├── speisen.html
│   └── css/
│       ├── main.css
│       └── mobile.css
└── README.md
```

Später können zusätzlich Ordner für Bilder und PDFs vorhanden sein:

```txt
static/
├── img/
│   └── beispielbild.jpg
├── pdf/
│   └── speisekarte.pdf
├── css/
│   ├── main.css
│   └── mobile.css
├── index.html
└── speisen.html
```

---

## 2. Wichtige Regel beim Ersetzen von Dateien

Wenn eine Datei ersetzt wird, muss sie **genau gleich heißen** wie die alte Datei.

Das gilt besonders für:

```txt
Bilder
PDF-Dateien
CSS-Dateien
HTML-Dateien
```

Beispiel:

Wenn die Website diese Datei erwartet:

```txt
static/pdf/speisekarte.pdf
```

Dann muss die neue PDF wieder genau so heißen:

```txt
speisekarte.pdf
```

Nicht erlaubt wäre zum Beispiel:

```txt
Speisekarte.pdf
speisekarte-neu.pdf
speisekarte_2026.pdf
karte.pdf
```

Sonst findet die Website die Datei nicht mehr.

---

## 3. Groß- und Kleinschreibung beachten

Dateinamen müssen exakt stimmen.

Diese Dateien sind für den Server unterschiedlich:

```txt
speisekarte.pdf
Speisekarte.pdf
SPEISEKARTE.PDF
```

Auf Linux-Webservern ist das wichtig.  
Ein falscher Buchstabe kann schon reichen, damit der Link nicht funktioniert.

---

## 4. Wo müssen Dateien rein?

### HTML-Dateien

HTML-Dateien liegen direkt in:

```txt
static/
```

Beispiele:

```txt
static/index.html
static/speisen.html
```

---

### CSS-Dateien

CSS-Dateien liegen in:

```txt
static/css/
```

Beispiele:

```txt
static/css/main.css
static/css/mobile.css
```

---

### Bilder

Bilder sollten in:

```txt
static/img/
```

Beispiele:

```txt
static/img/logo.png
static/img/hero.jpg
static/img/restaurant-aussen.jpg
```

Wichtig:  
Wenn ein Bild ersetzt wird, muss der neue Dateiname exakt gleich bleiben.

---

### PDFs

PDF-Dateien sollten in:

```txt
static/pdf/
```

Beispiele:

```txt
static/pdf/speisekarte.pdf
static/pdf/tageskarte.pdf
```

Wichtig:  
Wenn eine PDF ersetzt wird, muss der neue Dateiname exakt gleich bleiben.

---

## 5. Änderungen über GitHub prüfen

In GitHub können Änderungen über die Commits geprüft werden.

### Schritt 1: Repository öffnen

![GitHub Repository öffnen](docs/readme/01-repository.png)

---

### Schritt 2: Auf „Commits“ klicken

Dort sieht man die bisherigen Änderungen.

![Commits öffnen](docs/readme/02-commits.png)

---

### Schritt 3: Einen Commit öffnen

Im Commit sieht man, welche Dateien geändert wurden.

![Commit öffnen](docs/readme/03-commit-open.png)

---

### Schritt 4: „Files changed“ prüfen

Unter `Files changed` sieht man die betroffenen Dateien.

![Files changed prüfen](docs/readme/04-files-changed.png)

Beispiel:

```txt
static/index.html
static/speisen.html
static/css/main.css
static/css/mobile.css
```

Nur diese Dateien müssen dann geprüft oder ersetzt werden.

---

## 6. Dateien richtig ersetzen

Wenn eine Datei ersetzt werden soll:

1. Alte Datei suchen
2. Neue Datei exakt gleich benennen
3. Neue Datei in denselben Ordner legen
4. Alte Datei ersetzen
5. Website lokal oder online testen

Beispiel:

Alte Datei:

```txt
static/pdf/speisekarte.pdf
```

Neue Datei muss wieder heißen:

```txt
static/pdf/speisekarte.pdf
```

Nicht:

```txt
static/pdf/speisekarte-neu.pdf
```

---

## 7. Lokaler Test

Zum Testen kann lokal ein einfacher Webserver gestartet werden:

```bash
cd static
python3 -m http.server 8080
```

Dann im Browser öffnen:

```txt
http://localhost:8080
```

---

## 8. Upload auf Webhosting / Hetzner Web-FTP

Beim Webhosting wird normalerweise der Inhalt von `static/` in den öffentlichen Webordner hochgeladen.

Also nicht unbedingt der Ordner `static` selbst, sondern dessen Inhalt:

```txt
index.html
speisen.html
css/
img/
pdf/
```

Der Zielordner beim Webhost kann je nach System z. B. so heißen:

```txt
public
public_html
html
htdocs
www
```

Die `index.html` muss direkt in diesem öffentlichen Ordner liegen.

Richtig:

```txt
public/index.html
public/speisen.html
public/css/main.css
public/pdf/speisekarte.pdf
```

Falsch wäre meistens:

```txt
public/static/index.html
```

Außer der Webhost wurde ausdrücklich so konfiguriert.

---

## 9. Was darf nicht fehlen?

Vor dem Upload prüfen:

```txt
index.html vorhanden?
speisen.html vorhanden?
css/main.css vorhanden?
css/mobile.css vorhanden?
PDF-Dateien im richtigen Ordner?
Bilder im richtigen Ordner?
Dateinamen exakt gleich?
Groß-/Kleinschreibung korrekt?
```

---

## 10. Wichtigster Merksatz

Wenn eine Datei auf der Website ersetzt wird:

> Gleicher Ordner. Gleicher Name. Gleiche Endung.

Beispiel:

```txt
hero.jpg bleibt hero.jpg
speisekarte.pdf bleibt speisekarte.pdf
main.css bleibt main.css
```

Wenn der Name geändert wird, muss auch der Link im HTML angepasst werden.
