//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const debug = require("./../utils/debug.js");
const dbUtil = require("./../db/dbUtil.js");
const dbIS = require("./../db/dbIS.js");
const logger = require('./../utils/winlog.js');

//
const dbConfig = config.MARIA_CONFIG;

/////////////////////////////////////////////////////////////
// Shard
const shardQuerys = {
    userQuerys: [
        "DROP USER IF EXISTS ",
        "CREATE USER ",
        "GRANT SELECT ON *.* TO ",
        "flush privileges",
    ]
}

module.exports.dropShardUser = async () => {
    let user;

    const conn = await dbUtil.getConn();

    await util.asyncForEach(config.CFG_PATH.MARIA.SHARD_USERS, async (element, index) => {
        user = element;
        logger.debug("SHARD user : " + user);

        await util.asyncForEach(shardQuerys.userQuerys, async (element2, index) => {
            if(index === define.DB_DEFINE.SHARD_USERS_QUERY_INDEX.DROP_USER_INDEX) {
                element2 += `'${user}'@'%'`;

                [query_result] = await conn.query(element2);
            }
        });
    });

    await dbUtil.releaseConn(conn);
}

module.exports.createShardUser = async () => {
    let user;
    let pwd;

    const conn = await dbUtil.getConn();

    await util.asyncForEach(config.CFG_PATH.MARIA.SHARD_USERS, async (element, index) => {
        user = element;
        pwd = config.CFG_PATH.MARIA.SHARD_USERS_PW[index];

        logger.debug("SHARD user : " + user + ", pw : " + pwd);

        await util.asyncForEach(shardQuerys.userQuerys, async (element, index) => {
            if(index === define.DB_DEFINE.SHARD_USERS_QUERY_INDEX.DROP_USER_INDEX) {
                element += `'${user}'@'%'`;
            } else if(index === define.DB_DEFINE.SHARD_USERS_QUERY_INDEX.CREATE_USER_INDEX) {
                element += `'${user}'@'%' IDENTIFIED BY '${pwd}'`;
            } else if(index === define.DB_DEFINE.SHARD_USERS_QUERY_INDEX.GRANT_ALL_INDEX) {
                element += `'${user}'@'%' WITH GRANT OPTION`;
            }
                            
            [query_result] = await conn.query(element);
        });
    });

    await dbUtil.releaseConn(conn);
}

module.exports.dropShardServers = async () => {
    const conn = await dbUtil.getConn();

    let queryV = "SELECT Server_name FROM mysql.servers";

    [query_result] = await conn.query(queryV);
    //console.log(query_result);

    logger.debug("mysql.servers length : " + query_result.length);
    for(var i = 0; i < query_result.length; i++)
    {
        // for ( var keyNm in query_result[i]) {
        //     logger.debug("key : " + keyNm + ", value : " + query_result[i][keyNm]);
        // }

        queryV = "DROP SERVER if exists " + query_result[i]['Server_name'];
        logger.debug("queryV : " + queryV);
        await conn.query(queryV);
    }

    await dbUtil.releaseConn(conn);
}

module.exports.createShardServers = async () => {
    let user;
    let pwd;
    let port;

    const conn = await dbUtil.getConn();

    await util.asyncForEach(config.CFG_PATH.MARIA.SHARD_USERS, async (element, index) => {
        user = element;
        pwd = config.CFG_PATH.MARIA.SHARD_USERS_PW[index];
        port = dbConfig.port;

        // let ipArr = await dbUtil.getISAgIPs();
        // let subNetIdArr = await dbUtil.getISAgSubNetIds();
        let ipArr = new Array();
        let subNetIdArr = new Array();

        ipArr.push(config.SOCKET_INFO.BIND_ISAG_SEVER_HOST);
        subNetIdArr.push(define.P2P_DEFINE.P2P_SUBNET_ID_IS);

        logger.debug("nnaIPs.length : " + ipArr.length);

        await util.asyncForEach(ipArr, async (ip, index) => {
            //logger.debug("index : " + index + ", ip :" + ip);
            let queryV = `CREATE SERVER shard_db_${subNetIdArr[index]} `
                    + `FOREIGN DATA WRAPPER mysql `
                    + `OPTIONS(`
                    + `HOST '${ip}',`
                    + `USER '${user}',`
                    + `PASSWORD '${pwd}',`
                    + `PORT ${port}` + ")";
            
            logger.debug("createShardServers query : " + queryV);
            await conn.query(queryV);
        });
    });

    await dbUtil.releaseConn(conn);
}

const createShardTables = async () => {
    let ret;
    // let subNetIdArr = await keyUtil.getNnaSubNetIds();
    let subNetIdArr = new Array();
    subNetIdArr.push(define.P2P_DEFINE.P2P_SUBNET_ID_IS);

    const conn = await dbUtil.getConn();

    try {
        // is database
        let sql = dbIS.querys.is.useIS;
        await conn.query(sql);

        await util.asyncForEach(dbIS.createTables.isQuerys, async(element, index) => {
            //logger.debug("element : " + element);
            element = util.stringReplace(element, `${dbUtil.tableAppendix.tableName}`, `${dbIS.createTableNames.isQuerys[index]}${dbUtil.tableAppendix.shard_exp}`);
            element = util.stringReplace(element, `${dbUtil.tableAppendix.appendix}`, `${dbUtil.tableAppendix.spider} "${dbIS.createTableNames.isQuerys[index]}"'`);
            element += `${dbUtil.tableAppendix.partition}`;
            element += `(`;
            await util.asyncForEach(subNetIdArr, async (subNetId, index) => {
                //logger.debug("index : " + index + ", subNetId :" + subNetId);
                element += `PARTITION shard_${subNetId} COMMENT = 'srv "shard_db_${subNetId}"'`;

                if(index < (subNetIdArr.length-1))
                {
                    element += `, `;
                }
            });
            element += `)`;
            logger.debug("createShardTables isQuerys : " + element);
            await conn.query(element);
        });
        
        ret = { res : true };
        logger.debug("Database Init - shard");
    } catch (error) {
        debug.error(error);
        ret = { res : false, reason : JSON.stringify(error)};
    }

    await dbUtil.releaseConn(conn);

    return ret;
}

module.exports.initShard = async () => {
    // Server Side
    // await this.createShardUser();

    // Client Side
    await this.dropShardServers();
    await this.createShardServers();

    await createShardTables();
}