const oracledb = require("oracledb");
const dbConfig = require("./dbconfig2.js");

async function run() {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    console.log("Connecté à la base de données Oracle");

    // Create a table

    await connection.execute(`begin
                                execute immediate 'drop table a_faire';
                                exception when others then if sqlcode <> -942 then raise; end if;
                              end;`);

    await connection.execute(`create table a_faire (
                                id_afaire number generated always as identity,
                                tache varchar2(4000),
                                date_creation timestamp with time zone default current_timestamp,
                                fait number(1,0),
                                primary key (id_afaire))`);

    // Insertion des tâches dans la table

    const sql = `insert into a_faire (tache, fait) values(:1, :2)`;

    const rows = [
      ["Tâche 1", 0],
      ["Tâche 2", 0],
      ["Tâche 3", 1],
      ["Tâche 4", 0],
      ["Tâche 5", 1],
    ];

    let result = await connection.executeMany(sql, rows);

    console.log(result.rowsAffected, "Rangées insérées.");

    connection.commit();

    // Effectuer une requête sur les tâches

    result = await connection.execute(
      `select tache, fait from a_faire`,
      [],
      { resultSet: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rs = result.resultSet;
    let row;

    while ((row = await rs.getRow())) {
      if (row.FAIT) console.log(row.TACHE, "es fait");
      else console.log(row.TACHE, "est NOT complétée");
    }

    await rs.close();
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

run();
