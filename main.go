package main

import (
	"log"
	"net/http"
	"time"

	"github.com/ioixd/opendocs/server"
)

func main() {
	handler, err := server.New()
	if err != nil {
		log.Fatalln(err)
	}
	server := http.Server{
		Addr:        ":8080",
		Handler:     handler,
		ReadTimeout: 5 * time.Second,
	}
	err = server.ListenAndServe()
	if err != nil {
		log.Fatalln(err)
	}
}
