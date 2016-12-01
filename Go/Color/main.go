package main

import (
	"fmt"
	"html/template"
	"net/http"
	"math/rand"
	"regexp"
	"flag"
	"os"
	"io/ioutil"
)

type Page struct{
	Color string
	FCol  string
}

type Color struct {
    R, G, B float64
}

func (col Color) Hex() string {
    return fmt.Sprintf("#%02x%02x%02x", uint8(col.R*255.0+0.5), uint8(col.G*255.0+0.5), uint8(col.B*255.0+0.5))
}

func handle(w http.ResponseWriter, r *http.Request){
	color := r.URL.Path[1:]
	fgcol := "#FFFFFF"

	reg := regexp.MustCompile("(^[0-9A-Fa-f]{6}$)|(^[0-9A-Fa-f]{3}$)")

	match := reg.FindString(r.URL.Path[1:])

	if match == "" || len(match) <= 0 || color == "favicon.ico" || color == ""{
		cl := Color{
			R: rand.Float64(),
			G: rand.Float64(),
			B: rand.Float64(),
		}

		color = cl.Hex()
	}else {
		color = "#"+match

	}

	if color == "#FFFFFF" {
		fgcol = "#000000"
	}

	p := Page{Color: color, FCol: fgcol}

	t, err := template.ParseFiles("index.html")

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}


	err = t.Execute(w, p)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

}

func main(){

	if _, err := os.Stat("./index.html"); err != nil {
		ioutil.WriteFile("./index.html", []byte(site), 0644)
	}

	port := flag.Int("port", 8080, "The port to listen to")

	flag.Parse()

	http.HandleFunc("/", handle)
	fmt.Printf("Listening on port %d", *port)
	http.ListenAndServe(fmt.Sprintf(":%d",*port), nil)

}