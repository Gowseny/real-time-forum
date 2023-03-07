package tools

import (
	"html/template"
	"net/http"
)

func HomePage(w http.ResponseWriter, r *http.Request) {

	if r.URL.Path != "/" {
		http.Error(w, "404 Page Not Found", 404)
		return
	}

	templ, err := template.ParseFiles("index.html")

	err = templ.Execute(w, "")

	if err != nil {
		http.Error(w, "Error with parsing index.html", http.StatusInternalServerError)
		return
	}

}
