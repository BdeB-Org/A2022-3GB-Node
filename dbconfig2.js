// Copyright (c) 2015, 2024, Oracle and/or its affiliates.
// les variables de configuration devraient être stockées dans ce fichier de configuration
// ou dans des variables d'environnement
module.exports = {
  // remplacer les valeurs ci-dessous par les valeurs de votre base de données
  // user : nom d'utilisateur soit pour la plupart d'entre vous "commande"
  user: process.env.NODE_ORACLEDB_USER || "commande",

  // password: mot de passe de votre utilisateur pour la plupart d'entre vous "oracle"
  password: process.env.NODE_ORACLEDB_PASSWORD || "oracle",

  // connectString : adresse de votre base de données, pour la plupart d'entre vous:
  //  "localhost/freepdb1" ou "localhost/orclpdb1"
  // Pour p,lus d'information sur les chaines de connexion, voir:
  // https://oracle.github.io/node-oracledb/doc/api.html#connectionstrings
  connectString: "localhost/orclpdb1",
};
