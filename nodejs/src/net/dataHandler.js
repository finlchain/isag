//
const spawn = require('child_process').spawn;
const os = require('os');
const fork = require('child_process').fork;
const fs = require('fs');

//
const netUtil = require('./../net/netUtil.js');
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const dbUtil = require("./../db/dbUtil.js");
const dbFB = require("./../db/dbFB.js");
const dbNN = require("./../db/dbNN.js");
const dbIS = require("./../db/dbIS.js");
const dbRepl = require("./../db/dbRepl.js");
const dbFBHandler = require("./../db/dbFBHandler.js");
const sock = require('./../net/socket.js');
const util = require('./../utils/commonUtil.js');
const logger = require('./../utils/winlog.js');

//
const cmd = define.CMD_CTRL_NOTI;

// Net Conf
module.exports.saveNetConf = async (data) => {
    let role = data.data4;

    return role;
}

//
module.exports.saveReplInfoIS = async (replData) => {
    let clusterP2pAddr = replData.cluster_p2p_addr;
    
    let replBlkNum = replData.blk_num;
    let ip =  replData.ip;
    let logFile = replData.log_file;
    let logPos = replData.log_pos;

    let subNetId = clusterP2pAddr.slice(10, 14);

    // Slave
    logger.info("clusterP2pAddr : " + clusterP2pAddr + ", subNetId : " + subNetId);
    logger.info("ip : " + ip + ", logFile : " + logFile + ", logPos : " + logPos + ", replBlkNum : " + replBlkNum);
    await dbRepl.setReplSlaveIS(subNetId, ip, logFile, logPos);
}

//
module.exports.saveReplInfoNN = async (replData) => {
    let clusterP2pAddr = replData.cluster_p2p_addr;
    
    let replBlkNum = replData.blk_num;
    let ip =  replData.ip;
    let logFile = replData.log_file;
    let logPos = replData.log_pos;

    let subNetId = clusterP2pAddr.slice(10, 14);

    // Slave
    logger.info("clusterP2pAddr : " + clusterP2pAddr + ", subNetId : " + subNetId);
    logger.info("ip : " + ip + ", logFile : " + logFile + ", logPos : " + logPos + ", replBlkNum : " + replBlkNum);
    await dbRepl.setReplSlaveNN(subNetId, ip, logFile, logPos);

    // // Master
    // // let isagServerIdHex = '0x' + subNetId + define.NODE_ROLE.NUM.ISAG.toString();
    // // let isagServerId = parseInt(isagServerIdHex);
    // // logger.info("isagServerIdHex : " + isagServerIdHex + ", isagServerId : " + isagServerId);
    // let isagServerId = util.ipToInt(util.getMyReplIP().toString());
    // logger.info("isagServerId : " + isagServerId);
    
    // let res = await dbRepl.setReplMaster(isagServerId);

    // // 
    // dbFBHandler.setReplInfo(subNetId, replBlkNum, util.getMyReplIP().toString(), define.NODE_ROLE.NUM.ISAG, res.fileName, res.filePosition, clusterP2pAddr);

    // // 
    // let repl_res = {
    //     ip: util.getMyReplIP().toString(),
    //     kind: 'repl get',//msgKind + ' ' + splitMsg[cmdRedis.detail_kind],
    //     status: 'complete',
    //     data: res.fileName + ' ' + res.filePosition
    // }

    // netUtil.writeData(socket, JSON.stringify(repl_res));
}

//
module.exports.saveReplInfoMaster = async (clusterP2pAddr, replBlkNum, socket) => {
    // let clusterP2pAddr = replData.cluster_p2p_addr;
    
    // let replBlkNum = replData.blk_num;

    let subNetId = clusterP2pAddr.slice(10, 14);

    // Master
    let isagServerId = util.ipToInt(util.getMyReplIP().toString());
    logger.info("isagServerId : " + isagServerId);
    
    let res = await dbRepl.setReplMaster(isagServerId);

    // 
    dbFBHandler.setReplInfo(subNetId, replBlkNum, util.getMyReplIP().toString(), define.NODE_ROLE.NUM.ISAG, res.fileName, res.filePosition, clusterP2pAddr);

    // 
    let repl_res = {
        ip: util.getMyReplIP().toString(),
        kind: 'repl get',//msgKind + ' ' + splitMsg[cmdRedis.detail_kind],
        status: 'complete',
        data: res.fileName + ' ' + res.filePosition
    }

    netUtil.writeData(socket, JSON.stringify(repl_res));
}

//
module.exports.saveReplInfo = async (replData, socket) => {
    let clusterP2pAddr = replData.cluster_p2p_addr;
    
    let replBlkNum = replData.blk_num;
    let ip =  replData.ip;
    let logFile = replData.log_file;
    let logPos = replData.log_pos;

    let subNetId = clusterP2pAddr.slice(10, 14);

    // Slave
    logger.info("clusterP2pAddr : " + clusterP2pAddr + ", subNetId : " + subNetId);
    logger.info("ip : " + ip + ", logFile : " + logFile + ", logPos : " + logPos + ", replBlkNum : " + replBlkNum);
    await dbRepl.setReplSlaveNN(subNetId, ip, logFile, logPos);

    // Master
    // let isagServerIdHex = '0x' + subNetId + define.NODE_ROLE.NUM.ISAG.toString();
    // let isagServerId = parseInt(isagServerIdHex);
    // logger.info("isagServerIdHex : " + isagServerIdHex + ", isagServerId : " + isagServerId);
    let isagServerId = util.ipToInt(util.getMyReplIP().toString());
    logger.info("isagServerId : " + isagServerId);
    
    let res = await dbRepl.setReplMaster(isagServerId);

    // 
    dbFBHandler.setReplInfo(subNetId, replBlkNum, util.getMyReplIP().toString(), define.NODE_ROLE.NUM.ISAG, res.fileName, res.filePosition, clusterP2pAddr);

    // 
    let repl_res = {
        ip: util.getMyReplIP().toString(),
        kind: 'repl get',//msgKind + ' ' + splitMsg[cmdRedis.detail_kind],
        status: 'complete',
        data: res.fileName + ' ' + res.filePosition
    }

    netUtil.writeData(socket, JSON.stringify(repl_res));
}

module.exports.cmdChildProcess = async (socket, msg, myRole) => {
    if (util.isJsonString(msg) === false)
    {
        return;
    }

    let msgJson = JSON.parse(msg);

    logger.info("Command from IS, myRole : " + myRole + ", msgJson.cmd : " + msgJson.cmd);
    logger.debug("msgJson.data : " + JSON.stringify(msgJson.data));

    //
    let splitMsg = msgJson.cmd.split(' ');
    //
    if (splitMsg[0] === cmd.rsp_prr)
    {
        if (splitMsg[1] !== cmd.rsp_prr_cmd.passed)
        {
            socket.destroy();
        }
    }

    // 0. net reset
    if (msgJson.cmd === cmd.req_reset)
    {
        //
    }
    // 1. net rerun
    else if (msgJson.cmd === cmd.req_rerun)
    {
        //
    }
    // 2. net update
    else if (msgJson.cmd === cmd.req_rr_update)
    {
        //
        let netDataJson = msgJson.data;
        logger.info("netDataJson.data1 : " + netDataJson.data1);

        if (config.DB_TEST_MODE_REPL === true)
        {
            // Replication Reset
            logger.info("Replication Slave Stop");
            await dbRepl.stopReplSlaves();
            logger.info("Replication Slave Reset");
            await dbRepl.resetReplSlaves();

            // Replication Set
            {
                //
                let p2pAddr = netDataJson.data1;
                let blkNum = netDataJson.data2;

                //
                let clusterP2pAddr = p2pAddr.slice(0,14);
                // let subNetId = clusterP2pAddr.slice(10, 14);

                // logger.info("clusterP2pAddr : " + clusterP2pAddr + ", subNetId : " + subNetId + ", blkNum : " + blkNum);

                let replDataArr = await dbIS.getReplData(blkNum, define.NODE_ROLE.NUM.NN, clusterP2pAddr);

                if (replDataArr.length)
                {
                    let replData = replDataArr[0];

                    await this.saveReplInfoNN(replData);
                    await this.saveReplInfoMaster(clusterP2pAddr, replData.blk_num, socket);

                    // Replication Start
                    logger.info("Replication Slave Start");
                    await dbRepl.startReplSlaves();
                }
            }
        }
    }
    // 3. node start
    else if (msgJson.cmd === cmd.req_node_start)
    {
        //
        if(config.DB_TEST_MODE)
        {
            //
            await dbFB.truncateFbDB();
            
            //
            await dbNN.truncateScDB();
            await dbNN.truncateBlockDB();
            await dbNN.truncateAccountDB();
        }
    }
    // 8. node kill
    else if (msgJson.cmd === cmd.req_node_kill)
    {
        // 
        if(config.DB_TEST_MODE)
        {
            //
            await dbFB.truncateFbDB();
            
            //
            await dbNN.truncateScDB();
            await dbNN.truncateBlockDB();
            await dbNN.truncateAccountDB();
        }
    }
    // 10. net save
    else if (msgJson.cmd === cmd.req_net_save)
    {
        //
        let netDataJson = msgJson.data;

        //
        let myRole = await this.saveNetConf(netDataJson);
        sock.setMyRole(myRole);
    }
    // 20. db truncate
    else if (msgJson.cmd === cmd.req_db_truncate)
    {
        logger.info("DB Truncate");
        // Replication Reset
        logger.info("Replication Slave Stop");
        await dbRepl.stopReplSlaves();
        logger.info("Replication Slave Reset");
        await dbRepl.resetReplSlaves();

        //
        await dbIS.truncateIsDB();
        //
        await dbFB.truncateFbDB();
        //
        await dbNN.truncateScDB();
        await dbNN.truncateBlockDB();
        await dbNN.truncateAccountDB();
    }
    // 21. replication set
    else if (msgJson.cmd === cmd.req_db_repl_set)
    {
        logger.info("Replication Slave Set");
        //
        let netDataJson = msgJson.data;
        let replDataArrIS = netDataJson.data1;
        let replDataArrNN = netDataJson.data2;
        let clusterP2pAddr = netDataJson.data3;
        let replBlkNum = netDataJson.data4;

        await this.saveReplInfoIS(replDataArrIS[0]);
        await util.asyncForEach(replDataArrNN, async (replDataNN, index) => {
            await this.saveReplInfoNN(replDataNN);
        });
        
        await this.saveReplInfoMaster(clusterP2pAddr, replBlkNum, socket);

        // if (replDataArr.length === 1) // NN only
        // {
        //     // Replication Data of NN with specific p2p address 
        //     let replData = replDataArr[0];

        //     await this.saveReplInfoNN(replData);

        // }
        // if (replDataArr.length === 2) // NN & IS
        // {
        //     // Replication Data of NN with specific p2p address 
        //     let replDataIS = replDataArr[0];
        //     let replDataNN = replDataArr[1];

        //     await this.saveReplInfoIS(replDataIS);
        //     await this.saveReplInfoNN(replDataNN);
        //     await this.saveReplInfoMaster(clusterP2pAddr, replBlkNum, socket);
        // }
        // else
        // {

        //     logger.error("Error - req_db_repl_set replSetArr.length : " + replDataArr.length);
        // }
    }
    // 22. replication get
    else if (msgJson.cmd === cmd.req_db_repl_get)
    {
        logger.info("Replication No Action");
        // No Action
    }
    // 23. replication stop
    else if (msgJson.cmd === cmd.req_db_repl_stop)
    {
        logger.info("Replication Slave Stop");
        await dbRepl.stopReplSlaves();
    }
    // 24. replication reset
    else if (msgJson.cmd === cmd.req_db_repl_reset)
    {
        logger.info("Replication Slave Reset");
        await dbRepl.resetReplSlaves();
    }
    // 25. replication start
    else if (msgJson.cmd === cmd.req_db_repl_start)
    {
        logger.info("Replication Slave Start");
        await dbRepl.startReplSlaves();
    }
    else
    {
        //
    }
}
