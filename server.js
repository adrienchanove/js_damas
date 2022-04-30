// Constant definitions
// Importing modules
const express = require("express");
const http = require('http');
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8080;
const { Server } = require("socket.io");
const io = new Server(server);

console.log("Server starting...");


// Variable definitions
let user = [];




function connect(socket, username) {
    let nbUserActive= 0;
    user.forEach(us => {
        if(us.active != false)
            nbUserActive++;
    });
    console.log("nb user actif : " + nbUserActive);
    if (nbUserActive >= 5) {
        socket.emit("chat system", {'info':"Le serveur est plein, veuillez patienter et reessayer plus tard.", 'action':"reload"});
        socket.disconnect();
        return false;
    }

    if (username == "" || username == null || username == undefined|| username.length > 15|| username.length < 1 || username == "null") {
        socket.emit("chat system", {'info':"Votre pseudo est invalide, veuillez recommencer.", 'action':"reload"});
        socket.disconnect();
        return false;
    }
    
    if (user.find(element => element.username == username)) {
        if (user.find(element => element.username == username).active != false) {
            socket.emit("chat system", {'info':"Ce pseudo est deja utilisé, choisissez un autre",'action':"reload"});
            socket.disconnect();
            return false;
        }
        user.find(element => element.username == username).active = socket;
        socket.emit("chat information", {'info':"Vous êtes connecté avec le pseudo " + username});
    }else{
        user.push({username: username, active: socket});
        socket.emit("chat information", {'info':"Vous êtes connecté avec le pseudo " + username});
    }
    console.log("User connected: " + username);
    return true;
}




// Routes definitions

// Static routes
app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));
app.use("/img", express.static(__dirname + "/img"));
app.use("/audio", express.static(__dirname + "/audio"));	


// Dynamic routes
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});







// Socket.io
//WebSocket


io.on('connection', (socket) => {
    socket.on('chat connect', (username) => {
        console.log('tentative de connexion de ' + username);

        // On verifie si le pseudo est valide et si il n'est pas deja utilisé
        if(connect(socket, username)){

            // On previent les autres utilisateurs qu'un nouveau utilisateur s'est connecté
            user.forEach(us => {
                if(us.active != false)
                    us.active.emit('chat information', {'info':username + " vient de se connecter."});
            });

            // Gestion des messages
            socket.on('chat message', (msg) => {
                user.forEach(us => {
                    if(us.active != false)
                        us.active.emit('chat message', {'username':username, 'message':msg}); 
                });
                console.log('message de ' + username +' : ' + msg);
            });

            // Gestion de la deconnexion
            socket.on('disconnect', () => {
                user.find(element => element.username == username).active = false;
                user.forEach(us => {
                    if(us.active != false)
                        us.active.emit('chat information', {'info': username+" vient de se deconnecter"});
                });
                console.log('deconnexion de ' + username);
                
                
            });
        }else{
            console.log("Erreur de connexion de " + username);
        }   
    });

});


//app.listen(port);
server.listen(port, () => {
    console.log("Server listening on port " + port);
});


