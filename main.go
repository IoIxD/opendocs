package main

import (
	"encoding/json"
	"errors"
	"html/template"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
)

var mux map[string]func(http.ResponseWriter, *http.Request)

func main() {
	var err error
	handler := Server{}
	server := http.Server{
		Addr:        "0.0.0.0:8080",
		Handler:     &handler,
		ReadTimeout: 5 * time.Second,
	}

	handler.templates = make(map[string]*template.Template)
	handler.templates["index"], err = template.ParseFiles("pages/index.html")
	handler.templates["404"], err = template.ParseFiles("pages/404.html")
	if err != nil {
		log.Fatal(err)
	}

	mux = make(map[string]func(http.ResponseWriter, *http.Request))
	mux["/"] = handler.ServeIndex
	mux["/edit"] = handler.EditWebsocket
	mux["/js/shared_input.js"] = handler.ServeStatic
	err = server.ListenAndServe()
	if err != nil {
		log.Fatal(err)
	}
}

type Server struct {
	templates map[string]*template.Template
	clients   []*websocket.Conn
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if h, ok := mux[r.URL.String()]; ok {
		h(w, r)
		return
	} else {
		s.Serve404(w, r)
		return
	}
	// io.WriteString(w, "URL: "+r.URL.String())
}

func (s *Server) Serve404(w http.ResponseWriter, r *http.Request) {
	data := struct{}{}
	s.templates["404"].Execute(w, data)
}

func (s *Server) ServeStatic(w http.ResponseWriter, r *http.Request) {
	file, err := os.Open("pages/" + r.URL.String())
	if err != nil {
		if errors.Is(err, fs.ErrNotExist) {
			s.Serve404(w, r)
			return
		}
	}
	defer file.Close()

	io.Copy(w, file)
}

func (s *Server) ServeIndex(w http.ResponseWriter, r *http.Request) {
	data := struct {
		URL string
	}{
		r.Host + r.URL.Path,
	}
	s.templates["index"].Execute(w, data)
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func (s *Server) EditWebsocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}

	s.clients = append(s.clients, conn)
	appendedIndex := len(s.clients) - 1

	for {
		messageType, msg, err := conn.ReadMessage()
		if err != nil {
			log.Print(err)
			break
		}

		var result map[string]interface{}
		err = json.Unmarshal([]byte(msg), &result)
		if err != nil {
			log.Fatal(err)
		}

		// _, err := json.Marshal(result)
		// if err != nil {
		// log.Fatal(err)
		// }
		log.Print(result["type"], " message recieved")
		for _, client := range s.clients {
			client.WriteMessage(messageType, msg)
		}
	}

	s.clients[appendedIndex] = s.clients[len(s.clients)-1] // Copy last element to index i.
	s.clients[len(s.clients)-1] = nil                      // Erase last element (write zero value).
	s.clients = s.clients[:len(s.clients)-1]               // Truncate slice.

}
