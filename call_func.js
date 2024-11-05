const http = require("http"); // import http qui est un module qui permet d'utiliser des méthodes de serveur http
const fs = require("fs");
const oracledb = require("oracledb");
const logger = require("./logger"); //module pour logger
const dbConfig = require("./dbconfig2.js");
const hostname = "localhost"; //On déclare l'adresse du serveur web sur lequel le serveur va écouter
const port = 3010; //On déclare le port

logger.log("debug", "Allo, Winston!");

const server = http.createServer((req, res) => {
  logger.log(
    "info",
    `Le serveur a reçu une requête de URL : http://${hostname}:${port} requete:req.url`
  );
  let requeteHTTP = req.url.slice(1); // enleve le / de depart de la requete
  let parametres = requeteHTTP.split("/"); // Va créer un tableau contenant chaque élément de la requete URL
  //Ce qui va s'afficher pour tester le fonctionnement du serveur
  logger.log(
    "info",
    `Requête http: ${requeteHTTP} \n - parametres: ${parametres} \n - nbre de parametres: ${parametres.length}`
  );

  if (req.method == "POST") {
    extractBody(req, res, selectRoute);
  } else {
    //Fonction qui va extraire la route des parametres de la requete
    selectRoute(req, res, null);
  }
});

async function selectRoute(req, res, body) {
  let parametres = req.url.slice(1).split("/");
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (parametres.length >= 1) {
    //Si le parametre est emp, on fait appel à la méthode requeteEmp
    if (parametres[0] == "emp") {
      logger.log("info", "route emp");
      requeteEmp(parametres[1], function (erreur, data) {
        if (erreur) {
          logger.error("Erreur de route: emp");
          res.writeHead(404, { "Content-Type": "text/html" });
          res.end(content, "utf-8");
        } else {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(data));
        }
      });
    } else if (parametres[0] == "login") {
      logger.log("info", "route login");

      const params = new URLSearchParams(body);
      let utilisateur = params.get("utilisateur");
      let mdp = params.get("mdp");
      logger.log("info", "Appel de la méthode login");
      login(utilisateur, mdp, function (erreur, data) {
        if (erreur) {
          res.writeHead(404, { "Content-Type": "text/html" });
          res.end(content, "utf-8");
        } else {
          if (data == "" || data == "[]") {
            logger.log("Info", "utilisateur existe pas");
          } else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            fs.readFile("ConnexionReussie.html", function (err, data) {
              res.write(utilisateur + " est connecté");
              res.write(data);
            });
          }
        }
      });
    } else if (parametres[0] == "logout") {
      logger.log("info", "route logout");
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      res.write(" logout");
    } else if (parametres[0] == "inscription") {
      //Lorsque la requête correspond à l'inscription, on déclarer chaque champ à saisir
      logger.log("info", "route inscription");
      const params = new URLSearchParams(body);
      let util_id = params.get("util_id"); //On va chercher le id de l utilisateur créé
      let mdpUtil = params.get("mdp"); //On va chercher le mot de passe
      let mdpUtilB = params.get("mdpb"); //On s'assure que le mdp est correct en le saisissant une seconde fois
      let prenom = params.get("prenom"); //On va chercher le prenom
      let nom = params.get("nom"); //On va chercher le nom
      let email = params.get("email"); //On va chercher l'email
      //TEST
      console.log("Votre mdp " + mdp);
      console.log("Votre utilisateur " + utilisateur);
    }
  }
}

async function requeteEmp(empno, repondreHTTP) {
  console.log("entrerRequeteEmp :" + empno);

  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    console.log("Connexion réussi à la base de données Oracle");

    let result = "";
    let query = "";
    if (empno) {
      query = "SELECT * FROM emp where empno=:empno";
      result = await connection.execute(query, [empno]);
    } else {
      query = "SELECT * FROM emp";
      result = await connection.execute(query);
    }
    //console.log(result.rows);
    repondreHTTP(null, result.rows);
  } catch (err) {
    logger.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        logger.error(err);
      }
    }
  }
}

async function emp_dept() {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    logger.log("info", "Connexion réussi à la base de données Oracle");

    // Appel d'une fonction
    const result = await connection.execute(
      `BEGIN
        :ret := FN_AFFI_EMPL_JSON(20);
      END;`,
      {
        ret: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
      }
    );

    console.log(result.outBinds);
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        logger.error(err);
      }
    }
  }
}

//MAIN
server.listen(port, hostname, () => {
  logger.log(
    "info",
    `Le serveur roule à l'URL suivant: http://${hostname}:${port}/`
  );
});

//emp_dept();
