//
const net = require('net');

//
const dataHandler = require('./../net/dataHandler.js');
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const hwInfo = require('./../hwInfo/hwInfo.js');
const netUtil = require('./../net/netUtil.js');
const util = require('./../utils/commonUtil.js');
const logger = require('./../utils/winlog.js');

//
let myRole = define.NODE_ROLE.STR.ISAG;
let message = "";
let separator = define.SOCKET_ARG.SEPARATOR;

let myClientIp = util.getMyCtrlIP();

const getMyClientIp = () => {
    return myClientIp;
}
module.exports.getMyClientIp = getMyClientIp;

const tcpClient = {
    port: config.SOCKET_INFO.BIND_ISAG_SEVER_PORT,
    host: config.SOCKET_INFO.BIND_ISAG_SEVER_HOST,
    localAddress: myClientIp,
    localPort: config.SOCKET_INFO.BIND_ISAG_CLIENT_PORT
}

module.exports.setMyRole = (role) => {
    myRole = role;
}

module.exports.getMyRole = () => {
    return myRole;
}

module.exports.isClient = async () => {
    logger.info("tcpClient : " + JSON.stringify(tcpClient));
    let isagSocket = net.connect(tcpClient, async function () {
        this.setEncoding(config.CMD_ENCODING.encoding);
        logger.info("[TCP] [IS] Connected");

        ////////////////////////////////////////////////////
        // Get My Info
        let myInfo = await hwInfo.getHwInfo(myRole);
        
        // Send My Info to IS
        netUtil.writeData(isagSocket, myInfo);
        ////////////////////////////////////////////////////
        
        this.on("data", async function (data) {
            message += data.toString();
            //Prevent packets from being split in
            let SeparatorIndex = message.indexOf(separator);
            let didComplete = SeparatorIndex !== -1;

            if (didComplete)
            {
                let msg = message.slice(0, SeparatorIndex);
                message = message.slice(SeparatorIndex + 1);

                // Command from IS
                await dataHandler.cmdChildProcess(isagSocket, msg, myRole);
            }
        });
        this.on("end", function () {
            logger.warn("[TCP] [IS] Client disconnected");
        });
        this.on("error", function (error) {
            logger.error("[TCP] [IS] " + "Socket Error : ", JSON.stringify(error));
        });
        this.on("timeout", function () {
            logger.warn("[TCP] [IS] " + "Socket Timed Out");
        });
        this.on("close", function () {
            logger.info("[TCP] [IS] " + "Socket Closed");
        });
    });

    return isagSocket;
}