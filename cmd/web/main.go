package main

import (
	"errors"
	"html/template"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type Page struct {
	Route       string
	Template    string
	Title       string
	Description string
}

var pages = []Page{
	{Route: "/", Template: "index.html", Title: "Ratskeller Esslingen – fein & authentisch", Description: "Ratskeller Esslingen – fein & authentisch"},
	{Route: "/index.html", Template: "index.html", Title: "Ratskeller Esslingen – fein & authentisch", Description: "Ratskeller Esslingen – fein & authentisch"},
	{Route: "/philosophie.html", Template: "philosophie.html", Title: "Philosophie – Ratskeller Esslingen", Description: "Philosophie des Ratskeller Esslingen"},
	{Route: "/speisen.html", Template: "speisen.html", Title: "Speisen – Ratskeller Esslingen", Description: "Speisen und Tageskarte des Ratskeller Esslingen"},
	{Route: "/reservierung.html", Template: "reservierung.html", Title: "Reservierung – Ratskeller Esslingen", Description: "Reservierung im Ratskeller Esslingen"},
	{Route: "/anreise.html", Template: "anreise.html", Title: "Anreise – Ratskeller Esslingen", Description: "Anreise zum Ratskeller Esslingen"},
	{Route: "/events.html", Template: "events.html", Title: "Events – Ratskeller Esslingen", Description: "Events im Ratskeller Esslingen"},
	{Route: "/bewerbungen.html", Template: "bewerbungen.html", Title: "Bewerbungen – Ratskeller Esslingen", Description: "Bewerbungen im Ratskeller Esslingen"},
	{Route: "/impressum.html", Template: "impressum.html", Title: "Impressum – Ratskeller Esslingen", Description: "Impressum Ratskeller Esslingen"},
	{Route: "/datenschutz.html", Template: "datenschutz.html", Title: "Datenschutz – Ratskeller Esslingen", Description: "Datenschutz Ratskeller Esslingen"},
}

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{}))
	gin.SetMode(gin.ReleaseMode)

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(requestLogger(logger))

	staticRoot := envOrDefault("RK_STATIC_ROOT", "static")

	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	registerStatic(router, staticRoot)
	registerPages(router, staticRoot, logger)

	addr := envOrDefault("RK_ADDR", ":8080")
	logger.Info("starting ratskeller go ssr transition server", "addr", addr, "staticRoot", staticRoot)

	if err := router.Run(addr); err != nil {
		logger.Error("server stopped", "error", err)
		os.Exit(1)
	}
}

func registerPages(router *gin.Engine, staticRoot string, logger *slog.Logger) {
	for _, page := range pages {
		p := page
		router.GET(p.Route, func(c *gin.Context) {
			renderPage(c, staticRoot, p, logger)
		})
	}
}

func renderPage(c *gin.Context, staticRoot string, page Page, logger *slog.Logger) {
	path := filepath.Join(staticRoot, filepath.Clean(page.Template))
	tpl, err := template.ParseFiles(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			c.String(http.StatusNotFound, "page not found")
			return
		}

		logger.Error("template parse failed", "template", page.Template, "error", err)
		c.String(http.StatusInternalServerError, "template error")
		return
	}

	c.Header("Cache-Control", "no-cache")
	c.Status(http.StatusOK)

	if err := tpl.Execute(c.Writer, gin.H{
		"Title":       page.Title,
		"Description": page.Description,
		"Path":        c.Request.URL.Path,
	}); err != nil {
		logger.Error("template execute failed", "template", page.Template, "error", err)
	}
}

func registerStatic(router *gin.Engine, staticRoot string) {
	for _, dir := range []string{"css", "fonts", "Fonts", "img", "js", "pdf", "sandbox"} {
		absolute := filepath.Join(staticRoot, dir)
		if _, err := os.Stat(absolute); err == nil {
			router.Static("/"+dir, absolute)
		}
	}

	router.GET("/favicon.ico", func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})
}

func requestLogger(logger *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()

		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/css/") || strings.HasPrefix(path, "/js/") || strings.HasPrefix(path, "/img/") {
			return
		}

		logger.Info("http request",
			"method", c.Request.Method,
			"path", path,
			"status", c.Writer.Status(),
			"duration", time.Since(start).String(),
			"client", c.ClientIP(),
		)
	}
}

func envOrDefault(key string, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}
